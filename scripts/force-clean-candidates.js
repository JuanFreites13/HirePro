#!/usr/bin/env node

// Script para FORZAR la eliminación de TODOS los candidatos
// Ejecutar: node scripts/force-clean-candidates.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceCleanCandidates() {
  try {
    console.log('🔥 FORZANDO LIMPIEZA COMPLETA DE CANDIDATOS')
    console.log('==========================================')
    
    // Eliminar en orden específico para evitar restricciones de FK
    
    console.log('\n1. 🗑️ Eliminando archivos adjuntos...')
    try {
      // Obtener todos los archivos primero
      const { data: files } = await supabase
        .from('candidate_attachments')
        .select('file_path')
      
      if (files && files.length > 0) {
        // Eliminar archivos del storage
        const filePaths = files.map(f => f.file_path)
        await supabase.storage
          .from('candidates')
          .remove(filePaths)
        console.log(`   ✅ ${filePaths.length} archivos eliminados del storage`)
      }
      
      // Eliminar registros de la tabla
      const { error: attachError } = await supabase
        .from('candidate_attachments')
        .delete()
        .gte('id', 0) // Eliminar todos los registros
      
      if (attachError) {
        console.log('   ⚠️ Error:', attachError.message)
      } else {
        console.log('   ✅ Tabla candidate_attachments limpiada')
      }
    } catch (e) {
      console.log('   ⚠️ Error en attachments:', e.message)
    }

    console.log('\n2. 🗑️ Eliminando evaluaciones...')
    try {
      const { error: evalError } = await supabase
        .from('candidate_evaluations')
        .delete()
        .gte('id', 0) // Eliminar todos los registros
      
      if (evalError) {
        console.log('   ⚠️ Error:', evalError.message)
      } else {
        console.log('   ✅ Tabla candidate_evaluations limpiada')
      }
    } catch (e) {
      console.log('   ⚠️ Error en evaluations:', e.message)
    }

    console.log('\n3. 🗑️ Eliminando notas...')
    try {
      const { error: notesError } = await supabase
        .from('candidate_notes')
        .delete()
        .gte('id', 0) // Eliminar todos los registros
      
      if (notesError) {
        console.log('   ⚠️ Error:', notesError.message)
      } else {
        console.log('   ✅ Tabla candidate_notes limpiada')
      }
    } catch (e) {
      console.log('   ⚠️ Error en notes:', e.message)
    }

    console.log('\n4. 🗑️ Eliminando postulaciones...')
    try {
      const { error: postError } = await supabase
        .from('postulations')
        .delete()
        .gte('id', 0) // Eliminar todos los registros
      
      if (postError) {
        if (postError.code === 'PGRST106') {
          console.log('   ℹ️ Tabla postulations no existe')
        } else {
          console.log('   ⚠️ Error:', postError.message)
        }
      } else {
        console.log('   ✅ Tabla postulations limpiada')
      }
    } catch (e) {
      console.log('   ℹ️ Tabla postulations no disponible')
    }

    console.log('\n5. 🗑️ ELIMINANDO CANDIDATOS (FORZADO)...')
    
    // Obtener lista actual
    const { data: currentCandidates } = await supabase
      .from('candidates')
      .select('id, name, email')
    
    console.log(`   📊 Candidatos encontrados: ${currentCandidates?.length || 0}`)
    
    if (currentCandidates && currentCandidates.length > 0) {
      // Eliminar uno por uno para evitar problemas
      let deletedCount = 0
      for (const candidate of currentCandidates) {
        try {
          const { error } = await supabase
            .from('candidates')
            .delete()
            .eq('id', candidate.id)
          
          if (error) {
            console.log(`   ❌ Error eliminando ${candidate.name} (ID: ${candidate.id}):`, error.message)
          } else {
            deletedCount++
            console.log(`   ✅ Eliminado: ${candidate.name} (${candidate.email})`)
          }
        } catch (e) {
          console.log(`   ❌ Error con ${candidate.name}:`, e.message)
        }
      }
      
      console.log(`\n   📊 Total eliminados: ${deletedCount}/${currentCandidates.length}`)
    }

    // Verificación final
    console.log('\n6. 🔍 VERIFICACIÓN FINAL...')
    const { data: remainingCandidates } = await supabase
      .from('candidates')
      .select('id, name, email')
    
    const remaining = remainingCandidates?.length || 0
    
    if (remaining === 0) {
      console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!')
      console.log('===================================')
      console.log('✅ Todos los candidatos han sido eliminados')
      console.log('✅ Todas las tablas relacionadas limpiadas')
      console.log('✅ Archivos del storage eliminados')
      console.log('\n🎯 La base de datos está completamente limpia!')
    } else {
      console.log(`\n⚠️ AÚN QUEDAN ${remaining} CANDIDATOS:`)
      remainingCandidates?.forEach(c => {
        console.log(`   - ${c.name} (${c.email}) - ID: ${c.id}`)
      })
      console.log('\n💡 Puedes intentar eliminarlos manualmente desde Supabase Dashboard')
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza forzada:', error)
  }
}

forceCleanCandidates()

