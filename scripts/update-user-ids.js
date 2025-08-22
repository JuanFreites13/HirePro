#!/usr/bin/env node

/**
 * Script para actualizar IDs de usuarios en la tabla users
 * para que coincidan con auth.users
 * Ejecuta: node scripts/update-user-ids.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Usar service role key para acceder a auth.users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const userEmails = [
  'admin@talentopro.com',
  'maria@empresa.com',
  'carlos@empresa.com',
  'ana@empresa.com'
]

async function updateUserIds() {
  console.log('🔄 Actualizando IDs de usuarios...')
  console.log('=============================================\n')

  try {
    // Obtener usuarios de auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error obteniendo usuarios de auth:', authError.message)
      return
    }

    // Filtrar usuarios que necesitamos
    const targetAuthUsers = authUsers.users.filter(user => 
      userEmails.includes(user.email)
    )

    console.log('📊 Usuarios encontrados en auth.users:')
    targetAuthUsers.forEach(user => {
      console.log(`- ${user.email}: ${user.id}`)
    })

    // Actualizar cada usuario en la tabla users
    for (const authUser of targetAuthUsers) {
      console.log(`\n🔄 Actualizando ${authUser.email}...`)
      
      // Determinar el rol y permisos según el email
      let role, permissions
      
      switch (authUser.email) {
        case 'admin@talentopro.com':
          role = 'Admin RRHH'
          permissions = [
            'crear_postulaciones',
            'mover_etapas',
            'ver_todas_postulaciones',
            'gestionar_usuarios',
            'acceso_configuracion',
            'eliminar_candidatos',
            'editar_postulaciones'
          ]
          break
        case 'maria@empresa.com':
          role = 'Admin RRHH'
          permissions = [
            'crear_postulaciones',
            'mover_etapas',
            'ver_todas_postulaciones',
            'gestionar_usuarios',
            'acceso_configuracion'
          ]
          break
        case 'carlos@empresa.com':
          role = 'Entrevistador'
          permissions = ['mover_etapas', 'ver_postulaciones_asignadas']
          break
        case 'ana@empresa.com':
          role = 'Entrevistador'
          permissions = ['ver_postulaciones_asignadas']
          break
        default:
          role = 'Entrevistador'
          permissions = []
      }

      // Eliminar usuario existente si existe
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', authUser.email)

      if (deleteError) {
        console.error(`❌ Error eliminando ${authUser.email}:`, deleteError.message)
      }

      // Insertar usuario con el ID correcto
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email,
          email: authUser.email,
          role: role,
          permissions: permissions
        })

      if (insertError) {
        console.error(`❌ Error insertando ${authUser.email}:`, insertError.message)
      } else {
        console.log(`✅ ${authUser.email} actualizado exitosamente`)
      }
    }

    // Verificar usuarios actualizados
    console.log('\n📊 Verificando usuarios actualizados...')
    const { data: updatedUsers, error: listError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('email', userEmails)
      .order('created_at')

    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
    } else {
      console.log('\n👥 Usuarios en la tabla users:')
      console.log('=============================================')
      updatedUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`)
        console.log(`  ID: ${user.id}`)
      })
      console.log('=============================================')
    }

    console.log('\n🎉 ¡IDs de usuarios actualizados exitosamente!')
    console.log('Ahora puedes iniciar sesión con admin@talentopro.com / 123456')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateUserIds()
}

module.exports = { updateUserIds }

