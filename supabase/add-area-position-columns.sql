-- =====================================================
-- AGREGAR COLUMNAS AREA Y POSITION A LA TABLA USERS
-- =====================================================
-- Este script verifica y agrega las columnas area y position si no existen
-- =====================================================

-- 1. Verificar estructura actual de la tabla users
SELECT 
    'Estructura actual de la tabla users' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar si existen las columnas area y position
SELECT 
    'Verificación de columnas area y position' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'area') 
        THEN '✅ Columna area existe' 
        ELSE '❌ Columna area NO existe' 
    END as estado_area,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'position') 
        THEN '✅ Columna position existe' 
        ELSE '❌ Columna position NO existe' 
    END as estado_position;

-- 3. Agregar columna area si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'area') THEN
        ALTER TABLE users ADD COLUMN area VARCHAR(255);
        RAISE NOTICE '✅ Columna area agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Columna area ya existe';
    END IF;
END $$;

-- 4. Agregar columna position si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'position') THEN
        ALTER TABLE users ADD COLUMN position VARCHAR(255);
        RAISE NOTICE '✅ Columna position agregada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Columna position ya existe';
    END IF;
END $$;

-- 5. Verificar estructura después de los cambios
SELECT 
    'Estructura después de agregar columnas' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 6. Actualizar usuarios existentes con valores por defecto
UPDATE users 
SET 
    area = CASE 
        WHEN role = 'Admin RRHH' THEN 'Recursos Humanos'
        WHEN role = 'Entrevistador' THEN 'Reclutamiento'
        ELSE 'General'
    END,
    position = CASE 
        WHEN role = 'Admin RRHH' THEN 'Administrador'
        WHEN role = 'Entrevistador' THEN 'Entrevistador'
        ELSE 'Usuario'
    END,
    updated_at = NOW()
WHERE (area IS NULL OR area = '')
AND email != 'admin@talentopro.com';

-- 7. Actualizar admin principal
UPDATE users 
SET 
    area = 'Administración',
    position = 'Administrador Principal',
    updated_at = NOW()
WHERE email = 'admin@talentopro.com'
AND (area IS NULL OR area = '');

-- 8. Verificar usuarios después de la actualización
SELECT 
    'Usuarios con áreas y posiciones actualizadas' as info,
    name,
    email,
    role,
    area,
    position,
    updated_at
FROM users 
ORDER BY created_at DESC;

-- 9. Verificar que no hay valores NULL
SELECT 
    'Verificación final - Valores NULL' as info,
    COUNT(*) as total_usuarios,
    COUNT(area) as usuarios_con_area,
    COUNT(position) as usuarios_con_position,
    COUNT(*) - COUNT(area) as usuarios_sin_area,
    COUNT(*) - COUNT(position) as usuarios_sin_position
FROM users;
