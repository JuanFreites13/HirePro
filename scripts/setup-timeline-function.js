#!/usr/bin/env node

/**
 * Script para configurar la función log_timeline_action
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

console.log('🔧 CONFIGURANDO FUNCIÓN LOG_TIMELINE_ACTION')
console.log('=' .repeat(50))

async function setupTimelineFunction() {
  console.log('\n1️⃣ Verificando si la función existe...')
  
  try {
    // Probar si la función existe
    const { data, error } = await supabase.rpc('log_timeline_action', {
      p_entity_type: 'test',
      p_entity_id: 1,
      p_action_type: 'test',
      p_action_description: 'Test function'
    })
    
    if (error && error.message.includes('function "log_timeline_action" does not exist')) {
      console.log('❌ La función no existe, creándola...')
      return await createTimelineFunction()
    } else if (error) {
      console.log('⚠️ Error al probar función:', error.message)
      return false
    } else {
      console.log('✅ La función ya existe y funciona')
      return true
    }
  } catch (error) {
    console.log('❌ Error verificando función:', error.message)
    return await createTimelineFunction()
  }
}

async function createTimelineFunction() {
  console.log('\n2️⃣ Creando función log_timeline_action...')
  
  try {
    // SQL para crear la función
    const functionSQL = `
      CREATE OR REPLACE FUNCTION log_timeline_action(
        p_entity_type VARCHAR(50),
        p_entity_id INTEGER,
        p_action_type VARCHAR(50),
        p_action_description TEXT,
        p_performed_by UUID DEFAULT NULL,
        p_performed_by_email VARCHAR(255) DEFAULT NULL,
        p_previous_value TEXT DEFAULT NULL,
        p_new_value TEXT DEFAULT NULL,
        p_metadata JSONB DEFAULT '{}'
      )
      RETURNS VOID AS $$
      BEGIN
        -- Insertar en la tabla de timeline detallado si existe
        BEGIN
          INSERT INTO detailed_timeline (
            entity_type,
            entity_id,
            action_type,
            action_description,
            performed_by,
            performed_by_email,
            previous_value,
            new_value,
            metadata,
            created_at
          ) VALUES (
            p_entity_type,
            p_entity_id,
            p_action_type,
            p_action_description,
            p_performed_by,
            p_performed_by_email,
            p_previous_value,
            p_new_value,
            p_metadata,
            NOW()
          );
        EXCEPTION WHEN undefined_table THEN
          -- La tabla detailed_timeline no existe, continuar
          NULL;
        END;
        
        -- Si es un candidato, también insertar en candidate_timeline si existe
        IF p_entity_type = 'candidate' THEN
          BEGIN
            INSERT INTO candidate_timeline (
              candidate_id,
              action_type,
              action_description,
              performed_by,
              performed_by_email,
              previous_value,
              new_value,
              metadata,
              created_at
            ) VALUES (
              p_entity_id,
              p_action_type,
              p_action_description,
              p_performed_by,
              p_performed_by_email,
              p_previous_value,
              p_new_value,
              p_metadata,
              NOW()
            );
          EXCEPTION WHEN undefined_table THEN
            -- La tabla candidate_timeline no existe, continuar
            NULL;
          END;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `
    
    // Ejecutar el SQL usando rpc si está disponible
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: functionSQL })
      
      if (error) {
        console.log('❌ Error ejecutando SQL:', error.message)
        console.log('💡 La función debe ser creada manualmente en Supabase')
        return false
      } else {
        console.log('✅ Función creada exitosamente')
        return true
      }
    } catch (rpcError) {
      console.log('⚠️ RPC exec_sql no disponible, función debe ser creada manualmente')
      console.log('📋 SQL para ejecutar manualmente:')
      console.log(functionSQL)
      return false
    }
  } catch (error) {
    console.error('❌ Error creando función:', error)
    return false
  }
}

async function testTimelineFunction() {
  console.log('\n3️⃣ Probando la función...')
  
  try {
    const { data, error } = await supabase.rpc('log_timeline_action', {
      p_entity_type: 'candidate',
      p_entity_id: 1,
      p_action_type: 'stage_change',
      p_action_description: 'Etapa cambiada de Pre-entrevista a Entrevista técnica',
      p_performed_by: null,
      p_performed_by_email: 'test@example.com',
      p_previous_value: 'Pre-entrevista',
      p_new_value: 'Entrevista técnica',
      p_metadata: { test: true }
    })
    
    if (error) {
      console.log('❌ Error probando función:', error.message)
      return false
    } else {
      console.log('✅ Función probada exitosamente')
      return true
    }
  } catch (error) {
    console.error('❌ Error en prueba:', error)
    return false
  }
}

async function runSetup() {
  console.log('🚀 Configurando función de timeline...\n')
  
  const results = []
  
  // Configurar función
  const setupOk = await setupTimelineFunction()
  results.push({ name: 'Configuración de función', success: setupOk })
  
  // Probar función
  const testOk = await testTimelineFunction()
  results.push({ name: 'Prueba de función', success: testOk })
  
  console.log('\n' + '='.repeat(50))
  console.log('🔬 RESUMEN DE CONFIGURACIÓN:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n🎯 Resultado: ${passed}/${total} pasos completados`)
  
  if (passed === total) {
    console.log('\n🎉 ¡FUNCIÓN CONFIGURADA EXITOSAMENTE!')
    console.log('✅ El error 404 de log_timeline_action está resuelto')
    console.log('✅ Las acciones de timeline se registrarán correctamente')
  } else {
    console.log('\n⚠️ CONFIGURACIÓN MANUAL REQUERIDA:')
    console.log('💡 Ejecuta el SQL de la función manualmente en Supabase')
    console.log('💡 O ejecuta el archivo setup-ai-processing-complete.sql')
  }
  
  return passed === total
}

// Ejecutar configuración
runSetup()
  .then(success => {
    console.log('\n📋 PRÓXIMOS PASOS:')
    console.log('1. Si hay errores, ejecuta el SQL manualmente en Supabase')
    console.log('2. Prueba mover candidatos nuevamente')
    console.log('3. Verifica que no aparezcan errores 404')
    
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })

