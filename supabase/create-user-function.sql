-- =====================================================
-- FUNCIÓN PARA CREAR USUARIOS DE FORMA SEGURA
-- =====================================================
-- Esta función permite crear usuarios sin necesidad de permisos de admin de Supabase Auth
-- =====================================================

-- Crear función para crear usuarios
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

-- Comentario sobre la función
COMMENT ON FUNCTION create_user_safe IS 'Función segura para crear usuarios. Solo usuarios admin pueden ejecutarla.';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'Función create_user_safe creada exitosamente' as status;
