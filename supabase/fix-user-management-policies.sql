-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA GESTIÓN DE USUARIOS
-- =====================================================
-- Este script corrige las políticas que pueden estar bloqueando operaciones
-- =====================================================

-- 1. Verificar políticas actuales
SELECT 
    'Políticas actuales en tabla users' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;
DROP POLICY IF EXISTS "Users can update users" ON users;
DROP POLICY IF EXISTS "Users can delete users" ON users;

-- 3. Crear políticas permisivas para administradores
-- Política para ver usuarios (solo admins)
CREATE POLICY "Admin users can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH' 
            AND 'gestionar_usuarios' = ANY(permissions)
        )
    );

-- Política para crear usuarios (solo admins)
CREATE POLICY "Admin users can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH' 
            AND 'gestionar_usuarios' = ANY(permissions)
        )
    );

-- Política para actualizar usuarios (solo admins)
CREATE POLICY "Admin users can update users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH' 
            AND 'gestionar_usuarios' = ANY(permissions)
        )
    );

-- Política para eliminar usuarios (solo admins, excepto admin principal)
CREATE POLICY "Admin users can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH' 
            AND 'gestionar_usuarios' = ANY(permissions)
        )
        AND email != 'admin@talentopro.com'  -- Proteger admin principal
    );

-- 4. Política temporal para desarrollo (si es necesario)
-- Comentar estas líneas en producción
-- DROP POLICY IF EXISTS "Temporary allow all for development" ON users;
-- CREATE POLICY "Temporary allow all for development" ON users FOR ALL USING (true);

-- 5. Verificar que RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas creadas
SELECT 
    'Políticas después de la corrección' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Verificar usuario admin actual
SELECT 
    'Verificación del usuario admin' as info,
    name,
    email,
    role,
    CASE 
        WHEN 'gestionar_usuarios' = ANY(permissions) THEN '✅ Tiene gestionar_usuarios'
        ELSE '❌ Falta gestionar_usuarios'
    END as permiso_gestionar,
    CASE 
        WHEN 'acceso_configuracion' = ANY(permissions) THEN '✅ Tiene acceso_configuracion'
        ELSE '❌ Falta acceso_configuracion'
    END as permiso_configuracion
FROM users 
WHERE email = 'admin@talentopro.com';

-- 8. Probar operaciones básicas
DO $$
DECLARE
    test_user_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Verificar que podemos leer usuarios
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        RAISE NOTICE '✅ Lectura de usuarios: OK';
    ELSE
        RAISE NOTICE '❌ Lectura de usuarios: FALLA';
    END IF;
    
    -- Verificar que podemos insertar usuarios (solo si somos admin)
    BEGIN
        test_user_id := gen_random_uuid();
        INSERT INTO users (id, name, email, role, permissions, created_at, updated_at)
        VALUES (
            test_user_id,
            'Test User',
            'test.policy@example.com',
            'Entrevistador',
            ARRAY['mover_etapas'],
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Inserción de usuarios: OK';
        
        -- Limpiar usuario de prueba
        DELETE FROM users WHERE id = test_user_id;
        RAISE NOTICE '✅ Eliminación de usuarios: OK';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Operaciones de usuarios: %', SQLERRM;
    END;
    
END $$;
