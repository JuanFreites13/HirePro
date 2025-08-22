-- =====================================================
-- CREAR USUARIOS EN SUPABASE AUTH
-- =====================================================

-- NOTA: Este script debe ejecutarse con permisos de service_role
-- Los usuarios se crearán en auth.users y luego se vincularán con la tabla users

-- Crear usuarios en auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@talentopro.com',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin TalentoPro"}',
    false,
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'maria@empresa.com',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"María González"}',
    false,
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'carlos@empresa.com',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Carlos Rodríguez"}',
    false,
    '',
    '',
    '',
    ''
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'ana@empresa.com',
    crypt('123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Ana Martínez"}',
    false,
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Verificar usuarios creados en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
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
    RAISE NOTICE 'USUARIOS CREADOS EN SUPABASE AUTH';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Admin Principal: admin@talentopro.com / 123456';
    RAISE NOTICE 'Admin Secundario: maria@empresa.com / 123456';
    RAISE NOTICE 'Entrevistador: carlos@empresa.com / 123456';
    RAISE NOTICE 'Entrevistador (solo lectura): ana@empresa.com / 123456';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Ahora puedes iniciar sesión con autenticación real';
    RAISE NOTICE '=====================================================';
END $$;

