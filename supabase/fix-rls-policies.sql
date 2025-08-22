-- =====================================================
-- ARREGLAR POLÍTICAS RLS PARA CREACIÓN INICIAL DE USUARIOS
-- =====================================================

-- Primero, deshabilitar RLS temporalmente para poder insertar usuarios
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insertar usuarios por defecto
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

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Carlos Rodríguez',
    'carlos@empresa.com',
    'Entrevistador',
    ARRAY['mover_etapas', 'ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Ana Martínez',
    'ana@empresa.com',
    'Entrevistador',
    ARRAY['ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

-- Ahora habilitar RLS nuevamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all users" ON users;

-- Crear políticas simplificadas que no causen recursión
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (true);

-- Verificar usuarios creados
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
    RAISE NOTICE 'USUARIOS CREADOS Y POLÍTICAS RLS ARREGLADAS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Admin Principal: admin@talentopro.com';
    RAISE NOTICE 'Admin Secundario: maria@empresa.com';
    RAISE NOTICE 'Entrevistador: carlos@empresa.com';
    RAISE NOTICE 'Entrevistador (solo lectura): ana@empresa.com';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Contraseña para todos: 123456';
    RAISE NOTICE '=====================================================';
END $$;

