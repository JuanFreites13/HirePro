-- SCRIPT PARA LIMPIAR COMPLETAMENTE TODOS LOS CANDIDATOS Y DATOS RELACIONADOS
-- Ejecutar este script en Supabase Dashboard > SQL Editor

-- Mensaje de inicio
SELECT 'INICIANDO LIMPIEZA COMPLETA DE CANDIDATOS...' as status;

-- 1. Eliminar archivos adjuntos
DELETE FROM candidate_attachments;
SELECT 'Tabla candidate_attachments limpiada' as status;

-- 2. Eliminar evaluaciones
DELETE FROM candidate_evaluations;
SELECT 'Tabla candidate_evaluations limpiada' as status;

-- 3. Eliminar notas
DELETE FROM candidate_notes;
SELECT 'Tabla candidate_notes limpiada' as status;

-- 4. Eliminar postulaciones (si existe la tabla)
DELETE FROM postulations WHERE id IS NOT NULL;
SELECT 'Tabla postulations limpiada (si existe)' as status;

-- 5. Finalmente eliminar candidatos
DELETE FROM candidates;
SELECT 'Tabla candidates limpiada' as status;

-- 6. Reiniciar secuencias para empezar desde ID 1
ALTER SEQUENCE candidate_attachments_id_seq RESTART WITH 1;
ALTER SEQUENCE candidate_evaluations_id_seq RESTART WITH 1;
ALTER SEQUENCE candidate_notes_id_seq RESTART WITH 1;
ALTER SEQUENCE candidates_id_seq RESTART WITH 1;

-- Intentar reiniciar secuencia de postulations si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'postulations_id_seq') THEN
        ALTER SEQUENCE postulations_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Verificación final
SELECT 
    'LIMPIEZA COMPLETADA' as status,
    (SELECT COUNT(*) FROM candidates) as candidates_remaining,
    (SELECT COUNT(*) FROM candidate_attachments) as attachments_remaining,
    (SELECT COUNT(*) FROM candidate_evaluations) as evaluations_remaining,
    (SELECT COUNT(*) FROM candidate_notes) as notes_remaining;

SELECT 'Base de datos limpia y lista para pruebas!' as final_message;

