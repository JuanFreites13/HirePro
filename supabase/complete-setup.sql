-- CONFIGURACIÓN COMPLETA PARA NUEVAS FUNCIONALIDADES
-- ===================================================

-- 1. CREAR TABLA DE EVALUACIONES
-- ===============================
CREATE TABLE IF NOT EXISTS candidate_evaluations (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id),
  evaluation_type VARCHAR(100) NOT NULL DEFAULT 'general',
  score INTEGER CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  stage VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE ARCHIVOS ADJUNTOS
-- ====================================
CREATE TABLE IF NOT EXISTS candidate_attachments (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA DE TIMELINE DETALLADO
-- ====================================
CREATE TABLE IF NOT EXISTS detailed_timeline (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_email VARCHAR(255),
  previous_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR ÍNDICES
-- ================
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_candidate_id ON candidate_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_evaluator_id ON candidate_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_stage ON candidate_evaluations(stage);

CREATE INDEX IF NOT EXISTS idx_candidate_attachments_candidate_id ON candidate_attachments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_file_type ON candidate_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_uploaded_by ON candidate_attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_detailed_timeline_entity ON detailed_timeline(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_performed_by ON detailed_timeline(performed_by);
CREATE INDEX IF NOT EXISTS idx_detailed_timeline_created_at ON detailed_timeline(created_at);

-- 5. CREAR TRIGGERS
-- =================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidate_evaluations_updated_at 
    BEFORE UPDATE ON candidate_evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_attachments_updated_at 
    BEFORE UPDATE ON candidate_attachments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNCIÓN PARA LOGGING DE TIMELINE
-- ===================================
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

-- 7. CONFIGURAR RLS
-- =================
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_timeline ENABLE ROW LEVEL SECURITY;

-- 8. CREAR POLÍTICAS RLS
-- =======================
DROP POLICY IF EXISTS "allow_all_evaluations" ON candidate_evaluations;
CREATE POLICY "allow_all_evaluations" ON candidate_evaluations FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_attachments" ON candidate_attachments;
CREATE POLICY "allow_all_attachments" ON candidate_attachments FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_timeline" ON detailed_timeline;
CREATE POLICY "allow_all_timeline" ON detailed_timeline FOR ALL USING (true);

-- 9. CREAR BUCKET DE STORAGE (si no existe)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- 10. POLÍTICA DE STORAGE
-- =======================
DROP POLICY IF EXISTS "allow_all_candidate_files" ON storage.objects;
CREATE POLICY "allow_all_candidate_files" ON storage.objects FOR ALL USING (bucket_id = 'candidate-files');

-- ✅ VERIFICACIÓN FINAL
-- =====================
SELECT 'Configuración completa exitosamente! 🎉' as resultado;
SELECT 'Tablas creadas: candidate_evaluations, candidate_attachments, detailed_timeline' as tablas;
SELECT 'Funcionalidades: Evaluaciones, Archivos Adjuntos, Timeline Detallado' as funcionalidades;

