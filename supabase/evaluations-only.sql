-- CONFIGURACIÓN MÍNIMA SOLO PARA EVALUACIONES
-- ============================================

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

-- 2. CREAR ÍNDICES
-- ================
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_candidate_id ON candidate_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_evaluator_id ON candidate_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_stage ON candidate_evaluations(stage);

-- 3. CREAR TRIGGER
-- ================
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

-- 4. CONFIGURAR RLS
-- =================
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICA RLS
-- =====================
DROP POLICY IF EXISTS "allow_all_evaluations" ON candidate_evaluations;
CREATE POLICY "allow_all_evaluations" ON candidate_evaluations FOR ALL USING (true);

-- ✅ VERIFICACIÓN
-- ===============
SELECT 'Tabla candidate_evaluations creada exitosamente! 🎉' as resultado;
SELECT COUNT(*) as total_evaluations FROM candidate_evaluations;

