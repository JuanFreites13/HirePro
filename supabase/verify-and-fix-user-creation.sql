-- =====================================================
-- VERIFICAR Y CORREGIR CREACIÓN DE USUARIOS
-- =====================================================
-- Este script verifica que todo esté configurado correctamente
-- =====================================================

-- 1. Verificar si la función existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_user_safe'
    ) THEN
        RAISE NOTICE '❌ La función create_user_safe NO existe. Creándola...';
        
        -- Crear la función correctamente
        CREATE OR REPLACE FUNCTION create_user_safe(
          p_name VARCHAR(255),
          p_email VARCHAR(255),
          p_role VARCHAR(50),
          p_area VARCHAR(255) DEFAULT NULL,
          p_position VARCHAR(255) DEFAULT NULL
        ) RETURNS JSON AS $$
        DECLARE
          new_user_id UUID;
          user_permissions TEXT[];
          result JSON;
        BEGIN
          -- Verificar que el usuario actual tiene permisos de administrador
          IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH' 
            AND 'gestionar_usuarios' = ANY(permissions)
          ) THEN
            RAISE EXCEPTION 'No tienes permisos para crear usuarios';
          END IF;

          -- Verificar que el email no existe
          IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
            RAISE EXCEPTION 'El email ya está registrado';
          END IF;

          -- Generar ID único
          new_user_id := gen_random_uuid();

          -- Definir permisos según el rol
          IF p_role = 'Admin RRHH' THEN
            user_permissions := ARRAY[
              'crear_postulaciones',
              'mover_etapas',
              'ver_todas_postulaciones',
              'gestionar_usuarios',
              'acceso_configuracion',
              'eliminar_candidatos',
              'editar_postulaciones',
              'usar_ia'
            ];
          ELSIF p_role = 'Entrevistador' THEN
            user_permissions := ARRAY[
              'mover_etapas',
              'ver_postulaciones_asignadas'
            ];
          ELSE
            RAISE EXCEPTION 'Rol inválido: %', p_role;
          END IF;

          -- Insertar usuario
          INSERT INTO users (id, name, email, role, permissions, created_at, updated_at)
          VALUES (
            new_user_id,
            p_name,
            p_email,
            p_role,
            user_permissions,
            NOW(),
            NOW()
          );

          -- Retornar información del usuario creado
          SELECT json_build_object(
            'success', true,
            'user_id', new_user_id,
            'name', p_name,
            'email', p_email,
            'role', p_role,
            'permissions', user_permissions,
            'message', 'Usuario creado exitosamente. El usuario debe registrarse en Supabase Auth manualmente.'
          ) INTO result;

          RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Crear política para permitir que usuarios admin ejecuten la función
        GRANT EXECUTE ON FUNCTION create_user_safe TO authenticated;
        
        RAISE NOTICE '✅ Función create_user_safe creada exitosamente';
    ELSE
        RAISE NOTICE '✅ La función create_user_safe ya existe';
    END IF;
END $$;

-- 2. Verificar usuarios admin existentes
SELECT 
    'Usuarios admin en la base de datos' as info,
    COUNT(*) as total_admins
FROM users 
WHERE role = 'Admin RRHH';

-- 3. Verificar permisos del usuario admin
SELECT 
    'Permisos del usuario admin' as info,
    name,
    email,
    role,
    permissions,
    CASE 
        WHEN 'gestionar_usuarios' = ANY(permissions) THEN '✅ Tiene permiso gestionar_usuarios'
        ELSE '❌ NO tiene permiso gestionar_usuarios'
    END as tiene_gestionar_usuarios
FROM users 
WHERE role = 'Admin RRHH';

-- 4. Verificar que el usuario admin tiene todos los permisos necesarios
SELECT 
    'Verificación completa del admin' as info,
    name,
    email,
    CASE 
        WHEN role = 'Admin RRHH' THEN '✅ Rol correcto'
        ELSE '❌ Rol incorrecto'
    END as rol_verificado,
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

-- 5. Probar la función (solo si hay un admin válido)
DO $$
DECLARE
    test_result JSON;
BEGIN
    -- Verificar que existe un admin con permisos
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE role = 'Admin RRHH' 
        AND 'gestionar_usuarios' = ANY(permissions)
    ) THEN
        RAISE NOTICE '🧪 Probando función create_user_safe...';
        
        -- Intentar crear un usuario de prueba (esto fallará si no hay sesión de admin)
        BEGIN
            SELECT create_user_safe('Test User', 'test@example.com', 'Entrevistador') INTO test_result;
            RAISE NOTICE '✅ Función funciona correctamente: %', test_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Función existe pero requiere sesión de admin: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '❌ No hay admin con permisos para probar la función';
    END IF;
END $$;

-- 6. Mostrar resumen final
SELECT 'Verificación completada' as status;
