#!/usr/bin/env node

/**
 * Script para actualizar contraseñas de usuarios con contraseñas más seguras
 * Ejecuta: node scripts/update-passwords.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const usersToUpdate = [
  {
    email: 'admin@talentopro.com',
    newPassword: 'Admin2024!',
    name: 'Admin TalentoPro'
  },
  {
    email: 'maria@empresa.com',
    newPassword: 'Maria2024!',
    name: 'María González'
  },
  {
    email: 'carlos@empresa.com',
    newPassword: 'Carlos2024!',
    name: 'Carlos Rodríguez'
  },
  {
    email: 'ana@empresa.com',
    newPassword: 'Ana2024!',
    name: 'Ana Martínez'
  }
]

async function updatePasswords() {
  console.log('🔐 Actualizando contraseñas de usuarios...')
  console.log('=============================================\n')

  try {
    for (const user of usersToUpdate) {
      console.log(`🔄 Actualizando contraseña para: ${user.email}`)
      
      // Obtener el usuario primero para obtener su ID
      const { data: userData, error: getUserError } = await supabase.auth.admin.listUsers()
      
      if (getUserError) {
        console.error(`❌ Error obteniendo usuarios:`, getUserError.message)
        continue
      }

      const targetUser = userData.users.find(u => u.email === user.email)
      
      if (!targetUser) {
        console.error(`❌ Usuario ${user.email} no encontrado`)
        continue
      }

      // Actualizar contraseña usando el ID del usuario
      const { data, error } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: user.newPassword }
      )

      if (error) {
        console.error(`❌ Error actualizando ${user.email}:`, error.message)
      } else {
        console.log(`✅ Contraseña actualizada para ${user.email}`)
      }
    }

    console.log('\n🔑 Nuevas credenciales de acceso:')
    console.log('=============================================')
    usersToUpdate.forEach(user => {
      console.log(`${user.name}: ${user.email} / ${user.newPassword}`)
    })
    console.log('=============================================')

    console.log('\n🎉 ¡Contraseñas actualizadas exitosamente!')
    console.log('Ahora puedes iniciar sesión sin problemas de seguridad del navegador.')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updatePasswords()
}

module.exports = { updatePasswords }
