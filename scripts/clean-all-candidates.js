#!/usr/bin/env node

// Script para eliminar TODOS los candidatos y archivos asociados
// Ejecutar: node scripts/clean-all-candidates.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanAllCandidates() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA COMPLETA DE CANDIDATOS')
    console.log('=============================================')
    
    // 1. Obtener todos los candidatos antes de eliminar
    console.log('\n📋 1. OBTENIENDO LISTA DE CANDIDATOS...')
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })

    if (candidatesError) {
      console.error('❌ Error obteniendo candidatos:', candidatesError)
      return
    }

    const candidateCount = candidates?.length || 0
    console.log(`📊 Total candidatos encontrados: ${candidateCount}`)

    if (candidateCount === 0) {
      console.log('✅ No hay candidatos para eliminar')
      return
    }

    // Mostrar lista de candidatos
    console.log('\n📝 CANDIDATOS A ELIMINAR:')
    console.log('========================')
    candidates?.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email}) - ID: ${candidate.id}`)
    })

    // Solicitar confirmación
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const confirmation = await new Promise(resolve => {
      readline.question(`\n❓ ¿Eliminar TODOS los ${candidateCount} candidatos y sus archivos? (y/N): `, resolve)
    })
    
    readline.close()

    if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
      console.log('❌ Limpieza cancelada por el usuario')
      return
    }

    console.log('\n🗑️ INICIANDO ELIMINACIÓN COMPLETA...')
    console.log('===================================')

    // 2. Eliminar archivos adjuntos del storage
    console.log('\n📎 2. ELIMINANDO ARCHIVOS ADJUNTOS...')
    try {
      const { data: attachments, error: attachmentsError } = await supabase
        .from('candidate_attachments')
        .select('id, file_path, original_name, candidate_id')

      if (attachmentsError) {
        console.log('⚠️ Error obteniendo archivos adjuntos:', attachmentsError)
      } else if (attachments && attachments.length > 0) {
        console.log(`📁 Archivos encontrados: ${attachments.length}`)
        
        // Eliminar archivos del storage
        const filePaths = attachments.map(att => att.file_path)
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('candidates')
            .remove(filePaths)

          if (storageError) {
            console.log('⚠️ Error eliminando algunos archivos del storage:', storageError)
          } else {
            console.log(`✅ Eliminados ${filePaths.length} archivos del storage`)
          }
        }

        // Eliminar registros de attachments
        const { error: attachDbError } = await supabase
          .from('candidate_attachments')
          .delete()
          .neq('id', 0) // Eliminar todos

        if (attachDbError) {
          console.log('⚠️ Error eliminando registros de archivos:', attachDbError)
        } else {
          console.log(`✅ Eliminados ${attachments.length} registros de archivos`)
        }
      } else {
        console.log('ℹ️ No hay archivos adjuntos para eliminar')
      }
    } catch (attachError) {
      console.log('⚠️ Error en limpieza de archivos:', attachError)
    }

    // 3. Eliminar evaluaciones
    console.log('\n📝 3. ELIMINANDO EVALUACIONES...')
    try {
      const { error: evalError, count: evalCount } = await supabase
        .from('candidate_evaluations')
        .delete({ count: 'exact' })
        .neq('id', 0) // Eliminar todas

      if (evalError) {
        console.log('⚠️ Error eliminando evaluaciones:', evalError)
      } else {
        console.log(`✅ Eliminadas ${evalCount || 0} evaluaciones`)
      }
    } catch (evalError) {
      console.log('⚠️ Error en limpieza de evaluaciones:', evalError)
    }

    // 4. Eliminar notas de candidatos
    console.log('\n📋 4. ELIMINANDO NOTAS...')
    try {
      const { error: notesError, count: notesCount } = await supabase
        .from('candidate_notes')
        .delete({ count: 'exact' })
        .neq('id', 0) // Eliminar todas

      if (notesError) {
        console.log('⚠️ Error eliminando notas:', notesError)
      } else {
        console.log(`✅ Eliminadas ${notesCount || 0} notas`)
      }
    } catch (notesError) {
      console.log('⚠️ Error en limpieza de notas:', notesError)
    }

    // 5. Eliminar postulaciones (si la tabla existe)
    console.log('\n🔗 5. ELIMINANDO POSTULACIONES...')
    try {
      const { error: postError, count: postCount } = await supabase
        .from('postulations')
        .delete({ count: 'exact' })
        .neq('id', 0) // Eliminar todas

      if (postError) {
        if (postError.code === 'PGRST106') {
          console.log('ℹ️ Tabla postulations no existe aún')
        } else {
          console.log('⚠️ Error eliminando postulaciones:', postError)
        }
      } else {
        console.log(`✅ Eliminadas ${postCount || 0} postulaciones`)
      }
    } catch (postError) {
      console.log('ℹ️ Tabla postulations no disponible')
    }

    // 6. Finalmente, eliminar candidatos
    console.log('\n👥 6. ELIMINANDO CANDIDATOS...')
    const { error: candidatesDeleteError, count: deletedCount } = await supabase
      .from('candidates')
      .delete({ count: 'exact' })
      .neq('id', 0) // Eliminar todos

    if (candidatesDeleteError) {
      console.error('❌ Error eliminando candidatos:', candidatesDeleteError)
      return
    }

    console.log('\n🎉 LIMPIEZA COMPLETADA EXITOSAMENTE!')
    console.log('===================================')
    console.log(`✅ Candidatos eliminados: ${deletedCount}`)
    console.log('✅ Archivos adjuntos eliminados')
    console.log('✅ Evaluaciones eliminadas')
    console.log('✅ Notas eliminadas')
    console.log('✅ Postulaciones eliminadas (si existían)')
    console.log('\n🎯 La base de datos está limpia y lista para pruebas!')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2)
if (args.includes('--confirm')) {
  // Modo automático sin confirmación
  cleanAllCandidates()
} else {
  cleanAllCandidates()
}

