#!/usr/bin/env node

/**
 * Script para diagnosticar problemas con la tabla postulations
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

console.log('🔍 DIAGNÓSTICO DE TABLA POSTULATIONS')
console.log('=' .repeat(50))

async function checkDatabaseStructure() {
  console.log('\n1️⃣ Verificando estructura de base de datos...')
  
  try {
    // Verificar si la tabla postulations existe
    console.log('📋 Verificando tabla postulations...')
    const { data: postulationsTest, error: postulationsError } = await supabase
      .from('postulations')
      .select('id')
      .limit(1)
    
    if (postulationsError) {
      console.log('❌ Error con tabla postulations:', postulationsError.message)
      console.log('📋 Código de error:', postulationsError.code)
      console.log('📋 Detalles:', postulationsError.details)
      return false
    } else {
      console.log('✅ Tabla postulations existe y es accesible')
    }
    
    // Verificar tabla candidates
    console.log('📋 Verificando tabla candidates...')
    const { data: candidatesTest, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, application_id')
      .limit(5)
    
    if (candidatesError) {
      console.log('❌ Error con tabla candidates:', candidatesError.message)
      return false
    } else {
      console.log('✅ Tabla candidates existe y es accesible')
      console.log('📊 Candidatos encontrados:', candidatesTest?.length || 0)
    }
    
    // Verificar tabla applications
    console.log('📋 Verificando tabla applications...')
    const { data: applicationsTest, error: applicationsError } = await supabase
      .from('applications')
      .select('id, title, status')
      .limit(5)
    
    if (applicationsError) {
      console.log('❌ Error con tabla applications:', applicationsError.message)
      return false
    } else {
      console.log('✅ Tabla applications existe y es accesible')
      console.log('📊 Aplicaciones encontradas:', applicationsTest?.length || 0)
    }
    
    return true
  } catch (error) {
    console.error('❌ Error verificando estructura:', error)
    return false
  }
}

async function testPostulationsQuery() {
  console.log('\n2️⃣ Probando consulta problemática...')
  
  try {
    // Probar la consulta exacta que está fallando
    console.log('🔍 Probando consulta: postulations?select=id&candidate_id=eq.1&application_id=eq.8')
    
    const { data, error } = await supabase
      .from('postulations')
      .select('id')
      .eq('candidate_id', 1)
      .eq('application_id', 8)
      .single()
    
    if (error) {
      console.log('❌ Error en consulta:', error.message)
      console.log('📋 Código:', error.code)
      console.log('📋 Detalles:', error.details)
      
      // Probar consulta más simple
      console.log('\n🔄 Probando consulta simple...')
      const { data: simpleData, error: simpleError } = await supabase
        .from('postulations')
        .select('*')
        .limit(1)
      
      if (simpleError) {
        console.log('❌ Error en consulta simple:', simpleError.message)
        return false
      } else {
        console.log('✅ Consulta simple funciona')
        console.log('📊 Datos de ejemplo:', simpleData)
      }
      
      return false
    } else {
      console.log('✅ Consulta funciona correctamente')
      console.log('📊 Resultado:', data)
      return true
    }
  } catch (error) {
    console.error('❌ Error en prueba de consulta:', error)
    return false
  }
}

async function checkPostulationsData() {
  console.log('\n3️⃣ Verificando datos en postulations...')
  
  try {
    // Obtener todos los registros de postulations
    const { data, error } = await supabase
      .from('postulations')
      .select('*')
    
    if (error) {
      console.log('❌ Error obteniendo datos:', error.message)
      return false
    }
    
    console.log('📊 Total registros en postulations:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('📋 Primeros 3 registros:')
      data.slice(0, 3).forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}, Candidate: ${record.candidate_id}, App: ${record.application_id}`)
      })
    } else {
      console.log('⚠️ Tabla postulations está vacía')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error verificando datos:', error)
    return false
  }
}

async function testCandidateUpdate() {
  console.log('\n4️⃣ Probando actualización de candidato...')
  
  try {
    // Obtener un candidato existente
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('id, name, application_id')
      .limit(1)
      .single()
    
    if (candidateError || !candidate) {
      console.log('❌ No se encontró candidato para probar')
      return false
    }
    
    console.log('📋 Candidato para prueba:', candidate)
    
    // Probar actualización simple
    const { data: updateResult, error: updateError } = await supabase
      .from('candidates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', candidate.id)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Error actualizando candidato:', updateError.message)
      return false
    } else {
      console.log('✅ Actualización de candidato funciona')
      return true
    }
  } catch (error) {
    console.error('❌ Error en prueba de actualización:', error)
    return false
  }
}

async function createPostulationsTable() {
  console.log('\n5️⃣ Creando tabla postulations si no existe...')
  
  try {
    // SQL para crear la tabla postulations
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS postulations (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        stage VARCHAR(50) DEFAULT 'Pre-entrevista',
        score INTEGER DEFAULT 5,
        status VARCHAR(20) DEFAULT 'pending',
        assignee_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(candidate_id, application_id)
      );
      
      -- Crear índices para mejorar rendimiento
      CREATE INDEX IF NOT EXISTS idx_postulations_candidate_id ON postulations(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_postulations_application_id ON postulations(application_id);
      CREATE INDEX IF NOT EXISTS idx_postulations_stage ON postulations(stage);
    `
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.log('❌ Error creando tabla:', error.message)
      console.log('💡 La tabla puede necesitar ser creada manualmente en Supabase')
      return false
    } else {
      console.log('✅ Tabla postulations creada/verificada')
      return true
    }
  } catch (error) {
    console.error('❌ Error en creación de tabla:', error)
    return false
  }
}

async function runDiagnostics() {
  console.log('🚀 Ejecutando diagnóstico completo...\n')
  
  const results = []
  
  // Verificar estructura
  const structureOk = await checkDatabaseStructure()
  results.push({ name: 'Estructura de BD', success: structureOk })
  
  // Verificar datos
  const dataOk = await checkPostulationsData()
  results.push({ name: 'Datos en postulations', success: dataOk })
  
  // Probar consulta
  const queryOk = await testPostulationsQuery()
  results.push({ name: 'Consulta problemática', success: queryOk })
  
  // Probar actualización
  const updateOk = await testCandidateUpdate()
  results.push({ name: 'Actualización candidato', success: updateOk })
  
  // Crear tabla si es necesario
  if (!structureOk) {
    const createOk = await createPostulationsTable()
    results.push({ name: 'Creación tabla', success: createOk })
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('🔬 RESUMEN DEL DIAGNÓSTICO:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n🎯 Resultado: ${passed}/${total} pruebas pasaron`)
  
  if (passed === total) {
    console.log('\n🎉 ¡PROBLEMA RESUELTO!')
    console.log('✅ La tabla postulations está funcionando correctamente')
    console.log('✅ Las consultas y actualizaciones funcionan')
  } else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:')
    console.log('💡 Posibles soluciones:')
    console.log('1. Verificar que la tabla postulations existe en Supabase')
    console.log('2. Verificar permisos RLS (Row Level Security)')
    console.log('3. Verificar que las columnas candidate_id y application_id existen')
    console.log('4. Crear la tabla manualmente si no existe')
  }
  
  return passed === total
}

// Ejecutar diagnóstico
runDiagnostics()
  .then(success => {
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Si hay errores, revisa la consola de Supabase')
    console.log('2. Verifica que la tabla postulations existe')
    console.log('3. Prueba mover candidatos nuevamente')
    
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
