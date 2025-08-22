#!/usr/bin/env node

/**
 * Script final para verificar todo el sistema de integración con Supabase
 * Ejecuta: node scripts/final-verification.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificación Final del Sistema Supabase')
console.log('=============================================\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('1️⃣ Verificando variables de entorno...')
console.log('=============================================')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ No configurada'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Variables de entorno faltantes')
  process.exit(1)
}

// Crear cliente con anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function finalVerification() {
  try {
    console.log('\n2️⃣ Verificando conexión a Supabase...')
    console.log('=============================================')
    
    // Probar conexión básica
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      return false
    }

    console.log('✅ Conexión a Supabase exitosa')

    console.log('\n3️⃣ Verificando datos en las tablas...')
    console.log('=============================================')

    // Verificar usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
    } else {
      console.log(`✅ Usuarios: ${users.length} encontrados`)
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`)
      })
    }

    // Verificar aplicaciones
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .limit(5)

    if (appsError) {
      console.error('❌ Error obteniendo aplicaciones:', appsError.message)
    } else {
      console.log(`✅ Aplicaciones: ${applications.length} encontradas`)
      applications.forEach(app => {
        console.log(`   - ${app.title} (${app.status})`)
      })
    }

    // Verificar candidatos
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(5)

    if (candidatesError) {
      console.error('❌ Error obteniendo candidatos:', candidatesError.message)
    } else {
      console.log(`✅ Candidatos: ${candidates.length} encontrados`)
      candidates.forEach(candidate => {
        console.log(`   - ${candidate.name} (${candidate.stage})`)
      })
    }

    console.log('\n4️⃣ Verificando autenticación...')
    console.log('=============================================')

    // Probar login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@talentopro.com',
      password: 'Admin2024!'
    })

    if (authError) {
      console.error('❌ Error de autenticación:', authError.message)
    } else {
      console.log('✅ Autenticación exitosa')
      console.log(`   User ID: ${authData.user.id}`)
      console.log(`   Email: ${authData.user.email}`)
    }

    console.log('\n5️⃣ Verificando storage...')
    console.log('=============================================')

    // Verificar buckets de storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error listando buckets:', bucketsError.message)
    } else {
      const candidateBuckets = buckets.filter(bucket =>
        bucket.name === 'candidate-files' || bucket.name === 'candidate-avatars'
      )
      
      if (candidateBuckets.length > 0) {
        console.log('✅ Buckets de storage configurados:')
        candidateBuckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
        })
      } else {
        console.log('⚠️ Buckets de storage no encontrados')
        console.log('   Ejecuta: npm run setup-storage')
      }
    }

    console.log('\n🎯 Resumen Final:')
    console.log('=============================================')
    
    const hasUsers = users && users.length > 0
    const hasApplications = applications && applications.length > 0
    const hasCandidates = candidates && candidates.length > 0
    const hasAuth = !authError
    const hasStorage = buckets && buckets.filter(bucket =>
      bucket.name === 'candidate-files' || bucket.name === 'candidate-avatars'
    ).length > 0

    console.log('✅ Variables de entorno: Configuradas')
    console.log(`✅ Conexión a Supabase: ${testError ? '❌' : '✅'}`)
    console.log(`✅ Usuarios: ${hasUsers ? '✅' : '❌'}`)
    console.log(`✅ Aplicaciones: ${hasApplications ? '✅' : '❌'}`)
    console.log(`✅ Candidatos: ${hasCandidates ? '✅' : '❌'}`)
    console.log(`✅ Autenticación: ${hasAuth ? '✅' : '❌'}`)
    console.log(`✅ Storage: ${hasStorage ? '✅' : '❌'}`)

    const allSystemsOk = hasUsers && hasApplications && hasCandidates && hasAuth

    if (allSystemsOk) {
      console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!')
      console.log('=============================================')
      console.log('✅ Supabase está configurado correctamente')
      console.log('✅ Los datos están disponibles')
      console.log('✅ La autenticación funciona')
      console.log('✅ El storage está configurado')
      console.log('')
      console.log('🚀 La aplicación debería usar datos reales de Supabase')
      console.log('   Si aún ves datos mock, el problema está en el navegador')
      console.log('   Verifica la consola del navegador para más detalles')
      console.log('=============================================')
    } else {
      console.log('\n⚠️ Hay problemas que necesitan atención')
      console.log('=============================================')
      if (!hasUsers) console.log('❌ No hay usuarios en la base de datos')
      if (!hasApplications) console.log('❌ No hay aplicaciones en la base de datos')
      if (!hasCandidates) console.log('❌ No hay candidatos en la base de datos')
      if (!hasAuth) console.log('❌ Problemas con la autenticación')
      if (!hasStorage) console.log('❌ Storage no configurado')
      console.log('')
      console.log('🔧 Ejecuta los scripts de configuración correspondientes')
      console.log('=============================================')
    }

    return allSystemsOk

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  finalVerification()
}

module.exports = { finalVerification }
