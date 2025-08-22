-- SCRIPT PARA ARREGLAR EVALUACIONES SIN ERRORES DE DUPLICADOS
-- ===========================================================

-- 1. VERIFICAR Y CREAR TABLA SI NO EXISTE
-- ========================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_evaluations') THEN
        CREATE TABLE candidate_evaluations (
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
    END IF;
END $$;

-- 2. CREAR ÍNDICES SI NO EXISTEN
-- ===============================
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_candidate_id ON candidate_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_evaluator_id ON candidate_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_stage ON candidate_evaluations(stage);

-- 3. CREAR FUNCIÓN SI NO EXISTE
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. CREAR TRIGGER SOLO SI NO EXISTE
-- ===================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_candidate_evaluations_updated_at') THEN
        CREATE TRIGGER update_candidate_evaluations_updated_at 
            BEFORE UPDATE ON candidate_evaluations 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. CONFIGURAR RLS
-- =================
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICA RLS (ELIMINAR PRIMERO SI EXISTE)
-- ==================================================
DROP POLICY IF EXISTS "allow_all_evaluations" ON candidate_evaluations;
CREATE POLICY "allow_all_evaluations" ON candidate_evaluations FOR ALL USING (true);

-- ✅ VERIFICACIONES FINALES
-- =========================
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_evaluations') 
        THEN '✅ Tabla candidate_evaluations existe'
        ELSE '❌ Error: Tabla no existe'
    END as tabla_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_candidate_evaluations_updated_at') 
        THEN '✅ Trigger existe'
        ELSE '❌ Error: Trigger no existe'
    END as trigger_status;

SELECT COUNT(*) as total_evaluations FROM candidate_evaluations;

SELECT '🎉 ¡Configuración de evaluaciones completada!' as resultado;

