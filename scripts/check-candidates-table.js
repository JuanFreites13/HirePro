import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCandidatesTable() {
  console.log('🔍 Verificando valores de etapa en la tabla candidates...')
  
  try {
    
    // Verificar valores únicos en el campo stage
    console.log('\n🔍 Verificando valores únicos en el campo stage...')
    const { data: stages, error: stagesError } = await supabase
      .from('candidates')
      .select('stage')
      .not('stage', 'is', null)
    
    if (stagesError) {
      console.error('❌ Error obteniendo etapas:', stagesError)
      return
    }
    
    const uniqueStages = [...new Set(stages.map(s => s.stage))]
    console.log('📋 Etapas únicas encontradas:')
    uniqueStages.forEach(stage => {
      console.log(`- "${stage}"`)
    })
    
    // Verificar el candidato específico
    console.log('\n🔍 Verificando candidato ID 1...')
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (candidateError) {
      console.error('❌ Error obteniendo candidato:', candidateError)
      return
    }
    
    console.log('📋 Datos del candidato:')
    console.log(`- ID: ${candidate.id}`)
    console.log(`- Nombre: ${candidate.name}`)
    console.log(`- Etapa actual: "${candidate.stage}"`)
    console.log(`- Creado: ${candidate.created_at}`)
    console.log(`- Actualizado: ${candidate.updated_at}`)
    
    // Probar diferentes formatos de "stand-by"
    console.log('\n🧪 Probando diferentes formatos de "stand-by"...')
    
    const testStages = [
      'stand-by',
      'Stand by',
      'stand by',
      'Stand-by',
      'STANDBY',
      'standby'
    ]
    
    for (const testStage of testStages) {
      try {
        console.log(`\n📋 Probando: "${testStage}"`)
        
        const { data: testResult, error: testError } = await supabase
          .from('candidates')
          .update({ stage: testStage })
          .eq('id', 1)
          .select('stage')
          .single()
        
        if (testError) {
          console.error(`❌ Error con "${testStage}":`, testError.message)
        } else {
          console.log(`✅ Éxito con "${testStage}":`, testResult.stage)
        }
      } catch (error) {
        console.error(`❌ Error probando "${testStage}":`, error.message)
      }
    }
    
    // Restaurar el candidato a su estado original
    console.log('\n🔄 Restaurando candidato a estado original...')
    const { error: restoreError } = await supabase
      .from('candidates')
      .update({ stage: 'Seleccionado' })
      .eq('id', 1)
    
    if (restoreError) {
      console.error('❌ Error restaurando candidato:', restoreError)
    } else {
      console.log('✅ Candidato restaurado a "Seleccionado"')
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  }
}

async function main() {
  console.log('🚀 Iniciando verificación de la tabla candidates...')
  await checkCandidatesTable()
  console.log('\n✅ Verificación completada')
}

main().catch(console.error)
