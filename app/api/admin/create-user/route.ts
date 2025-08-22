import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, area, position } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, email, password, role' },
        { status: 400 }
      )
    }

    console.log('🆕 Creando usuario en Supabase Auth:', email)

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role,
        area: area || null,
        position: position || null
      }
    })

    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError)
      return NextResponse.json(
        { error: `Error creando usuario en Auth: ${authError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ Usuario creado en Auth:', authUser.user?.id)

    // 2. Define permissions based on role
    const permissions = getPermissionsByRole(role)

    // 3. Create user record in our users table
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user!.id, // Use the same ID from Auth
        name,
        email,
        role,
        area: area || null,
        position: position || null,
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error creando usuario en DB:', dbError)
      // If DB creation fails, delete the Auth user to avoid orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(authUser.user!.id)
      return NextResponse.json(
        { error: `Error guardando usuario en DB: ${dbError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ Usuario creado exitosamente en DB:', dbUser)

    return NextResponse.json({
      success: true,
      user: dbUser,
      message: 'Usuario creado exitosamente. Ya puede iniciar sesión.'
    })

  } catch (error: any) {
    console.error('❌ Error en create-user API:', error)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    )
  }
}

function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case 'Admin RRHH':
      return [
        'crear_postulaciones',
        'mover_etapas',
        'ver_todas_postulaciones',
        'gestionar_usuarios',
        'acceso_configuracion',
        'eliminar_candidatos',
        'editar_postulaciones',
        'usar_ia'
      ]
    case 'Entrevistador':
      return [
        'crear_postulaciones',
        'mover_etapas',
        'ver_postulaciones_asignadas',
        'editar_postulaciones',
        'usar_ia'
      ]
    default:
      return []
  }
}
