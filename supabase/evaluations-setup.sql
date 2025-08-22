-- CREAR TABLA DE EVALUACIONES DE CANDIDATOS
-- ===========================================

-- 1. Crear tabla de evaluaciones
CREATE TABLE IF NOT EXISTS candidate_evaluations (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id),
  evaluation_type VARCHAR(100) NOT NULL DEFAULT 'general', -- general, técnica, cultural, etc.
  score INTEGER CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  stage VARCHAR(100), -- etapa en la que se realizó la evaluación
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_candidate_id ON candidate_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_evaluator_id ON candidate_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_stage ON candidate_evaluations(stage);

-- 3. Trigger para updated_at
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

-- 4. RLS para evaluaciones
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "allow_all_evaluations" ON candidate_evaluations;
CREATE POLICY "allow_all_evaluations" ON candidate_evaluations FOR ALL USING (true);

-- ✅ Verificación
SELECT 'Tabla de evaluaciones creada exitosamente! 🎯' as resultado;

