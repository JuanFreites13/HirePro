-- ==================================================
-- CONFIGURACIÓN COMPLETA DE PROCESAMIENTO DE IA
-- Script unificado para implementar toda la infraestructura de IA
-- ==================================================

BEGIN;

-- ==================================================
-- 1. TABLAS PARA PROCESAMIENTO DE IA
-- ==================================================

-- Tabla para cola de procesamiento de IA
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  attachment_id INTEGER REFERENCES candidate_attachments(id) ON DELETE CASCADE,
  processing_type VARCHAR(50) NOT NULL CHECK (processing_type IN ('file_analysis', 'transcription', 'summary_generation', 'candidate_creation')),
  file_type VARCHAR(20), -- 'pdf', 'audio', 'video', 'image', 'text'
  file_url TEXT,
  file_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 = más alta prioridad
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  processing_metadata JSONB DEFAULT '{}', -- Metadatos específicos del tipo de procesamiento
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para almacenar resúmenes de IA de candidatos
CREATE TABLE IF NOT EXISTS candidate_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  summary_type VARCHAR(50) NOT NULL CHECK (summary_type IN ('comprehensive', 'skills', 'experience', 'personality', 'fit_analysis')),
  summary_content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1), -- 0.0 a 1.0
  source_files JSONB DEFAULT '[]', -- Array de IDs de archivos que contribuyeron al resumen
  ai_model VARCHAR(100), -- Modelo de IA usado (gpt-4, gpt-3.5-turbo, etc.)
  tokens_used INTEGER,
  processing_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para transcripciones de archivos de audio/video
CREATE TABLE IF NOT EXISTS file_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id INTEGER REFERENCES candidate_attachments(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  language_detected VARCHAR(10), -- 'es', 'en', etc.
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  duration_seconds INTEGER,
  ai_service VARCHAR(50), -- 'whisper', 'google', 'azure', etc.
  processing_metadata JSONB DEFAULT '{}', -- Metadatos del servicio de transcripción
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para análisis de archivos (PDFs, documentos, etc.)
CREATE TABLE IF NOT EXISTS file_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id INTEGER REFERENCES candidate_attachments(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('cv_parsing', 'document_analysis', 'image_analysis')),
  extracted_data JSONB NOT NULL DEFAULT '{}', -- Datos extraídos del archivo
  structured_info JSONB DEFAULT '{}', -- Información estructurada (experiencia, educación, skills)
  raw_text TEXT, -- Texto extraído completo
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  ai_service VARCHAR(50), -- Servicio usado para el análisis
  processing_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ==================================================

-- Índices para ai_processing_queue
CREATE INDEX IF NOT EXISTS idx_ai_processing_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_processing_priority ON ai_processing_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_candidate ON ai_processing_queue(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_type ON ai_processing_queue(processing_type);

-- Índices para candidate_ai_summaries
CREATE INDEX IF NOT EXISTS idx_candidate_ai_summaries_candidate ON candidate_ai_summaries(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_ai_summaries_type ON candidate_ai_summaries(summary_type);
CREATE INDEX IF NOT EXISTS idx_candidate_ai_summaries_confidence ON candidate_ai_summaries(confidence_score DESC);

-- Índices para file_transcriptions
CREATE INDEX IF NOT EXISTS idx_file_transcriptions_attachment ON file_transcriptions(attachment_id);
CREATE INDEX IF NOT EXISTS idx_file_transcriptions_candidate ON file_transcriptions(candidate_id);

-- Índices para file_analyses
CREATE INDEX IF NOT EXISTS idx_file_analyses_attachment ON file_analyses(attachment_id);
CREATE INDEX IF NOT EXISTS idx_file_analyses_candidate ON file_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_file_analyses_type ON file_analyses(analysis_type);

-- ==================================================
-- 3. ACTUALIZAR TABLA CANDIDATES PARA IA
-- ==================================================

-- Agregar campos de IA a la tabla candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_summary_updated_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'no_files'));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2) 
  CHECK (ai_confidence_score BETWEEN 0 AND 1);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_last_processed_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_skills_extracted JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_experience_years INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_education_level VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}';

