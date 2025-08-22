-- =====================================================
-- DESHABILITAR TEMPORALMENTE RLS PARA DESARROLLO
-- =====================================================
-- Este script deshabilita temporalmente RLS en la tabla users
-- para permitir que funcione la gestión de usuarios
-- ⚠️ SOLO USAR EN DESARROLLO
-- =====================================================

-- 1. Verificar estado actual
SELECT 
    'Estado actual de RLS en tabla users' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Verificar políticas actuales
SELECT 
    'Políticas actuales en tabla users' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Deshabilitar RLS temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Admin users can create users" ON users;
DROP POLICY IF EXISTS "Admin users can update users" ON users;
DROP POLICY IF EXISTS "Admin users can delete users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;
DROP POLICY IF EXISTS "Users can update users" ON users;
DROP POLICY IF EXISTS "Users can delete users" ON users;

-- 5. Verificar que RLS está deshabilitado
SELECT 
    'Estado después de deshabilitar RLS' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 6. Verificar que no hay políticas
SELECT 
    'Políticas después de eliminación' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'users';

-- 7. Probar acceso básico
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Probar lectura
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '✅ Lectura de usuarios: OK (Total: %)', user_count;
    
    -- Probar inserción (solo si no hay usuarios de prueba)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.rls@talentopro.com') THEN
        INSERT INTO users (id, name, email, role, permissions, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Test RLS',
            'test.rls@talentopro.com',
            'Entrevistador',
            ARRAY['mover_etapas'],
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Inserción de usuarios: OK';
        
        -- Limpiar usuario de prueba
        DELETE FROM users WHERE email = 'test.rls@talentopro.com';
        RAISE NOTICE '✅ Eliminación de usuarios: OK';
    ELSE
        RAISE NOTICE '⚠️ Usuario de prueba ya existe, saltando inserción';
    END IF;
    
END $$;

-- 8. Verificar usuario admin
SELECT 
    'Verificación del usuario admin' as info,
    name,
    email,
    role,
    permissions
FROM users 
WHERE email = 'admin@talentopro.com';

-- 9. Mostrar todos los usuarios
SELECT 
    'Todos los usuarios en el sistema' as info,
    name,
    email,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;
