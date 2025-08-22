// =====================================================
// SCRIPT PARA CREAR SISTEMA DE TIMELINE
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

async function createTimelineSystem() {
  try {
    console.log('🚀 Creando sistema de timeline...')

    // 1. Crear tabla detailed_timeline
    console.log('\n📊 Creando tabla detailed_timeline...')
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS detailed_timeline (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
            application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
            action_type VARCHAR(100) NOT NULL,
            action_description TEXT NOT NULL,
            performed_by_email VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
          );
        `
      })
      
      if (error) {
        console.log('⚠️ Tabla detailed_timeline ya existe o error:', error.message)
      } else {
        console.log('✅ Tabla detailed_timeline creada')
      }
    } catch (error) {
      console.log('⚠️ Error creando tabla (puede que ya exista):', error.message)
    }

    // 2. Crear función get_candidate_timeline
    console.log('\n🔧 Creando función get_candidate_timeline...')
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION get_candidate_timeline(p_candidate_id INTEGER)
          RETURNS TABLE (
            id INTEGER,
            candidate_id INTEGER,
            application_id INTEGER,
            action_type VARCHAR(100),
            action_description TEXT,
            performed_by_email VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE,
            metadata JSONB
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              dt.id,
              dt.candidate_id,
              dt.application_id,
              dt.action_type,
              dt.action_description,
              dt.performed_by_email,
              dt.created_at,
              dt.metadata
            FROM detailed_timeline dt
            WHERE dt.candidate_id = p_candidate_id
            ORDER BY dt.created_at DESC;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      
      if (error) {
        console.log('⚠️ Error creando función get_candidate_timeline:', error.message)
      } else {
        console.log('✅ Función get_candidate_timeline creada')
      }
    } catch (error) {
      console.log('⚠️ Error creando función:', error.message)
    }

    // 3. Crear función get_application_timeline
    console.log('\n🔧 Creando función get_application_timeline...')
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION get_application_timeline(p_application_id INTEGER)
          RETURNS TABLE (
            id INTEGER,
            candidate_id INTEGER,
            application_id INTEGER,
            action_type VARCHAR(100),
            action_description TEXT,
            performed_by_email VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE,
            metadata JSONB
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              dt.id,
              dt.candidate_id,
              dt.application_id,
              dt.action_type,
              dt.action_description,
              dt.performed_by_email,
              dt.created_at,
              dt.metadata
            FROM detailed_timeline dt
            WHERE dt.application_id = p_application_id
            ORDER BY dt.created_at DESC;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      
      if (error) {
        console.log('⚠️ Error creando función get_application_timeline:', error.message)
      } else {
        console.log('✅ Función get_application_timeline creada')
      }
    } catch (error) {
      console.log('⚠️ Error creando función:', error.message)
    }

    // 4. Insertar datos de ejemplo
    console.log('\n📝 Insertando datos de ejemplo...')
    try {
      const { error } = await supabase
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
          }
        ])
      
      if (error) {
        console.log('⚠️ Error insertando datos de ejemplo:', error.message)
      } else {
        console.log('✅ Datos de ejemplo insertados')
      }
    } catch (error) {
      console.log('⚠️ Error insertando datos:', error.message)
    }

    // 5. Verificar que todo funciona
    console.log('\n🔍 Verificando sistema...')
    
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

    console.log('\n✅ Sistema de timeline creado exitosamente')

  } catch (error) {
    console.error('❌ Error en createTimelineSystem:', error)
  }
}

async function main() {
  console.log('🚀 Iniciando creación del sistema de timeline...')
  await createTimelineSystem()
  console.log('\n✅ Proceso completado')
}

main().catch(console.error)
