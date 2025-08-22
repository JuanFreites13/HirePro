-- =====================================================
-- VERIFICAR Y RESTAURAR USUARIO ADMIN
-- =====================================================
-- Este script verifica que el usuario admin existe y tiene permisos correctos
-- =====================================================

-- 1. Verificar si existe el usuario admin
SELECT 
    'Verificación del usuario admin' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE email = 'admin@talentopro.com') 
        THEN '✅ Existe' 
        ELSE '❌ No existe' 
    END as estado;

-- 2. Mostrar información del usuario admin si existe
SELECT 
    'Información del usuario admin' as info,
    name,
    email,
    role,
    permissions,
    created_at,
    updated_at
FROM users 
WHERE email = 'admin@talentopro.com';

-- 3. Si no existe, crearlo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@talentopro.com') THEN
        INSERT INTO users (id, name, email, role, permissions, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Administrador Principal',
            'admin@talentopro.com',
            'Admin RRHH',
            ARRAY[
                'gestionar_usuarios',
                'acceso_configuracion',
                'ver_todas_postulaciones',
                'mover_etapas',
                'crear_postulaciones',
                'editar_postulaciones',
                'eliminar_postulaciones',
                'ver_todos_candidatos',
                'crear_candidatos',
                'editar_candidatos',
                'eliminar_candidatos',
                'ver_evaluaciones',
                'crear_evaluaciones',
                'editar_evaluaciones',
                'eliminar_evaluaciones'
            ],
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Usuario admin creado exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Usuario admin ya existe';
    END IF;
END $$;

-- 4. Actualizar permisos del admin si es necesario
UPDATE users 
SET 
    permissions = ARRAY[
        'gestionar_usuarios',
        'acceso_configuracion',
        'ver_todas_postulaciones',
        'mover_etapas',
        'crear_postulaciones',
        'editar_postulaciones',
        'eliminar_postulaciones',
        'ver_todos_candidatos',
        'crear_candidatos',
        'editar_candidatos',
        'eliminar_candidatos',
        'ver_evaluaciones',
        'crear_evaluaciones',
        'editar_evaluaciones',
        'eliminar_evaluaciones'
    ],
    updated_at = NOW()
WHERE email = 'admin@talentopro.com'
AND (
    'gestionar_usuarios' != ALL(permissions) OR
    'acceso_configuracion' != ALL(permissions)
);

-- 5. Verificar estado final
SELECT 
    'Estado final del usuario admin' as info,
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
    END as permiso_configuracion,
    updated_at
FROM users 
WHERE email = 'admin@talentopro.com';

-- 6. Mostrar todos los usuarios
SELECT 
    'Todos los usuarios en el sistema' as info,
    name,
    email,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 7. Verificar estructura de la tabla
SELECT 
    'Estructura de la tabla users' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
