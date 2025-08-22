-- =====================================================
-- ACTUALIZAR IDs DE USUARIOS PARA COINCIDIR CON AUTH.USERS
-- =====================================================

-- Primero, eliminar usuarios existentes con IDs incorrectos
DELETE FROM users WHERE email IN (
    'admin@talentopro.com',
    'maria@empresa.com',
    'carlos@empresa.com',
    'ana@empresa.com'
);

-- Insertar usuarios con los IDs correctos de auth.users
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '6f980eec-4d9b-4d6e-8aa8-312e900a7c75', -- ID real de admin@talentopro.com
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
        'editar_postulaciones'
    ]
);

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    'f72ff0d9-090d-4d30-8e26-c394ef7bfa27', -- ID real de maria@empresa.com
    'María González',
    'maria@empresa.com',
    'Admin RRHH',
    ARRAY[
        'crear_postulaciones',
        'mover_etapas',
        'ver_todas_postulaciones',
        'gestionar_usuarios',
        'acceso_configuracion'
    ]
);

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '936b0988-b052-4321-beeb-576b17e05c17', -- ID real de carlos@empresa.com
    'Carlos Rodríguez',
    'carlos@empresa.com',
    'Entrevistador',
    ARRAY['mover_etapas', 'ver_postulaciones_asignadas']
);

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '05c1ed6a-d705-43f8-a8d4-7e13f4d426f6', -- ID real de ana@empresa.com
    'Ana Martínez',
    'ana@empresa.com',
    'Entrevistador',
    ARRAY['ver_postulaciones_asignadas']
);

-- Verificar usuarios actualizados
SELECT 
    id,
    name,
    email,
    role,
    permissions,
    created_at
FROM users 
WHERE email IN (
    'admin@talentopro.com',
    'maria@empresa.com',
    'carlos@empresa.com',
    'ana@empresa.com'
)
ORDER BY created_at;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'IDs DE USUARIOS ACTUALIZADOS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Admin Principal: admin@talentopro.com / 123456';
    RAISE NOTICE 'Admin Secundario: maria@empresa.com / 123456';
    RAISE NOTICE 'Entrevistador: carlos@empresa.com / 123456';
    RAISE NOTICE 'Entrevistador (solo lectura): ana@empresa.com / 123456';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Los IDs ahora coinciden con auth.users';
    RAISE NOTICE '=====================================================';
END $$;

