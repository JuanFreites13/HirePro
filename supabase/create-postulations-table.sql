-- =====================================================
-- CREAR TABLA POSTULATIONS PARA MÚLTIPLES PROCESOS
-- =====================================================

-- Crear tabla postulations para vincular candidatos a múltiples aplicaciones
CREATE TABLE IF NOT EXISTS postulations (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage VARCHAR(100) NOT NULL DEFAULT 'Pre-entrevista',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'rejected', 'on-hold')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  score DECIMAL(3,1) DEFAULT 0.0,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único: un candidato solo puede tener una postulación activa por aplicación
  CONSTRAINT unique_candidate_application UNIQUE (candidate_id, application_id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_postulations_candidate_id ON postulations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_postulations_application_id ON postulations(application_id);
CREATE INDEX IF NOT EXISTS idx_postulations_assignee_id ON postulations(assignee_id);
CREATE INDEX IF NOT EXISTS idx_postulations_status ON postulations(status);
CREATE INDEX IF NOT EXISTS idx_postulations_stage ON postulations(stage);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_postulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_postulations_updated_at
    BEFORE UPDATE ON postulations
    FOR EACH ROW
    EXECUTE FUNCTION update_postulations_updated_at();

-- Migrar datos existentes de candidates a postulations
INSERT INTO postulations (candidate_id, application_id, stage, status, assignee_id, score, applied_at, created_at, updated_at)
SELECT 
  id as candidate_id,
  application_id,
  stage,
  CASE 
    WHEN status = 'pending' THEN 'active'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'rejected' THEN 'rejected'
    WHEN status = 'on-hold' THEN 'on-hold'
    ELSE 'active'
  END as status,
  assignee_id,
  score,
  applied_at,
  created_at,
  updated_at
FROM candidates
WHERE application_id IS NOT NULL
ON CONFLICT (candidate_id, application_id) DO NOTHING;

-- Enable RLS
ALTER TABLE postulations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Users can view all postulations" ON postulations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert postulations" ON postulations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update postulations" ON postulations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete postulations" ON postulations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verificación
SELECT 'Tabla postulations creada exitosamente' AS status, COUNT(*) AS total_postulations FROM postulations;

