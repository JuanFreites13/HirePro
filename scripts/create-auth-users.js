#!/usr/bin/env node

/**
 * Script para crear usuarios en Supabase Auth
 * Requiere SERVICE_ROLE_KEY para funcionar
 * Ejecuta: node scripts/create-auth-users.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Asegúrate de tener:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  console.log('\nEjecuta: npm run setup-supabase')
  process.exit(1)
}

// Usar service role key para crear usuarios
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const defaultUsers = [
  {
    email: 'admin@talentopro.com',
    password: '123456',
    user_metadata: { name: 'Admin TalentoPro' }
  },
  {
    email: 'maria@empresa.com',
    password: '123456',
    user_metadata: { name: 'María González' }
  },
  {
    email: 'carlos@empresa.com',
    password: '123456',
    user_metadata: { name: 'Carlos Rodríguez' }
  },
  {
    email: 'ana@empresa.com',
    password: '123456',
    user_metadata: { name: 'Ana Martínez' }
  }
]

async function createAuthUsers() {
  console.log('🚀 Creando usuarios en Supabase Auth...')
  console.log('=============================================\n')

  try {
    for (const user of defaultUsers) {
      console.log(`📝 Creando usuario: ${user.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true // Confirmar email automáticamente
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  Usuario ${user.email} ya existe`)
        } else {
          console.error(`❌ Error creando ${user.email}:`, error.message)
        }
      } else {
        console.log(`✅ Usuario ${user.email} creado exitosamente`)
      }
    }

    // Listar usuarios creados
    console.log('\n📊 Verificando usuarios creados...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
    } else {
      const createdUsers = users.users.filter(user => 
        defaultUsers.some(defaultUser => defaultUser.email === user.email)
      )
      
      console.log('\n👥 Usuarios en Supabase Auth:')
      console.log('=============================================')
      createdUsers.forEach(user => {
        console.log(`- ${user.user_metadata?.name || user.email} (${user.email})`)
        console.log(`  ID: ${user.id}`)
        console.log(`  Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
        console.log('')
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

    console.log('\n🎉 ¡Usuarios creados en Supabase Auth!')
    console.log('Ahora puedes iniciar sesión con autenticación real.')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAuthUsers()
}

module.exports = { createAuthUsers }

