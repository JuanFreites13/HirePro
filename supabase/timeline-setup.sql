-- CREAR TABLA DE TIMELINE DETALLADO
-- ==================================

-- 1. Crear tabla de timeline detallado
CREATE TABLE IF NOT EXISTS detailed_timeline (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'candidate', 'application', 'evaluation'
  entity_id INTEGER NOT NULL, -- ID del candidato, postulación, etc.
  action_type VARCHAR(100) NOT NULL, -- 'created', 'updated', 'moved', 'evaluated', etc.
  action_description TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_email VARCHAR(255), -- Email del usuario que realizó la acción
  previous_value TEXT, -- Valor anterior (para cambios)
  new_value TEXT, -- Nuevo valor (para cambios)
  metadata JSONB, -- Información adicional en formato JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_entity ON detailed_timeline(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_performed_by ON detailed_timeline(performed_by);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_created_at ON detailed_timeline(created_at);

-- 3. RLS para timeline
ALTER TABLE detailed_timeline ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "allow_all_timeline" ON detailed_timeline;
CREATE POLICY "allow_all_timeline" ON detailed_timeline FOR ALL USING (true);

-- 5. Función para registrar acciones automáticamente
CREATE OR REPLACE FUNCTION log_timeline_action(
  p_entity_type VARCHAR(50),
  p_entity_id INTEGER,
  p_action_type VARCHAR(100),
  p_action_description TEXT,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_email VARCHAR(255) DEFAULT NULL,
  p_previous_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO detailed_timeline (
    entity_type,
    entity_id,
    action_type,
    action_description,
    performed_by,
    performed_by_email,
    previous_value,
    new_value,
    metadata
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action_type,
    p_action_description,
    p_performed_by,
    p_performed_by_email,
    p_previous_value,
    p_new_value,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- ✅ Verificación
SELECT 'Tabla de timeline detallado creada exitosamente! 📅' as resultado;