-- Índices para campos de IA en candidates
CREATE INDEX IF NOT EXISTS idx_candidates_ai_status ON candidates(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_score ON candidates(ai_confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_skills ON candidates USING GIN(ai_skills_extracted);

-- ==================================================
-- 4. TRIGGERS PARA UPDATED_AT
-- ==================================================

-- Trigger para ai_processing_queue
CREATE OR REPLACE FUNCTION update_ai_processing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_processing_updated_at ON ai_processing_queue;
CREATE TRIGGER trigger_ai_processing_updated_at
  BEFORE UPDATE ON ai_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_processing_updated_at();

-- Trigger para candidate_ai_summaries
CREATE OR REPLACE FUNCTION update_ai_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_summaries_updated_at ON candidate_ai_summaries;
CREATE TRIGGER trigger_ai_summaries_updated_at
  BEFORE UPDATE ON candidate_ai_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_summaries_updated_at();

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

DROP TRIGGER IF EXISTS trigger_candidate_ai_summary_updated ON candidates;
CREATE TRIGGER trigger_candidate_ai_summary_updated
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_ai_summary_timestamp();

-- ==================================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- ==================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_processing_queue
DROP POLICY IF EXISTS "Users can view processing tasks" ON ai_processing_queue;
CREATE POLICY "Users can view processing tasks" ON ai_processing_queue
  FOR SELECT USING (TRUE); -- Todos los usuarios autenticados pueden ver

DROP POLICY IF EXISTS "Services can manage processing tasks" ON ai_processing_queue;
CREATE POLICY "Services can manage processing tasks" ON ai_processing_queue
  FOR ALL USING (TRUE); -- Los servicios pueden manejar todo

-- Políticas para candidate_ai_summaries
DROP POLICY IF EXISTS "Users can view AI summaries" ON candidate_ai_summaries;
CREATE POLICY "Users can view AI summaries" ON candidate_ai_summaries
  FOR SELECT USING (TRUE); 

DROP POLICY IF EXISTS "Services can manage AI summaries" ON candidate_ai_summaries;
CREATE POLICY "Services can manage AI summaries" ON candidate_ai_summaries
  FOR ALL USING (TRUE);

-- Políticas para file_transcriptions
DROP POLICY IF EXISTS "Users can view transcriptions" ON file_transcriptions;
CREATE POLICY "Users can view transcriptions" ON file_transcriptions
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Services can manage transcriptions" ON file_transcriptions;
CREATE POLICY "Services can manage transcriptions" ON file_transcriptions
  FOR ALL USING (TRUE);

-- Políticas para file_analyses
DROP POLICY IF EXISTS "Users can view file analyses" ON file_analyses;
CREATE POLICY "Users can view file analyses" ON file_analyses
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Services can manage file analyses" ON file_analyses;
CREATE POLICY "Services can manage file analyses" ON file_analyses
  FOR ALL USING (TRUE);

-- ==================================================
-- 6. FUNCIONES HELPER PARA PROCESAMIENTO DE IA
-- ==================================================

-- Función para agregar un archivo a la cola de procesamiento
CREATE OR REPLACE FUNCTION enqueue_ai_processing(
  p_candidate_id INTEGER,
  p_attachment_id INTEGER,
  p_processing_type VARCHAR(50),
  p_file_type VARCHAR(20),
  p_file_url TEXT,
  p_file_name VARCHAR(255),
  p_priority INTEGER DEFAULT 5,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  queue_id UUID;
BEGIN
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
    p_candidate_id,
    p_attachment_id,
    p_processing_type,
    p_file_type,
    p_file_url,
    p_file_name,
    p_priority,
    p_metadata
  ) RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el siguiente item de la cola
CREATE OR REPLACE FUNCTION get_next_ai_processing_task()
RETURNS TABLE (
  id UUID,
  candidate_id INTEGER,
  attachment_id INTEGER,
  processing_type VARCHAR(50),
  file_type VARCHAR(20),
  file_url TEXT,
  file_name VARCHAR(255),
  processing_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.candidate_id,
    q.attachment_id,
    q.processing_type,
    q.file_type,
    q.file_url,
    q.file_name,
    q.processing_metadata
  FROM ai_processing_queue q
  WHERE q.status = 'pending'
    AND q.retry_count < q.max_retries
  ORDER BY q.priority ASC, q.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar una tarea como iniciada
CREATE OR REPLACE FUNCTION start_ai_processing_task(p_task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ai_processing_queue 
  SET 
    status = 'processing',
    started_at = NOW()
  WHERE id = p_task_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar una tarea como completada
CREATE OR REPLACE FUNCTION complete_ai_processing_task(
  p_task_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_success THEN
    UPDATE ai_processing_queue 
    SET 
      status = 'completed',
      completed_at = NOW(),
      error_message = NULL
    WHERE id = p_task_id;
  ELSE
    UPDATE ai_processing_queue 
    SET 
      status = CASE 
        WHEN retry_count + 1 >= max_retries THEN 'failed'
        ELSE 'pending'
      END,
      retry_count = retry_count + 1,
      error_message = p_error_message,
      started_at = NULL
    WHERE id = p_task_id;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

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

-- Función para obtener candidatos pendientes de procesamiento
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

-- ==================================================
-- 7. VISTA PARA ESTADO DE PROCESAMIENTO DE IA
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

-- ==================================================
-- 8. COMENTARIOS DE DOCUMENTACIÓN
-- ==================================================

COMMENT ON TABLE ai_processing_queue IS 'Cola de procesamiento para tareas de IA (transcripción, análisis, resúmenes)';
COMMENT ON TABLE candidate_ai_summaries IS 'Resúmenes generados por IA para candidatos';
COMMENT ON TABLE file_transcriptions IS 'Transcripciones de archivos de audio/video';
COMMENT ON TABLE file_analyses IS 'Análisis de contenido de archivos (PDFs, documentos, etc.)';
COMMENT ON VIEW candidate_ai_status IS 'Vista completa del estado de procesamiento de IA para candidatos';

-- ==================================================
-- 9. FUNCIÓN PARA LOGGING DE TIMELINE
-- ==================================================

-- Función para registrar acciones en el timeline
CREATE OR REPLACE FUNCTION log_timeline_action(
  p_entity_type VARCHAR(50),
  p_entity_id INTEGER,
  p_action_type VARCHAR(50),
  p_action_description TEXT,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_email VARCHAR(255) DEFAULT NULL,
  p_previous_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Insertar en la tabla de timeline detallado
  INSERT INTO detailed_timeline (
    entity_type,
    entity_id,
    action_type,
    action_description,
    performed_by,
    performed_by_email,
    previous_value,
    new_value,
    metadata,
    created_at
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action_type,
    p_action_description,
    p_performed_by,
    p_performed_by_email,
    p_previous_value,
    p_new_value,
    p_metadata,
    NOW()
  );
  
  -- Si es un candidato, también insertar en candidate_timeline
  IF p_entity_type = 'candidate' THEN
    INSERT INTO candidate_timeline (
      candidate_id,
      action_type,
      action_description,
      performed_by,
      performed_by_email,
      previous_value,
      new_value,
      metadata,
      created_at
    ) VALUES (
      p_entity_id,
      p_action_type,
      p_action_description,
      p_performed_by,
      p_performed_by_email,
      p_previous_value,
      p_new_value,
      p_metadata,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- Mensaje de confirmación
SELECT 'Infraestructura de IA configurada exitosamente' as message;
