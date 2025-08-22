-- =====================================================
-- RESTAURAR USUARIO ADMIN - TALENTO PRO
-- =====================================================
-- Este script restaura el usuario admin con todos los permisos necesarios
-- =====================================================

-- Eliminar usuario admin existente si existe
DELETE FROM users WHERE email = 'admin@talentopro.com';

-- Insertar usuario admin con todos los permisos
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

-- Verificar que el usuario admin fue creado correctamente
SELECT 
    'Usuario admin restaurado' as status,
    name,
    email,
    role,
    permissions
FROM users 
WHERE email = 'admin@talentopro.com';

-- Mostrar todos los usuarios existentes
SELECT 
    'Usuarios en la base de datos' as info,
    COUNT(*) as total_usuarios
FROM users;

-- Verificar permisos específicos del admin
SELECT 
    'Permisos del admin' as info,
    CASE 
        WHEN 'acceso_configuracion' = ANY(permissions) THEN '✅ Tiene acceso a configuración'
        ELSE '❌ NO tiene acceso a configuración'
    END as acceso_configuracion,
    CASE 
        WHEN 'gestionar_usuarios' = ANY(permissions) THEN '✅ Puede gestionar usuarios'
        ELSE '❌ NO puede gestionar usuarios'
    END as gestionar_usuarios
FROM users 
WHERE email = 'admin@talentopro.com';
