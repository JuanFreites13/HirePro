#!/usr/bin/env node

/**
 * Script para arreglar todas las relaciones entre usuarios y aplicaciones
 * Ejecuta: node scripts/fix-all-relationships.js
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

// Mapeo de emails a IDs reales de auth.users
const emailToIdMap = {
  'admin@talentopro.com': '6f980eec-4d9b-4d6e-8aa8-312e900a7c75',
  'maria@empresa.com': 'f72ff0d9-090d-4d30-8e26-c394ef7bfa27',
  'carlos@empresa.com': '936b0988-b052-4321-beeb-576b17e05c17',
  'ana@empresa.com': '05c1ed6a-d705-43f8-a8d4-7e13f4d426f6'
}

async function fixAllRelationships() {
  console.log('🔧 Arreglando todas las relaciones...')
  console.log('=============================================\n')

  try {
    // 1. Actualizar aplicaciones para usar los IDs correctos
    console.log('📝 Actualizando aplicaciones...')
    
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')

    if (appsError) {
      console.error('❌ Error obteniendo aplicaciones:', appsError.message)
      return
    }

    for (const app of applications) {
      // Buscar el usuario por email en la tabla users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', app.responsible_id)
        .single()

      if (user && emailToIdMap[user.email]) {
        const newId = emailToIdMap[user.email]
        console.log(`🔄 Actualizando aplicación ${app.id} (${app.title})`)
        console.log(`   Responsable: ${user.email} (${app.responsible_id} → ${newId})`)

        const { error: updateError } = await supabase
          .from('applications')
          .update({ responsible_id: newId })
          .eq('id', app.id)

        if (updateError) {
          console.error(`❌ Error actualizando aplicación ${app.id}:`, updateError.message)
        } else {
          console.log(`✅ Aplicación ${app.id} actualizada`)
        }
      }
    }

    // 2. Actualizar candidatos para usar los IDs correctos
    console.log('\n📝 Actualizando candidatos...')
    
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')

    if (candidatesError) {
      console.error('❌ Error obteniendo candidatos:', candidatesError.message)
      return
    }

    for (const candidate of candidates) {
      // Buscar el usuario por email en la tabla users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', candidate.assignee_id)
        .single()

      if (user && emailToIdMap[user.email]) {
        const newId = emailToIdMap[user.email]
        console.log(`🔄 Actualizando candidato ${candidate.id} (${candidate.name})`)
        console.log(`   Asignado a: ${user.email} (${candidate.assignee_id} → ${newId})`)

        const { error: updateError } = await supabase
          .from('candidates')
          .update({ assignee_id: newId })
          .eq('id', candidate.id)

        if (updateError) {
          console.error(`❌ Error actualizando candidato ${candidate.id}:`, updateError.message)
        } else {
          console.log(`✅ Candidato ${candidate.id} actualizado`)
        }
      }
    }

    // 3. Ahora actualizar los usuarios con los IDs correctos
    console.log('\n📝 Actualizando usuarios...')
    
    for (const [email, correctId] of Object.entries(emailToIdMap)) {
      console.log(`🔄 Actualizando usuario ${email}...`)
      
      // Obtener datos del usuario actual
      const { data: currentUser, error: getUserError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (getUserError) {
        console.error(`❌ Error obteniendo usuario ${email}:`, getUserError.message)
        continue
      }

      // Eliminar usuario actual
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', email)

      if (deleteError) {
        console.error(`❌ Error eliminando usuario ${email}:`, deleteError.message)
        continue
      }

      // Insertar usuario con ID correcto
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: correctId,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          permissions: currentUser.permissions
        })

      if (insertError) {
        console.error(`❌ Error insertando usuario ${email}:`, insertError.message)
      } else {
        console.log(`✅ Usuario ${email} actualizado con ID ${correctId}`)
      }
    }

    // 4. Verificar todo
    console.log('\n📊 Verificando todas las relaciones...')
    
    const { data: finalUsers, error: finalUsersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at')

    if (finalUsersError) {
      console.error('❌ Error listando usuarios finales:', finalUsersError.message)
    } else {
      console.log('\n👥 Usuarios finales:')
      console.log('=============================================')
      finalUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`)
        console.log(`  ID: ${user.id}`)
      })
      console.log('=============================================')
    }

    console.log('\n🎉 ¡Todas las relaciones arregladas exitosamente!')
    console.log('Ahora puedes iniciar sesión con admin@talentopro.com / 123456')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAllRelationships()
}

module.exports = { fixAllRelationships }

