-- =====================================================
-- LIMPIEZA COMPLETA DE DATOS - TALENTO PRO
-- =====================================================
-- Este script elimina todos los candidatos, postulaciones y usuarios
-- excepto el usuario admin@talentopro.com
-- =====================================================

-- Deshabilitar temporalmente las verificaciones de integridad referencial
SET session_replication_role = replica;

-- =====================================================
-- 1. ELIMINAR DATOS RELACIONADOS CON CANDIDATOS
-- =====================================================

-- Eliminar evaluaciones de candidatos (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_evaluations') THEN
        DELETE FROM candidate_evaluations WHERE id IS NOT NULL;
        RAISE NOTICE 'Evaluaciones de candidatos eliminadas';
    ELSE
        RAISE NOTICE 'Tabla candidate_evaluations no existe, saltando...';
    END IF;
END $$;

-- Eliminar archivos adjuntos de candidatos (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_attachments') THEN
        DELETE FROM candidate_attachments WHERE id IS NOT NULL;
        RAISE NOTICE 'Archivos adjuntos de candidatos eliminados';
    ELSE
        RAISE NOTICE 'Tabla candidate_attachments no existe, saltando...';
    END IF;
END $$;

-- Eliminar timeline detallado (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'detailed_timeline') THEN
        DELETE FROM detailed_timeline WHERE id IS NOT NULL;
        RAISE NOTICE 'Timeline detallado eliminado';
    ELSE
        RAISE NOTICE 'Tabla detailed_timeline no existe, saltando...';
    END IF;
END $$;

-- Eliminar notas de candidatos (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_notes') THEN
        DELETE FROM candidate_notes WHERE id IS NOT NULL;
        RAISE NOTICE 'Notas de candidatos eliminadas';
    ELSE
        RAISE NOTICE 'Tabla candidate_notes no existe, saltando...';
    END IF;
END $$;

-- Eliminar timeline de candidatos (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_timeline') THEN
        DELETE FROM candidate_timeline WHERE id IS NOT NULL;
        RAISE NOTICE 'Timeline de candidatos eliminado';
    ELSE
        RAISE NOTICE 'Tabla candidate_timeline no existe, saltando...';
    END IF;
END $$;

-- =====================================================
-- 2. ELIMINAR POSTULACIONES
-- =====================================================

-- Eliminar todas las postulaciones (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'postulations') THEN
        DELETE FROM postulations WHERE id IS NOT NULL;
        RAISE NOTICE 'Todas las postulaciones eliminadas';
    ELSE
        RAISE NOTICE 'Tabla postulations no existe, saltando...';
    END IF;
END $$;

-- =====================================================
-- 3. ELIMINAR CANDIDATOS
-- =====================================================

-- Eliminar todos los candidatos (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates') THEN
        DELETE FROM candidates WHERE id IS NOT NULL;
        RAISE NOTICE 'Todos los candidatos eliminados';
    ELSE
        RAISE NOTICE 'Tabla candidates no existe, saltando...';
    END IF;
END $$;

-- Eliminar candidatos globales (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'global_candidates') THEN
        DELETE FROM global_candidates WHERE id IS NOT NULL;
        RAISE NOTICE 'Candidatos globales eliminados';
    ELSE
        RAISE NOTICE 'Tabla global_candidates no existe, saltando...';
    END IF;
END $$;

-- =====================================================
-- 4. ELIMINAR APLICACIONES
-- =====================================================

-- Eliminar todas las aplicaciones (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        DELETE FROM applications WHERE id IS NOT NULL;
        RAISE NOTICE 'Todas las aplicaciones eliminadas';
    ELSE
        RAISE NOTICE 'Tabla applications no existe, saltando...';
    END IF;
END $$;

-- =====================================================
-- 5. ELIMINAR USUARIOS (EXCEPTO ADMIN)
-- =====================================================

-- Eliminar todos los usuarios excepto admin@talentopro.com (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DELETE FROM users WHERE email != 'admin@talentopro.com';
        RAISE NOTICE 'Usuarios eliminados (excepto admin)';
    ELSE
        RAISE NOTICE 'Tabla users no existe, saltando...';
    END IF;
END $$;

-- =====================================================
-- 6. LIMPIAR STORAGE
-- =====================================================

-- Eliminar todos los archivos del bucket de candidatos (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'candidates' LIMIT 1) THEN
        DELETE FROM storage.objects WHERE bucket_id = 'candidates';
        RAISE NOTICE 'Archivos del bucket candidates eliminados';
    ELSE
        RAISE NOTICE 'No hay archivos en bucket candidates, saltando...';
    END IF;
END $$;

-- Eliminar todos los archivos del bucket candidate-files (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'candidate-files' LIMIT 1) THEN
        DELETE FROM storage.objects WHERE bucket_id = 'candidate-files';
        RAISE NOTICE 'Archivos del bucket candidate-files eliminados';
    ELSE
        RAISE NOTICE 'No hay archivos en bucket candidate-files, saltando...';
    END IF;
END $$;

-- =====================================================
-- 7. REINICIAR SECUENCIAS
-- =====================================================

-- Reiniciar secuencias para que los nuevos registros empiecen desde 1
DO $$
BEGIN
    -- Reiniciar secuencia de candidatos
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'candidates_id_seq') THEN
        ALTER SEQUENCE candidates_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de candidatos globales
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'global_candidates_id_seq') THEN
        ALTER SEQUENCE global_candidates_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de postulaciones
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'postulations_id_seq') THEN
        ALTER SEQUENCE postulations_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de aplicaciones
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'applications_id_seq') THEN
        ALTER SEQUENCE applications_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de evaluaciones
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'candidate_evaluations_id_seq') THEN
        ALTER SEQUENCE candidate_evaluations_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de archivos adjuntos
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'candidate_attachments_id_seq') THEN
        ALTER SEQUENCE candidate_attachments_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de timeline detallado
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'detailed_timeline_id_seq') THEN
        ALTER SEQUENCE detailed_timeline_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de notas
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'candidate_notes_id_seq') THEN
        ALTER SEQUENCE candidate_notes_id_seq RESTART WITH 1;
    END IF;
    
    -- Reiniciar secuencia de timeline
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'candidate_timeline_id_seq') THEN
        ALTER SEQUENCE candidate_timeline_id_seq RESTART WITH 1;
    END IF;
