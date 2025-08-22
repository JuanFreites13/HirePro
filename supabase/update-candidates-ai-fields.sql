-- ==================================================
-- ACTUALIZAR TABLA CANDIDATES PARA INTEGRACIÓN CON IA
-- ==================================================

-- Agregar campos de IA a la tabla candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_summary_updated_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(20) DEFAULT 'pending' CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'no_files'));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score BETWEEN 0 AND 1);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_last_processed_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_skills_extracted JSONB DEFAULT '[]'; -- Array de skills extraídos por IA
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_experience_years INTEGER; -- Años de experiencia calculados por IA
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_education_level VARCHAR(50); -- Nivel educativo detectado por IA
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}'; -- Metadatos adicionales de IA

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_candidates_ai_status ON candidates(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_score ON candidates(ai_confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_skills ON candidates USING GIN(ai_skills_extracted);

-- Trigger para actualizar ai_summary_updated_at cuando cambia ai_summary
CREATE OR REPLACE FUNCTION update_candidate_ai_summary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_summary IS DISTINCT FROM OLD.ai_summary THEN
    NEW.ai_summary_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_candidate_ai_summary_updated
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_ai_summary_timestamp();

-- ==================================================
-- FUNCIONES PARA MANEJAR RESÚMENES DE IA
-- ==================================================

-- Función para actualizar el resumen de IA de un candidato
CREATE OR REPLACE FUNCTION update_candidate_ai_summary(
  p_candidate_id INTEGER,
  p_summary TEXT,
  p_confidence_score DECIMAL(3,2),
  p_skills JSONB DEFAULT '[]',
  p_experience_years INTEGER DEFAULT NULL,
  p_education_level VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE candidates 
  SET 
    ai_summary = p_summary,
    ai_processing_status = 'completed',
    ai_confidence_score = p_confidence_score,
    ai_last_processed_at = NOW(),
    ai_skills_extracted = p_skills,
    ai_experience_years = p_experience_years,
    ai_education_level = p_education_level,
    ai_metadata = p_metadata
  WHERE id = p_candidate_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar candidato como en procesamiento de IA
CREATE OR REPLACE FUNCTION mark_candidate_ai_processing(p_candidate_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE candidates 
  SET 
    ai_processing_status = 'processing',
    ai_last_processed_at = NOW()
  WHERE id = p_candidate_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar candidato como fallido en procesamiento de IA
CREATE OR REPLACE FUNCTION mark_candidate_ai_failed(p_candidate_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE candidates 
  SET 
    ai_processing_status = 'failed',
    ai_last_processed_at = NOW()
  WHERE id = p_candidate_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- TRIGGER AUTOMÁTICO PARA PROCESAR ARCHIVOS NUEVOS
-- ==================================================

-- Función que se ejecuta cuando se sube un archivo nuevo
CREATE OR REPLACE FUNCTION trigger_ai_processing_on_file_upload()
RETURNS TRIGGER AS $$
DECLARE
  file_ext VARCHAR(10);
  processing_type VARCHAR(50);
  priority INTEGER := 5;
BEGIN
  -- Extraer extensión del archivo
  file_ext := LOWER(SUBSTRING(NEW.filename FROM '\.([^.]*)$'));
  
  -- Determinar tipo de procesamiento basado en la extensión
  CASE file_ext
    WHEN 'pdf', 'doc', 'docx', 'txt' THEN
      processing_type := 'file_analysis';
      priority := 3; -- Alta prioridad para CVs
    WHEN 'mp3', 'wav', 'ogg', 'm4a', 'aac' THEN
      processing_type := 'transcription';
      priority := 4;
    WHEN 'mp4', 'avi', 'mov', 'mkv', 'webm' THEN
      processing_type := 'transcription';
      priority := 4;
    WHEN 'jpg', 'jpeg', 'png', 'gif', 'bmp' THEN
      processing_type := 'file_analysis';
      priority := 6; -- Menor prioridad para imágenes
    ELSE
      processing_type := 'file_analysis';
      priority := 7; -- Menor prioridad para archivos desconocidos
  END CASE;
  
  -- Agregar a la cola de procesamiento
  INSERT INTO ai_processing_queue (
    candidate_id,
    attachment_id,
    processing_type,
    file_type,
    file_url,
    file_name,
    priority,
    processing_metadata
  ) VALUES (
    NEW.candidate_id,
    NEW.id,
    processing_type,
    file_ext,
    NEW.file_path, -- Asumiendo que file_path contiene la URL
    NEW.filename,
    priority,
    jsonb_build_object(
      'file_size', NEW.file_size,
      'uploaded_at', NEW.created_at,
      'uploaded_by', NEW.uploaded_by
    )
  );
  
  -- Marcar candidato como en procesamiento si no lo está ya
  UPDATE candidates 
  SET ai_processing_status = 'processing'
  WHERE id = NEW.candidate_id 
    AND ai_processing_status IN ('pending', 'no_files', 'failed');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en candidate_attachments
CREATE TRIGGER trigger_ai_processing_on_upload
  AFTER INSERT ON candidate_attachments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_processing_on_file_upload();

-- ==================================================
-- VISTA PARA OBTENER ESTADO DE PROCESAMIENTO DE IA
-- ==================================================

CREATE OR REPLACE VIEW candidate_ai_status AS
SELECT 
  c.id as candidate_id,
  c.name,
  c.email,
  c.ai_processing_status,
  c.ai_summary,
  c.ai_confidence_score,
  c.ai_skills_extracted,
  c.ai_experience_years,
  c.ai_education_level,
  c.ai_last_processed_at,
  c.ai_summary_updated_at,
  
  -- Estadísticas de archivos
  COUNT(ca.id) as total_files,
  COUNT(CASE WHEN ca.created_at > c.ai_last_processed_at OR c.ai_last_processed_at IS NULL THEN 1 END) as unprocessed_files,
  
  -- Estadísticas de cola de procesamiento
  COUNT(aq.id) as pending_tasks,
  COUNT(CASE WHEN aq.status = 'processing' THEN 1 END) as processing_tasks,
  COUNT(CASE WHEN aq.status = 'failed' THEN 1 END) as failed_tasks,
  
  -- Resúmenes de IA disponibles
  COUNT(ais.id) as ai_summaries_count,
  MAX(ais.confidence_score) as best_summary_confidence
  
FROM candidates c
LEFT JOIN candidate_attachments ca ON c.id = ca.candidate_id
LEFT JOIN ai_processing_queue aq ON c.id = aq.candidate_id AND aq.status IN ('pending', 'processing', 'failed')
LEFT JOIN candidate_ai_summaries ais ON c.id = ais.candidate_id
GROUP BY c.id, c.name, c.email, c.ai_processing_status, c.ai_summary, c.ai_confidence_score, 
         c.ai_skills_extracted, c.ai_experience_years, c.ai_education_level, 
         c.ai_last_processed_at, c.ai_summary_updated_at;

COMMENT ON VIEW candidate_ai_status IS 'Vista completa del estado de procesamiento de IA para candidatos';

-- ==================================================
-- FUNCIÓN PARA OBTENER CANDIDATOS PENDIENTES DE PROCESAMIENTO
-- ==================================================

CREATE OR REPLACE FUNCTION get_candidates_pending_ai_processing()
RETURNS TABLE (
  candidate_id INTEGER,
  candidate_name VARCHAR(255),
  total_files BIGINT,
  pending_tasks BIGINT,
  oldest_unprocessed_file TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    COUNT(ca.id) as total_files,
    COUNT(aq.id) as pending_tasks,
    MIN(ca.created_at) as oldest_file
  FROM candidates c
  LEFT JOIN candidate_attachments ca ON c.id = ca.candidate_id
  LEFT JOIN ai_processing_queue aq ON c.id = aq.candidate_id AND aq.status = 'pending'
  WHERE c.ai_processing_status IN ('pending', 'processing', 'failed')
    OR (ca.created_at > c.ai_last_processed_at OR c.ai_last_processed_at IS NULL)
  GROUP BY c.id, c.name
  HAVING COUNT(ca.id) > 0
  ORDER BY COUNT(aq.id) DESC, MIN(ca.created_at) ASC;
END;
$$ LANGUAGE plpgsql;

