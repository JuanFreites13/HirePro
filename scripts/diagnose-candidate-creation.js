// Script para diagnosticar problemas en la creación de candidatos
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://cyxzlsshmteudtvinzrj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eHpsc3NobXRldWR0dmluenJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDQ2MDgsImV4cCI6MjA3MDc4MDYwOH0.ZnP0vDHGT4BVaupCxF0E4ws5bVWwgwqMnArDWYqpciJ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseCandidateCreation() {
  console.log('🔍 DIAGNÓSTICO DE CREACIÓN DE CANDIDATOS')
  console.log('==========================================\n')

  try {
    // 1. Verificar conexión
    console.log('1. 🔌 Verificando conexión a Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('candidates')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Error de conexión:', testError)
      return
    }
    console.log('✅ Conexión exitosa\n')

    // 2. Verificar estructura de la tabla
    console.log('2. 📋 Verificando estructura de la tabla candidates...')
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'candidates' })
    
    if (structureError) {
      console.log('⚠️ No se pudo obtener estructura, intentando método alternativo...')
      // Intentar obtener información básica
      const { data: sample, error: sampleError } = await supabase
        .from('candidates')
        .select('*')
        .limit(1)
      
      if (sampleError) {
        console.log('❌ Error al acceder a la tabla:', sampleError)
        console.log('❌ Código:', sampleError.code)
        console.log('❌ Mensaje:', sampleError.message)
        console.log('❌ Detalles:', sampleError.details)
      } else {
        console.log('✅ Tabla accesible, columnas disponibles:', Object.keys(sample[0] || {}))
      }
    } else {
      console.log('✅ Estructura obtenida:', structure)
    }
    console.log()

    // 3. Verificar RLS (Row Level Security)
    console.log('3. 🔒 Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'candidates')
    
    if (policiesError) {
      console.log('⚠️ No se pudieron obtener políticas RLS:', policiesError.message)
    } else {
      console.log('✅ Políticas RLS encontradas:', policies.length)
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`)
      })
    }
    console.log()

    // 4. Intentar crear un candidato de prueba
    console.log('4. 🧪 Intentando crear candidato de prueba...')
    const testCandidate = {
      name: 'Test Candidate',
      email: 'test@example.com',
      phone: '+1234567890',
      position: 'Test Position',
      stage: 'pre-entrevista',
      score: 5,
      status: 'pending',
      assignee_id: null,
      application_id: 1,
      experience: 'Test experience',
      location: 'Test location',
      avatar: '',
      applied_at: new Date().toISOString()
    }

    console.log('📝 Datos de prueba:', testCandidate)

    const { data: createdCandidate, error: createError } = await supabase
      .from('candidates')
      .insert(testCandidate)
      .select()
      .single()

    if (createError) {
      console.log('❌ Error al crear candidato de prueba:')
      console.log('❌ Código:', createError.code)
      console.log('❌ Mensaje:', createError.message)
      console.log('❌ Detalles:', createError.details)
      console.log('❌ Hint:', createError.hint)
    } else {
      console.log('✅ Candidato de prueba creado exitosamente:', createdCandidate.id)
      
      // Limpiar el candidato de prueba
      await supabase
        .from('candidates')
        .delete()
        .eq('id', createdCandidate.id)
      console.log('🧹 Candidato de prueba eliminado')
    }
    console.log()

    // 5. Verificar aplicaciones disponibles
    console.log('5. 📋 Verificando aplicaciones disponibles...')
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, title')
      .limit(5)
    
    if (appsError) {
      console.log('❌ Error al obtener aplicaciones:', appsError.message)
    } else {
      console.log('✅ Aplicaciones disponibles:')
      applications.forEach(app => {
        console.log(`   - ID: ${app.id}, Título: ${app.title}`)
      })
    }

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error)
  }
}

// Ejecutar diagnóstico
diagnoseCandidateCreation()
  .then(() => {
    console.log('\n🎯 DIAGNÓSTICO COMPLETADO')
    console.log('==========================')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

