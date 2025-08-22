-- =====================================================
-- SISTEMA DE AUTOMATIZACIÓN DEL TIMELINE
-- =====================================================
-- Este script crea triggers y funciones para registrar automáticamente
-- todos los cambios importantes en el timeline
-- =====================================================

-- 1. Función para obtener el usuario actual
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para obtener el usuario actual UUID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para registrar cambios en candidatos
CREATE OR REPLACE FUNCTION log_candidate_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
BEGIN
  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'candidate_created';
    action_desc := 'Candidato creado: ' || NEW.name || ' para la posición ' || NEW.position;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'candidate_updated';
    
    -- Detectar cambios específicos
    IF OLD.stage != NEW.stage THEN
      action_desc := 'Candidato movido de "' || OLD.stage || '" a "' || NEW.stage || '"';
    ELSIF OLD.score != NEW.score THEN
      action_desc := 'Puntuación actualizada de ' || OLD.score || ' a ' || NEW.score;
    ELSIF OLD.status != NEW.status THEN
      action_desc := 'Estado cambiado de "' || OLD.status || '" a "' || NEW.status || '"';
    ELSE
      action_desc := 'Información del candidato actualizada';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'candidate_deleted';
    action_desc := 'Candidato eliminado: ' || OLD.name;
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'candidate',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.stage ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.stage ELSE NULL END,
    jsonb_build_object(
      'candidate_name', COALESCE(NEW.name, OLD.name),
      'position', COALESCE(NEW.position, OLD.position),
      'application_id', COALESCE(NEW.application_id, OLD.application_id)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para registrar cambios en postulaciones
CREATE OR REPLACE FUNCTION log_postulation_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
  candidate_name TEXT;
  application_title TEXT;
BEGIN
  -- Obtener información relacionada
  SELECT name INTO candidate_name FROM candidates WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);
  SELECT title INTO application_title FROM applications WHERE id = COALESCE(NEW.application_id, OLD.application_id);

  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'postulation_created';
    action_desc := 'Candidato "' || candidate_name || '" se postuló a "' || application_title || '"';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'postulation_updated';
    
    -- Detectar cambios específicos
    IF OLD.stage != NEW.stage THEN
      action_desc := 'Candidato "' || candidate_name || '" movido de "' || OLD.stage || '" a "' || NEW.stage || '" en "' || application_title || '"';
    ELSIF OLD.score != NEW.score THEN
      action_desc := 'Puntuación actualizada de ' || OLD.score || ' a ' || NEW.score || ' para "' || candidate_name || '" en "' || application_title || '"';
    ELSIF OLD.status != NEW.status THEN
      action_desc := 'Estado cambiado de "' || OLD.status || '" a "' || NEW.status || '" para "' || candidate_name || '" en "' || application_title || '"';
    ELSE
      action_desc := 'Postulación actualizada para "' || candidate_name || '" en "' || application_title || '"';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'postulation_deleted';
    action_desc := 'Postulación eliminada para "' || candidate_name || '" en "' || application_title || '"';
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'postulation',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.stage ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.stage ELSE NULL END,
    jsonb_build_object(
      'candidate_name', candidate_name,
      'application_title', application_title,
      'candidate_id', COALESCE(NEW.candidate_id, OLD.candidate_id),
      'application_id', COALESCE(NEW.application_id, OLD.application_id)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para registrar cambios en aplicaciones
CREATE OR REPLACE FUNCTION log_application_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
BEGIN
  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'application_created';
    action_desc := 'Postulación creada: "' || NEW.title || '"';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'application_updated';
    
    -- Detectar cambios específicos
    IF OLD.title != NEW.title THEN
      action_desc := 'Título cambiado de "' || OLD.title || '" a "' || NEW.title || '"';
    ELSIF OLD.status != NEW.status THEN
      action_desc := 'Estado cambiado de "' || OLD.status || '" a "' || NEW.status || '"';
    ELSE
      action_desc := 'Postulación actualizada: "' || NEW.title || '"';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'application_deleted';
    action_desc := 'Postulación eliminada: "' || OLD.title || '"';
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'application',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.title ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.title ELSE NULL END,
    jsonb_build_object(
      'application_title', COALESCE(NEW.title, OLD.title),
      'area', COALESCE(NEW.area, OLD.area)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para registrar evaluaciones
CREATE OR REPLACE FUNCTION log_evaluation_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
  candidate_name TEXT;
BEGIN
  -- Obtener nombre del candidato
  SELECT name INTO candidate_name FROM candidates WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'evaluation_created';
    action_desc := 'Evaluación creada para "' || candidate_name || '": ' || NEW.score || '/10 - ' || NEW.feedback;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'evaluation_updated';
    action_desc := 'Evaluación actualizada para "' || candidate_name || '": ' || NEW.score || '/10 - ' || NEW.feedback;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'evaluation_deleted';
    action_desc := 'Evaluación eliminada para "' || candidate_name || '"';
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'evaluation',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.score::TEXT ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.score::TEXT ELSE NULL END,
    jsonb_build_object(
      'candidate_name', candidate_name,
      'candidate_id', COALESCE(NEW.candidate_id, OLD.candidate_id),
      'stage', COALESCE(NEW.stage, OLD.stage),
      'feedback', COALESCE(NEW.feedback, OLD.feedback)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para registrar notas de candidatos
CREATE OR REPLACE FUNCTION log_note_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
  candidate_name TEXT;
BEGIN
  -- Obtener nombre del candidato
  SELECT name INTO candidate_name FROM candidates WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'note_created';
    action_desc := 'Nota agregada para "' || candidate_name || '" en etapa "' || NEW.stage || '": ' || LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'note_updated';
    action_desc := 'Nota actualizada para "' || candidate_name || '" en etapa "' || NEW.stage || '"';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'note_deleted';
    action_desc := 'Nota eliminada para "' || candidate_name || '"';
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'note',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    NULL,
    NULL,
    jsonb_build_object(
      'candidate_name', candidate_name,
      'candidate_id', COALESCE(NEW.candidate_id, OLD.candidate_id),
      'stage', COALESCE(NEW.stage, OLD.stage),
      'score', COALESCE(NEW.score, OLD.score)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para registrar archivos adjuntos
CREATE OR REPLACE FUNCTION log_attachment_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  action_type VARCHAR(100);
  candidate_name TEXT;
BEGIN
  -- Obtener nombre del candidato
  SELECT name INTO candidate_name FROM candidates WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

  -- Determinar tipo de acción
  IF TG_OP = 'INSERT' THEN
    action_type := 'attachment_uploaded';
    action_desc := 'Archivo "' || NEW.name || '" subido para "' || candidate_name || '"';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'attachment_updated';
    action_desc := 'Archivo "' || NEW.name || '" actualizado para "' || candidate_name || '"';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'attachment_deleted';
    action_desc := 'Archivo "' || OLD.name || '" eliminado para "' || candidate_name || '"';
  END IF;

  -- Registrar en timeline
  PERFORM log_timeline_action(
    'attachment',
    COALESCE(NEW.id, OLD.id),
    action_type,
    action_desc,
    get_current_user_id(),
    get_current_user_email(),
    NULL,
    NULL,
    jsonb_build_object(
      'candidate_name', candidate_name,
      'candidate_id', COALESCE(NEW.candidate_id, OLD.candidate_id),
      'file_name', COALESCE(NEW.name, OLD.name),
      'file_type', COALESCE(NEW.type, OLD.type)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 9. Crear triggers en las tablas
DROP TRIGGER IF EXISTS trigger_log_candidate_changes ON candidates;
CREATE TRIGGER trigger_log_candidate_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidates
  FOR EACH ROW EXECUTE FUNCTION log_candidate_changes();

DROP TRIGGER IF EXISTS trigger_log_postulation_changes ON postulations;
CREATE TRIGGER trigger_log_postulation_changes
  AFTER INSERT OR UPDATE OR DELETE ON postulations
  FOR EACH ROW EXECUTE FUNCTION log_postulation_changes();

DROP TRIGGER IF EXISTS trigger_log_application_changes ON applications;
CREATE TRIGGER trigger_log_application_changes
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_application_changes();

DROP TRIGGER IF EXISTS trigger_log_evaluation_changes ON candidate_evaluations;
CREATE TRIGGER trigger_log_evaluation_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidate_evaluations
  FOR EACH ROW EXECUTE FUNCTION log_evaluation_changes();

DROP TRIGGER IF EXISTS trigger_log_note_changes ON candidate_notes;
CREATE TRIGGER trigger_log_note_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidate_notes
  FOR EACH ROW EXECUTE FUNCTION log_note_changes();

DROP TRIGGER IF EXISTS trigger_log_attachment_changes ON candidate_attachments;
CREATE TRIGGER trigger_log_attachment_changes
  AFTER INSERT OR UPDATE OR DELETE ON candidate_attachments
  FOR EACH ROW EXECUTE FUNCTION log_attachment_changes();

-- 10. Función para obtener timeline de un candidato
CREATE OR REPLACE FUNCTION get_candidate_timeline(p_candidate_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  action_type VARCHAR(100),
  action_description TEXT,
  performed_by_email VARCHAR(255),
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  WHERE dt.entity_type = 'candidate' AND dt.entity_id = p_candidate_id
  UNION ALL
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  INNER JOIN postulations p ON dt.entity_type = 'postulation' AND dt.entity_id = p.id
  WHERE p.candidate_id = p_candidate_id
  UNION ALL
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  INNER JOIN candidate_evaluations ce ON dt.entity_type = 'evaluation' AND dt.entity_id = ce.id
  WHERE ce.candidate_id = p_candidate_id
  UNION ALL
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  INNER JOIN candidate_notes cn ON dt.entity_type = 'note' AND dt.entity_id = cn.id
  WHERE cn.candidate_id = p_candidate_id
  UNION ALL
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  INNER JOIN candidate_attachments ca ON dt.entity_type = 'attachment' AND dt.entity_id = ca.id
  WHERE ca.candidate_id = p_candidate_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 11. Función para obtener timeline de una aplicación
CREATE OR REPLACE FUNCTION get_application_timeline(p_application_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  action_type VARCHAR(100),
  action_description TEXT,
  performed_by_email VARCHAR(255),
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  WHERE dt.entity_type = 'application' AND dt.entity_id = p_application_id
  UNION ALL
  SELECT 
    dt.id,
    dt.action_type,
    dt.action_description,
    dt.performed_by_email,
    dt.previous_value,
    dt.new_value,
    dt.metadata,
    dt.created_at
  FROM detailed_timeline dt
  INNER JOIN postulations p ON dt.entity_type = 'postulation' AND dt.entity_id = p.id
  WHERE p.application_id = p_application_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 12. Verificar que todo se creó correctamente
SELECT '✅ Sistema de timeline automatizado creado exitosamente!' as resultado;
SELECT '📊 Triggers creados:' as info;
SELECT '  - candidates' as tabla;
SELECT '  - postulations' as tabla;
SELECT '  - applications' as tabla;
SELECT '  - candidate_evaluations' as tabla;
SELECT '  - candidate_notes' as tabla;
SELECT '  - candidate_attachments' as tabla;
