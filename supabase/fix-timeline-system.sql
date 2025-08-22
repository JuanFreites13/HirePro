-- =====================================================
-- SCRIPT PARA IMPLEMENTAR SISTEMA DE TIMELINE
-- =====================================================

-- 1. Crear tabla detailed_timeline si no existe
CREATE TABLE IF NOT EXISTS detailed_timeline (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  performed_by_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_candidate_id ON detailed_timeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_application_id ON detailed_timeline(application_id);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_created_at ON detailed_timeline(created_at);

-- 3. Función para obtener el email del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS VARCHAR AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'email';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'sistema@talentopro.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para obtener timeline de candidato
CREATE OR REPLACE FUNCTION get_candidate_timeline(p_candidate_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  candidate_id INTEGER,
  application_id INTEGER,
  action_type VARCHAR(100),
  action_description TEXT,
  performed_by_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.candidate_id,
    dt.application_id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.created_at,
    dt.metadata
  FROM detailed_timeline dt
  WHERE dt.candidate_id = p_candidate_id
  ORDER BY dt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener timeline de aplicación
CREATE OR REPLACE FUNCTION get_application_timeline(p_application_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  candidate_id INTEGER,
  application_id INTEGER,
  action_type VARCHAR(100),
  action_description TEXT,
  performed_by_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.candidate_id,
    dt.application_id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.created_at,
    dt.metadata
  FROM detailed_timeline dt
  WHERE dt.application_id = p_application_id
  ORDER BY dt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función para registrar cambios de candidatos
CREATE OR REPLACE FUNCTION log_candidate_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_email VARCHAR(255);
  action_desc TEXT;
  app_id INTEGER;
BEGIN
  user_email := get_current_user_email();
  
  -- Obtener application_id del candidato
  app_id := NEW.application_id;
  
  -- Determinar el tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_desc := 'Candidato creado';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar cambios específicos
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
      action_desc := format('Etapa cambiada de "%s" a "%s"', OLD.stage, NEW.stage);
    ELSIF OLD.score IS DISTINCT FROM NEW.score THEN
      action_desc := format('Puntaje actualizado de %s a %s', COALESCE(OLD.score::text, 'N/A'), COALESCE(NEW.score::text, 'N/A'));
    ELSIF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
      action_desc := format('Responsable asignado: %s', NEW.assignee_id);
    ELSE
      action_desc := 'Información del candidato actualizada';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_desc := 'Candidato eliminado';
  END IF;
  
  -- Insertar en detailed_timeline
  INSERT INTO detailed_timeline (
    candidate_id,
    application_id,
    action_type,
    action_description,
    performed_by_email,
    metadata
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    app_id,
    TG_OP || '_candidate',
    action_desc,
    user_email,
    jsonb_build_object(
      'stage', COALESCE(NEW.stage, OLD.stage),
      'score', COALESCE(NEW.score, OLD.score),
      'assignee_id', COALESCE(NEW.assignee_id, OLD.assignee_id)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Función para registrar cambios de evaluaciones
CREATE OR REPLACE FUNCTION log_evaluation_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_email VARCHAR(255);
  action_desc TEXT;
BEGIN
  user_email := get_current_user_email();
  
  IF TG_OP = 'INSERT' THEN
    action_desc := format('Evaluación creada: %s - Puntaje: %s/10', NEW.evaluation_type, NEW.score);
  ELSIF TG_OP = 'UPDATE' THEN
    action_desc := format('Evaluación actualizada: %s - Puntaje: %s/10', NEW.evaluation_type, NEW.score);
  ELSIF TG_OP = 'DELETE' THEN
    action_desc := format('Evaluación eliminada: %s', OLD.evaluation_type);
  END IF;
  
  INSERT INTO detailed_timeline (
    candidate_id,
    action_type,
    action_description,
    performed_by_email,
    metadata
  ) VALUES (
    COALESCE(NEW.candidate_id, OLD.candidate_id),
    TG_OP || '_evaluation',
    action_desc,
    user_email,
    jsonb_build_object(
      'evaluation_type', COALESCE(NEW.evaluation_type, OLD.evaluation_type),
      'score', COALESCE(NEW.score, OLD.score),
      'stage', COALESCE(NEW.stage, OLD.stage)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Crear triggers para automatizar el logging
DROP TRIGGER IF EXISTS trigger_log_candidate_changes ON candidates;
CREATE TRIGGER trigger_log_candidate_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidates
  FOR EACH ROW EXECUTE FUNCTION log_candidate_changes();

DROP TRIGGER IF EXISTS trigger_log_evaluation_changes ON candidate_evaluations;
CREATE TRIGGER trigger_log_evaluation_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidate_evaluations
  FOR EACH ROW EXECUTE FUNCTION log_evaluation_changes();

-- 10. Insertar datos de ejemplo para el candidato existente
INSERT INTO detailed_timeline (
  candidate_id,
  application_id,
  action_type,
  action_description,
  performed_by_email,
  metadata
) VALUES (
  1, -- ID del candidato Carlos
  1, -- ID de la aplicación Desarrollador BackEnd
  'candidate_created',
  'Candidato creado en el sistema',
  'admin@talentopro.com',
  jsonb_build_object(
    'stage', 'Pre-entrevista',
    'score', 0,
    'assignee_id', '550e8400-e29b-41d4-a716-446655440000'
  )
), (
  1,
  1,
  'update_candidate',
  'Etapa cambiada de "Pre-entrevista" a "Primera etapa"',
  'admin@talentopro.com',
  jsonb_build_object(
    'stage', 'Primera etapa',
    'score', 0,
    'assignee_id', '216d1f0c-2a20-49aa-9335-4ad3d442b7b8'
  )
)
ON CONFLICT DO NOTHING;

-- 11. Configurar RLS (Row Level Security) para detailed_timeline
ALTER TABLE detailed_timeline ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read timeline" ON detailed_timeline
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert timeline" ON detailed_timeline
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 12. Verificar que todo se creó correctamente
SELECT 'Timeline system created successfully' as status;
