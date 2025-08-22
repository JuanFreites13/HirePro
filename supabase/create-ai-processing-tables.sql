-- ==================================================
-- TABLAS PARA PROCESAMIENTO DE IA
-- ==================================================

-- Tabla para cola de procesamiento de IA
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  attachment_id UUID REFERENCES candidate_attachments(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para consultas eficientes
  INDEX idx_ai_processing_status (status),
  INDEX idx_ai_processing_priority (priority, created_at),
  INDEX idx_ai_processing_candidate (candidate_id),
  INDEX idx_ai_processing_type (processing_type)
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un candidato puede tener múltiples resúmenes del mismo tipo (versiones)
  INDEX idx_candidate_ai_summaries_candidate (candidate_id),
  INDEX idx_candidate_ai_summaries_type (summary_type),
  INDEX idx_candidate_ai_summaries_confidence (confidence_score DESC)
);

-- Tabla para transcripciones de archivos de audio/video
CREATE TABLE IF NOT EXISTS file_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID REFERENCES candidate_attachments(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  language_detected VARCHAR(10), -- 'es', 'en', etc.
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  duration_seconds INTEGER,
  ai_service VARCHAR(50), -- 'whisper', 'google', 'azure', etc.
  processing_metadata JSONB DEFAULT '{}', -- Metadatos del servicio de transcripción
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_file_transcriptions_attachment (attachment_id),
  INDEX idx_file_transcriptions_candidate (candidate_id)
);

-- Tabla para análisis de archivos (PDFs, documentos, etc.)
CREATE TABLE IF NOT EXISTS file_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID REFERENCES candidate_attachments(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('cv_parsing', 'document_analysis', 'image_analysis')),
  extracted_data JSONB NOT NULL DEFAULT '{}', -- Datos extraídos del archivo
  structured_info JSONB DEFAULT '{}', -- Información estructurada (experiencia, educación, skills)
  raw_text TEXT, -- Texto extraído completo
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  ai_service VARCHAR(50), -- Servicio usado para el análisis
  processing_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_file_analyses_attachment (attachment_id),
  INDEX idx_file_analyses_candidate (candidate_id),
  INDEX idx_file_analyses_type (analysis_type)
);

-- ==================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ==================================================

-- Trigger para ai_processing_queue
CREATE OR REPLACE FUNCTION update_ai_processing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trigger_ai_summaries_updated_at
  BEFORE UPDATE ON candidate_ai_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_summaries_updated_at();

-- ==================================================
-- POLÍTICAS RLS (Row Level Security)
-- ==================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_processing_queue
CREATE POLICY "Users can view their own processing tasks" ON ai_processing_queue
  FOR SELECT USING (
    candidate_id IN (
      SELECT id FROM candidates 
      WHERE email = auth.jwt() ->> 'email'
      OR TRUE -- Permitir a todos los usuarios autenticados por ahora
    )
  );

CREATE POLICY "Users can insert processing tasks" ON ai_processing_queue
  FOR INSERT WITH CHECK (TRUE); -- Los servicios internos pueden insertar

CREATE POLICY "Users can update processing tasks" ON ai_processing_queue
  FOR UPDATE USING (TRUE); -- Los servicios pueden actualizar el estado

-- Políticas para candidate_ai_summaries
CREATE POLICY "Users can view AI summaries" ON candidate_ai_summaries
  FOR SELECT USING (TRUE); -- Todos pueden ver resúmenes

CREATE POLICY "Services can manage AI summaries" ON candidate_ai_summaries
  FOR ALL USING (TRUE); -- Los servicios pueden manejar resúmenes

-- Políticas para file_transcriptions
CREATE POLICY "Users can view transcriptions" ON file_transcriptions
  FOR SELECT USING (TRUE);

CREATE POLICY "Services can manage transcriptions" ON file_transcriptions
  FOR ALL USING (TRUE);

-- Políticas para file_analyses
CREATE POLICY "Users can view file analyses" ON file_analyses
  FOR SELECT USING (TRUE);

CREATE POLICY "Services can manage file analyses" ON file_analyses
  FOR ALL USING (TRUE);

-- ==================================================
-- FUNCIONES HELPER PARA PROCESAMIENTO DE IA
-- ==================================================

-- Función para agregar un archivo a la cola de procesamiento
CREATE OR REPLACE FUNCTION enqueue_ai_processing(
  p_candidate_id INTEGER,
  p_attachment_id UUID,
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
  attachment_id UUID,
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

COMMENT ON TABLE ai_processing_queue IS 'Cola de procesamiento para tareas de IA (transcripción, análisis, resúmenes)';
COMMENT ON TABLE candidate_ai_summaries IS 'Resúmenes generados por IA para candidatos';
COMMENT ON TABLE file_transcriptions IS 'Transcripciones de archivos de audio/video';
COMMENT ON TABLE file_analyses IS 'Análisis de contenido de archivos (PDFs, documentos, etc.)';