END $$;

SELECT 'Secuencias reiniciadas' as status;

-- =====================================================
-- 8. REHABILITAR VERIFICACIONES DE INTEGRIDAD
-- =====================================================

SET session_replication_role = DEFAULT;

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que solo queda el usuario admin
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Usuarios restantes: %', (SELECT COUNT(*) FROM users);
        RAISE NOTICE 'Emails de usuarios: %', (SELECT STRING_AGG(email, ', ') FROM users);
    ELSE
        RAISE NOTICE 'Tabla users no existe';
    END IF;
END $$;

-- Verificar que no hay candidatos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates') THEN
        RAISE NOTICE 'Candidatos restantes: %', (SELECT COUNT(*) FROM candidates);
    ELSE
        RAISE NOTICE 'Tabla candidates no existe';
    END IF;
END $$;

-- Verificar que no hay postulaciones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'postulations') THEN
        RAISE NOTICE 'Postulaciones restantes: %', (SELECT COUNT(*) FROM postulations);
    ELSE
        RAISE NOTICE 'Tabla postulations no existe';
    END IF;
END $$;

-- Verificar que no hay aplicaciones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        RAISE NOTICE 'Aplicaciones restantes: %', (SELECT COUNT(*) FROM applications);
    ELSE
        RAISE NOTICE 'Tabla applications no existe';
    END IF;
END $$;

-- Verificar que no hay evaluaciones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_evaluations') THEN
        RAISE NOTICE 'Evaluaciones restantes: %', (SELECT COUNT(*) FROM candidate_evaluations);
    ELSE
        RAISE NOTICE 'Tabla candidate_evaluations no existe';
    END IF;
END $$;

-- Verificar que no hay archivos adjuntos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_attachments') THEN
        RAISE NOTICE 'Archivos adjuntos restantes: %', (SELECT COUNT(*) FROM candidate_attachments);
    ELSE
        RAISE NOTICE 'Tabla candidate_attachments no existe';
    END IF;
END $$;

-- Verificar que no hay timeline
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'detailed_timeline') THEN
        RAISE NOTICE 'Timeline restante: %', (SELECT COUNT(*) FROM detailed_timeline);
    ELSE
        RAISE NOTICE 'Tabla detailed_timeline no existe';
    END IF;
END $$;

-- =====================================================
-- MENSAJE DE COMPLETACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'LIMPIEZA COMPLETA EXITOSA';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Todos los candidatos eliminados';
    RAISE NOTICE '✅ Todas las postulaciones eliminadas';
    RAISE NOTICE '✅ Todos los usuarios eliminados (excepto admin)';
    RAISE NOTICE '✅ Todas las aplicaciones eliminadas';
    RAISE NOTICE '✅ Todos los archivos de storage eliminados';
    RAISE NOTICE '✅ Secuencias reiniciadas';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Usuario admin preservado: admin@talentopro.com';
    RAISE NOTICE '=====================================================';
END $$;
