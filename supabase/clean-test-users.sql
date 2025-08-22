-- =====================================================
-- LIMPIAR USUARIOS DE PRUEBA Y DUPLICADOS
-- =====================================================
-- Este script elimina usuarios de prueba y verifica duplicados
-- =====================================================

-- 1. Mostrar todos los usuarios actuales
SELECT 
    'Usuarios actuales en la base de datos' as info,
    COUNT(*) as total_usuarios
FROM users;

SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Eliminar usuarios de prueba (emails que contengan 'test', 'prueba', etc.)
DELETE FROM users 
WHERE email ILIKE '%test%' 
   OR email ILIKE '%prueba%' 
   OR email ILIKE '%example%'
   OR email ILIKE '%temporal%';

-- 3. Verificar duplicados por email
SELECT 
    'Verificando duplicados por email' as info,
    email,
    COUNT(*) as cantidad
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 4. Eliminar duplicados (mantener el más reciente)
DELETE FROM users 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
        FROM users
    ) t
    WHERE t.rn > 1
);

-- 5. Verificar que el admin existe y tiene permisos correctos
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

-- 6. Si no existe el admin, crearlo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@talentopro.com') THEN
        INSERT INTO users (id, name, email, role, permissions, created_at, updated_at) VALUES 
        (
            '550e8400-e29b-41d4-a716-446655440000',
            'Admin TalentoPro',
            'admin@talentopro.com',
            'Admin RRHH',
            ARRAY[
                'crear_postulaciones',
                'mover_etapas',
                'ver_todas_postulaciones',
                'gestionar_usuarios',
                'acceso_configuracion',
                'eliminar_candidatos',
                'editar_postulaciones',
                'usar_ia'
            ],
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Usuario admin creado';
    ELSE
        RAISE NOTICE '✅ Usuario admin ya existe';
    END IF;
END $$;

-- 7. Mostrar estado final
SELECT 
    'Estado final de usuarios' as info,
    COUNT(*) as total_usuarios
FROM users;

SELECT 
    'Lista final de usuarios' as info,
    name,
    email,
    role,
    created_at
FROM users
ORDER BY created_at DESC;
