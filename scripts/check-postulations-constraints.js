#!/usr/bin/env node

/**
 * Script para verificar las restricciones de la tabla postulations
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

console.log('🔍 VERIFICANDO RESTRICCIONES DE POSTULATIONS')
console.log('=' .repeat(50))

async function checkPostulationsConstraints() {
  console.log('\n1️⃣ Verificando estructura de tabla postulations...')
  
  try {
    // Intentar insertar con diferentes valores de status para ver cuáles funcionan
    const testValues = ['active', 'pending', 'completed', 'rejected', 'on-hold', 'scheduled', 'stalled']
    
    console.log('📋 Probando valores de status permitidos...')
    
    for (const statusValue of testValues) {
      try {
        console.log(`🔍 Probando status: "${statusValue}"`)
        
        const { data, error } = await supabase
          .from('postulations')
          .insert({
            candidate_id: 1,
            application_id: 1,
            stage: 'Test',
            score: 5,
            status: statusValue,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) {
          console.log(`❌ "${statusValue}" - Error: ${error.message}`)
          if (error.code === '23514') {
            console.log(`   📋 Es un error de constraint check`)
          }
        } else {
          console.log(`✅ "${statusValue}" - Funciona`)
          
          // Limpiar el registro de prueba
          await supabase
            .from('postulations')
            .delete()
            .eq('id', data.id)
        }
      } catch (testError) {
        console.log(`❌ "${statusValue}" - Error: ${testError.message}`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Error verificando constraints:', error)
    return false
  }
}

async function testValidInsert() {
  console.log('\n2️⃣ Probando inserción válida...')
  
  try {
    const { data, error } = await supabase
      .from('postulations')
      .insert({
        candidate_id: 1,
        application_id: 1,
        stage: 'Pre-entrevista',
        score: 5,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Error en inserción válida:', error.message)
      return false
    } else {
      console.log('✅ Inserción válida exitosa')
      console.log('📋 Registro creado:', data)
      
      // Limpiar
      await supabase
        .from('postulations')
        .delete()
        .eq('id', data.id)
      
      return true
    }
  } catch (error) {
    console.error('❌ Error en prueba de inserción:', error)
    return false
  }
}

async function checkExistingData() {
  console.log('\n3️⃣ Verificando datos existentes...')
  
  try {
    const { data, error } = await supabase
      .from('postulations')
      .select('*')
    
    if (error) {
      console.log('❌ Error obteniendo datos:', error.message)
      return false
    }
    
    console.log('📊 Total registros en postulations:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('📋 Valores de status existentes:')
      const statuses = [...new Set(data.map(r => r.status))]
      statuses.forEach(status => {
        const count = data.filter(r => r.status === status).length
        console.log(`   - "${status}": ${count} registros`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Error verificando datos:', error)
    return false
  }
}

async function runChecks() {
  console.log('🚀 Ejecutando verificaciones...\n')
  
  const results = []
  
  // Verificar constraints
  const constraintsOk = await checkPostulationsConstraints()
  results.push({ name: 'Verificación de constraints', success: constraintsOk })
  
  // Probar inserción válida
  const insertOk = await testValidInsert()
  results.push({ name: 'Inserción válida', success: insertOk })
  
  // Verificar datos existentes
  const dataOk = await checkExistingData()
  results.push({ name: 'Datos existentes', success: dataOk })
  
  console.log('\n' + '='.repeat(50))
  console.log('🔬 RESUMEN DE VERIFICACIONES:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n🎯 Resultado: ${passed}/${total} verificaciones pasaron`)
  
  if (passed === total) {
    console.log('\n🎉 ¡CONSTRAINTS VERIFICADAS!')
    console.log('✅ Los valores de status están correctos')
    console.log('✅ Las inserciones funcionan')
  } else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:')
    console.log('💡 Revisa los valores de status permitidos')
  }
  
  return passed === total
}

// Ejecutar verificaciones
runChecks()
  .then(success => {
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Prueba mover candidatos nuevamente')
    console.log('2. Verifica que no aparezcan errores de constraint')
    console.log('3. Confirma que las postulaciones se crean correctamente')
    
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })

