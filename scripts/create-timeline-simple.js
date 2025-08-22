// =====================================================
// SCRIPT SIMPLE PARA CREAR SISTEMA DE TIMELINE
// =====================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTimelineSimple() {
  try {
    console.log('🚀 Creando sistema de timeline (método simple)...')

    // 1. Verificar si la tabla detailed_timeline existe
    console.log('\n📊 Verificando tabla detailed_timeline...')
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('detailed_timeline')
        .select('*')
        .limit(1)

      if (tableError) {
        console.log('❌ Tabla detailed_timeline no existe:', tableError.message)
        console.log('💡 Necesitas crear la tabla manualmente en Supabase Dashboard')
        console.log('💡 O ejecutar el SQL en la consola de Supabase')
        return
      } else {
        console.log('✅ Tabla detailed_timeline existe')
      }
    } catch (error) {
      console.log('❌ Error verificando tabla:', error.message)
      return
    }

    // 2. Insertar datos de ejemplo
    console.log('\n📝 Insertando datos de ejemplo...')
    try {
      const { data, error } = await supabase
        .from('detailed_timeline')
        .insert([
          {
            candidate_id: 1,
            application_id: 1,
            action_type: 'candidate_created',
            action_description: 'Candidato creado en el sistema',
            performed_by_email: 'admin@talentopro.com',
            metadata: {
              stage: 'Pre-entrevista',
              score: 0,
              assignee_id: '550e8400-e29b-41d4-a716-446655440000'
            }
          },
          {
            candidate_id: 1,
            application_id: 1,
            action_type: 'update_candidate',
            action_description: 'Etapa cambiada de "Pre-entrevista" a "Primera etapa"',
            performed_by_email: 'admin@talentopro.com',
            metadata: {
              stage: 'Primera etapa',
              score: 0,
              assignee_id: '216d1f0c-2a20-49aa-9335-4ad3d442b7b8'
            }
          },
          {
            candidate_id: 1,
            application_id: 1,
            action_type: 'evaluation_created',
            action_description: 'Evaluación creada: entrevista - Puntaje: 7.5/10',
            performed_by_email: 'rodolfoasdad@agendapro.com',
            metadata: {
              evaluation_type: 'entrevista',
              score: 7.5,
              stage: 'Primera etapa'
            }
          }
        ])
        .select()

      if (error) {
        console.log('⚠️ Error insertando datos de ejemplo:', error.message)
      } else {
        console.log(`✅ ${data?.length || 0} datos de ejemplo insertados`)
      }
    } catch (error) {
      console.log('⚠️ Error insertando datos:', error.message)
    }

    // 3. Verificar datos insertados
    console.log('\n🔍 Verificando datos...')
    try {
      const { data: timelineData, error: timelineError } = await supabase
        .from('detailed_timeline')
        .select('*')
        .eq('candidate_id', 1)
        .order('created_at', { ascending: false })

      if (timelineError) {
        console.log('❌ Error obteniendo timeline:', timelineError.message)
      } else {
        console.log(`✅ Timeline obtenido: ${timelineData?.length || 0} eventos`)
        if (timelineData && timelineData.length > 0) {
          console.log('📋 Eventos encontrados:')
          timelineData.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.action_description} (${event.created_at})`)
          })
        }
      }
    } catch (error) {
      console.log('❌ Error verificando datos:', error.message)
    }

    // 4. Probar función RPC si existe
    console.log('\n🔧 Probando función RPC get_candidate_timeline...')
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_candidate_timeline', { p_candidate_id: 1 })

      if (rpcError) {
        console.log('❌ Función RPC no disponible:', rpcError.message)
        console.log('💡 Necesitas crear la función get_candidate_timeline en Supabase')
      } else {
        console.log(`✅ Función RPC funciona: ${rpcData?.length || 0} eventos`)
      }
    } catch (error) {
      console.log('❌ Error probando función RPC:', error.message)
    }

    console.log('\n✅ Verificación del sistema de timeline completada')

  } catch (error) {
    console.error('❌ Error en createTimelineSimple:', error)
  }
}

async function main() {
  console.log('🚀 Iniciando verificación del sistema de timeline...')
  await createTimelineSimple()
  console.log('\n✅ Proceso completado')
}

main().catch(console.error)
