#!/usr/bin/env node

/**
 * Script para diagnosticar la configuración de Supabase
 * Ejecuta: node scripts/debug-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Diagnóstico de configuración de Supabase')
console.log('=============================================\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Variables de entorno:')
console.log('=============================================')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`)
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ No configurada'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ No configurada'}`)
console.log('=============================================\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Ejecuta: npm run setup-supabase')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseConnection() {
  console.log('🔗 Probando conexión a Supabase...')
  console.log('=============================================\n')

  try {
    // Probar conexión básica
    console.log('1️⃣ Probando conexión básica...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      return false
    }

    console.log('✅ Conexión básica exitosa\n')

    // Probar obtener usuarios
    console.log('2️⃣ Probando obtener usuarios...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
      return false
    }

    console.log(`✅ Usuarios obtenidos: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`)
    })
    console.log('')

    // Probar obtener aplicaciones
    console.log('3️⃣ Probando obtener aplicaciones...')
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .limit(5)

    if (appsError) {
      console.error('❌ Error obteniendo aplicaciones:', appsError.message)
      return false
    }

    console.log(`✅ Aplicaciones obtenidas: ${applications.length}`)
    applications.forEach(app => {
      console.log(`   - ${app.title} (${app.status})`)
    })
    console.log('')

    // Probar obtener candidatos
    console.log('4️⃣ Probando obtener candidatos...')
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(5)

    if (candidatesError) {
      console.error('❌ Error obteniendo candidatos:', candidatesError.message)
      return false
    }

    console.log(`✅ Candidatos obtenidos: ${candidates.length}`)
    candidates.forEach(candidate => {
      console.log(`   - ${candidate.name} (${candidate.stage})`)
    })
    console.log('')

    return true

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

async function testAuthentication() {
  console.log('🔐 Probando autenticación...')
  console.log('=============================================\n')

  try {
    // Probar login
    console.log('1️⃣ Probando login...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@talentopro.com',
      password: 'Admin2024!'
    })

    if (error) {
      console.error('❌ Error de login:', error.message)
      return false
    }

    console.log('✅ Login exitoso')
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)
    console.log('')

    // Probar obtener perfil
    console.log('2️⃣ Probando obtener perfil...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@talentopro.com')
      .single()

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message)
      return false
    }

    console.log('✅ Perfil obtenido exitosamente')
    console.log(`   Nombre: ${profile.name}`)
    console.log(`   Rol: ${profile.role}`)
    console.log('')

    return true

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

async function main() {
  const connectionOk = await testSupabaseConnection()
  
  if (connectionOk) {
    await testAuthentication()
  }

  console.log('🎯 Resumen del diagnóstico:')
  console.log('=============================================')
  if (connectionOk) {
    console.log('✅ Supabase está configurado correctamente')
    console.log('✅ La aplicación debería usar datos reales')
    console.log('')
    console.log('🔧 Si sigues viendo datos mock, verifica:')
    console.log('   1. Que el navegador esté usando las variables de entorno')
    console.log('   2. Que no haya errores en la consola del navegador')
    console.log('   3. Que las políticas RLS estén configuradas correctamente')
  } else {
    console.log('❌ Hay problemas con la configuración de Supabase')
    console.log('🔧 Ejecuta: npm run setup-supabase')
  }
  console.log('=============================================')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
}

module.exports = { testSupabaseConnection, testAuthentication }

