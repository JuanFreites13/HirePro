-- ARREGLAR CONSTRAINT DE EVALUATOR_ID
-- ====================================

-- Hacer que evaluator_id sea opcional (permitir NULL)
-- Esto soluciona el error de foreign key constraint

ALTER TABLE candidate_evaluations 
ALTER COLUMN evaluator_id DROP NOT NULL;

-- Verificar que el cambio se aplicó
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'candidate_evaluations' 
  AND column_name = 'evaluator_id';

SELECT '✅ evaluator_id ahora permite valores NULL' as resultado;

