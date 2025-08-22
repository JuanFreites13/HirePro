#!/usr/bin/env node

/**
 * Script para crear usuarios por defecto en Supabase
 * Ejecuta: node scripts/create-default-users.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Ejecuta: npm run setup-supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const defaultUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Admin TalentoPro',
    email: 'admin@talentopro.com',
    role: 'Admin RRHH',
    permissions: [
      'crear_postulaciones',
      'mover_etapas',
      'ver_todas_postulaciones',
      'gestionar_usuarios',
      'acceso_configuracion',
      'eliminar_candidatos',
      'editar_postulaciones'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'María González',
    email: 'maria@empresa.com',
    role: 'Admin RRHH',
    permissions: [
      'crear_postulaciones',
      'mover_etapas',
      'ver_todas_postulaciones',
      'gestionar_usuarios',
      'acceso_configuracion'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Carlos Rodríguez',
    email: 'carlos@empresa.com',
    role: 'Entrevistador',
    permissions: ['mover_etapas', 'ver_postulaciones_asignadas']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Ana Martínez',
    email: 'ana@empresa.com',
    role: 'Entrevistador',
    permissions: ['ver_postulaciones_asignadas']
  }
]

async function createDefaultUsers() {
  console.log('🚀 Creando usuarios por defecto en Supabase...')
  console.log('=============================================\n')

  try {
    // Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conexión a Supabase:', testError.message)
      console.log('Asegúrate de que:')
      console.log('1. Las credenciales de Supabase son correctas')
      console.log('2. La tabla "users" existe (ejecuta supabase/init.sql primero)')
      process.exit(1)
    }

    console.log('✅ Conexión a Supabase establecida\n')

    // Crear usuarios
    for (const user of defaultUsers) {
      console.log(`📝 Creando usuario: ${user.name} (${user.email})`)
      
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select()

      if (error) {
        console.error(`❌ Error creando ${user.email}:`, error.message)
      } else {
        console.log(`✅ Usuario ${user.email} creado/actualizado exitosamente`)
      }
    }

    // Verificar usuarios creados
    console.log('\n📊 Verificando usuarios creados...')
    const { data: users, error: listError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at')

    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
    } else {
      console.log('\n👥 Usuarios en la base de datos:')
      console.log('=============================================')
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`)
      })
      console.log('=============================================')
    }

    console.log('\n🔑 Credenciales de acceso:')
    console.log('=============================================')
    console.log('Admin Principal: admin@talentopro.com / 123456')
    console.log('Admin Secundario: maria@empresa.com / 123456')
    console.log('Entrevistador: carlos@empresa.com / 123456')
    console.log('Entrevistador (solo lectura): ana@empresa.com / 123456')
    console.log('=============================================')

    console.log('\n🎉 ¡Usuarios creados exitosamente!')
    console.log('Ahora puedes iniciar sesión en la aplicación.')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDefaultUsers()
}

module.exports = { createDefaultUsers }

