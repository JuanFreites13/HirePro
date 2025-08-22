-- =====================================================
-- ACTUALIZAR ÁREAS DE USUARIOS EXISTENTES
-- =====================================================
-- Este script actualiza los usuarios existentes que no tienen área asignada
-- =====================================================

-- 1. Verificar usuarios sin área
SELECT 
    'Usuarios sin área asignada' as info,
    name,
    email,
    role,
    area,
    position
FROM users 
WHERE area IS NULL OR area = '';

-- 2. Actualizar área del admin principal
UPDATE users 
SET 
    area = 'Administración',
    position = 'Administrador Principal',
    updated_at = NOW()
WHERE email = 'admin@talentopro.com'
AND (area IS NULL OR area = '');

-- 3. Actualizar otros usuarios con áreas por defecto según su rol
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

-- 4. Verificar usuarios después de la actualización
SELECT 
    'Usuarios después de actualizar áreas' as info,
    name,
    email,
    role,
    area,
    position,
    updated_at
FROM users 
ORDER BY created_at DESC;

-- 5. Verificar que no hay usuarios sin área
SELECT 
    'Verificación final - Usuarios sin área' as info,
    COUNT(*) as total_sin_area
FROM users 
WHERE area IS NULL OR area = '';

-- 6. Mostrar resumen por área
SELECT 
    'Resumen por área' as info,
    area,
    COUNT(*) as total_usuarios,
    STRING_AGG(name, ', ') as usuarios
FROM users 
GROUP BY area
ORDER BY total_usuarios DESC;
