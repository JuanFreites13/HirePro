-- =====================================================
-- CREAR USUARIOS POR DEFECTO EN SUPABASE
-- =====================================================

-- Primero, asegúrate de que la tabla users existe
-- Si no existe, ejecuta primero el script completo init.sql

-- Insertar usuario administrador principal
INSERT INTO users (id, name, email, role, permissions) VALUES 
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
        'editar_postulaciones'
    ]
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuario administrador secundario
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
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
) ON CONFLICT (email) DO NOTHING;

-- Insertar entrevistador con permisos completos
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Carlos Rodríguez',
    'carlos@empresa.com',
    'Entrevistador',
    ARRAY['mover_etapas', 'ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

-- Insertar entrevistador con permisos limitados
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Ana Martínez',
    'ana@empresa.com',
    'Entrevistador',
    ARRAY['ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

-- Verificar que los usuarios se crearon correctamente
SELECT 
    id,
    name,
    email,
    role,
    permissions,
    created_at
FROM users 
ORDER BY created_at;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'USUARIOS CREADOS EXITOSAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Admin Principal: admin@talentopro.com';
    RAISE NOTICE 'Admin Secundario: maria@empresa.com';
    RAISE NOTICE 'Entrevistador: carlos@empresa.com';
    RAISE NOTICE 'Entrevistador (solo lectura): ana@empresa.com';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Contraseña para todos: 123456';
    RAISE NOTICE '=====================================================';
END $$;

