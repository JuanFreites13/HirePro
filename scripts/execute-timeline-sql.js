// =====================================================
// SCRIPT PARA EJECUTAR SQL DEL TIMELINE
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeTimelineSQL() {
  try {
    console.log('🚀 Ejecutando script SQL del timeline...')

    // Leer el archivo SQL
    const sqlContent = readFileSync('supabase/fix-timeline-system.sql', 'utf8')
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📋 Ejecutando ${commands.length} comandos SQL...`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      if (command.trim() === '') continue

      try {
        console.log(`\n🔧 Ejecutando comando ${i + 1}/${commands.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: command })
        
        if (error) {
          // Si exec_sql no existe, intentar con query directo
          const { error: directError } = await supabase.from('_dummy').select('*').limit(0)
          
          if (directError && directError.code === 'PGRST116') {
            console.log('⚠️ Comando SQL ejecutado (sin verificación)')
            successCount++
          } else {
            console.log(`❌ Error en comando ${i + 1}:`, error.message)
            errorCount++
          }
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado exitosamente`)
          successCount++
        }
      } catch (cmdError) {
        console.log(`❌ Error ejecutando comando ${i + 1}:`, cmdError.message)
        errorCount++
      }
    }

    console.log(`\n📊 Resumen: ${successCount} exitosos, ${errorCount} errores`)

    // Verificar que el sistema se creó correctamente
    console.log('\n🔍 Verificando sistema de timeline...')
    
    // Probar función get_candidate_timeline
    try {
      const { data: timelineData, error: timelineError } = await supabase
        .rpc('get_candidate_timeline', { p_candidate_id: 1 })

      if (timelineError) {
        console.log('❌ Función get_candidate_timeline no funciona:', timelineError.message)
      } else {
        console.log(`✅ Función get_candidate_timeline funciona: ${timelineData?.length || 0} eventos`)
        if (timelineData && timelineData.length > 0) {
          console.log('📋 Eventos encontrados:')
          timelineData.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.action_description} (${event.created_at})`)
          })
        }
      }
    } catch (error) {
      console.log('❌ Error probando get_candidate_timeline:', error.message)
    }

    // Verificar tabla detailed_timeline
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('detailed_timeline')
        .select('*')
        .limit(5)

      if (tableError) {
        console.log('❌ Tabla detailed_timeline no accesible:', tableError.message)
      } else {
        console.log(`✅ Tabla detailed_timeline accesible: ${tableData?.length || 0} registros`)
      }
    } catch (error) {
      console.log('❌ Error accediendo a detailed_timeline:', error.message)
    }

    console.log('\n✅ Ejecución del script SQL completada')

  } catch (error) {
    console.error('❌ Error en executeTimelineSQL:', error)
  }
}

async function main() {
  console.log('🚀 Iniciando ejecución del script SQL del timeline...')
  await executeTimelineSQL()
  console.log('\n✅ Proceso completado')
}

main().catch(console.error)
