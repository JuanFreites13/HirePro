#!/usr/bin/env node

/**
 * Script para verificar las políticas RLS en Supabase
 * Ejecuta: node scripts/check-rls-policies.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificando políticas RLS en Supabase...')
console.log('=============================================\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Crear cliente con service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkRLSPolicies() {
  try {
    console.log('1️⃣ Verificando políticas RLS en tablas...')
    
    // Verificar políticas en la tabla users
    console.log('\n📋 Tabla: users')
    const { data: userPolicies, error: userPoliciesError } = await supabase
      .rpc('get_policies', { table_name: 'users' })

    if (userPoliciesError) {
      console.log('   ❌ Error obteniendo políticas de users:', userPoliciesError.message)
    } else {
      console.log(`   ✅ Políticas encontradas: ${userPolicies?.length || 0}`)
      if (userPolicies && userPolicies.length > 0) {
        userPolicies.forEach(policy => {
          console.log(`      - ${policy.policyname} (${policy.cmd})`)
        })
      }
    }

    // Verificar políticas en la tabla applications
    console.log('\n📋 Tabla: applications')
    const { data: appPolicies, error: appPoliciesError } = await supabase
      .rpc('get_policies', { table_name: 'applications' })

    if (appPoliciesError) {
      console.log('   ❌ Error obteniendo políticas de applications:', appPoliciesError.message)
    } else {
      console.log(`   ✅ Políticas encontradas: ${appPolicies?.length || 0}`)
      if (appPolicies && appPolicies.length > 0) {
        appPolicies.forEach(policy => {
          console.log(`      - ${policy.policyname} (${policy.cmd})`)
        })
      }
    }

    // Verificar políticas en la tabla candidates
    console.log('\n📋 Tabla: candidates')
    const { data: candidatePolicies, error: candidatePoliciesError } = await supabase
      .rpc('get_policies', { table_name: 'candidates' })

    if (candidatePoliciesError) {
      console.log('   ❌ Error obteniendo políticas de candidates:', candidatePoliciesError.message)
    } else {
      console.log(`   ✅ Políticas encontradas: ${candidatePolicies?.length || 0}`)
      if (candidatePolicies && candidatePolicies.length > 0) {
        candidatePolicies.forEach(policy => {
          console.log(`      - ${policy.policyname} (${policy.cmd})`)
        })
      }
    }

    console.log('\n2️⃣ Probando acceso con anon key...')
    
    // Crear cliente con anon key
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Probar acceso a usuarios
    console.log('\n🔐 Probando acceso a usuarios...')
    const { data: users, error: usersError } = await anonSupabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      console.log('   ❌ Error accediendo a usuarios:', usersError.message)
    } else {
      console.log(`   ✅ Usuarios accesibles: ${users?.length || 0}`)
    }

    // Probar acceso a aplicaciones
    console.log('\n🔐 Probando acceso a aplicaciones...')
    const { data: applications, error: appsError } = await anonSupabase
      .from('applications')
      .select('*')
      .limit(5)

    if (appsError) {
      console.log('   ❌ Error accediendo a aplicaciones:', appsError.message)
    } else {
      console.log(`   ✅ Aplicaciones accesibles: ${applications?.length || 0}`)
    }

    // Probar acceso a candidatos
    console.log('\n🔐 Probando acceso a candidatos...')
    const { data: candidates, error: candidatesError } = await anonSupabase
      .from('candidates')
      .select('*')
      .limit(5)

    if (candidatesError) {
      console.log('   ❌ Error accediendo a candidatos:', candidatesError.message)
    } else {
      console.log(`   ✅ Candidatos accesibles: ${candidates?.length || 0}`)
    }

    console.log('\n🎯 Resumen de verificación RLS:')
    console.log('=============================================')
    
    const hasUserPolicies = userPolicies && userPolicies.length > 0
    const hasAppPolicies = appPolicies && appPolicies.length > 0
    const hasCandidatePolicies = candidatePolicies && candidatePolicies.length > 0
    
    const canAccessUsers = !usersError
    const canAccessApps = !appsError
    const canAccessCandidates = !candidatesError

    console.log(`Políticas RLS configuradas:`)
    console.log(`   - Users: ${hasUserPolicies ? '✅' : '❌'}`)
    console.log(`   - Applications: ${hasAppPolicies ? '✅' : '❌'}`)
    console.log(`   - Candidates: ${hasCandidatePolicies ? '✅' : '❌'}`)
    
    console.log(`\nAcceso con anon key:`)
    console.log(`   - Users: ${canAccessUsers ? '✅' : '❌'}`)
    console.log(`   - Applications: ${canAccessApps ? '✅' : '❌'}`)
    console.log(`   - Candidates: ${canAccessCandidates ? '✅' : '❌'}`)

    if (!hasUserPolicies || !hasAppPolicies || !hasCandidatePolicies) {
      console.log('\n⚠️  Algunas políticas RLS no están configuradas')
      console.log('   Ejecuta: supabase/fix-rls-final.sql en el SQL Editor')
    }

    if (!canAccessUsers || !canAccessApps || !canAccessCandidates) {
      console.log('\n⚠️  Problemas de acceso con anon key')
      console.log('   Verifica las políticas RLS')
    }

    if (hasUserPolicies && hasAppPolicies && hasCandidatePolicies && 
        canAccessUsers && canAccessApps && canAccessCandidates) {
      console.log('\n✅ Todas las políticas RLS están configuradas correctamente')
      console.log('   El problema puede estar en la detección de variables de entorno')
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkRLSPolicies()
}

module.exports = { checkRLSPolicies }


