#!/usr/bin/env node

// Script para limpiar candidatos duplicados
// Ejecutar: node scripts/cleanup-duplicates.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupDuplicates() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA DE CANDIDATOS DUPLICADOS')
    console.log('===============================================')
    
    // Buscar candidatos con el mismo email
    console.log('📋 Buscando candidatos duplicados...')
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('id, email, name, created_at')
      .order('email, created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching candidates:', error)
      return
    }

    if (!candidates || candidates.length === 0) {
      console.log('ℹ️ No hay candidatos en la base de datos')
      return
    }

    console.log(`📊 Total candidatos encontrados: ${candidates.length}`)

    // Agrupar por email
    const candidatesByEmail = candidates.reduce((acc, candidate) => {
      if (!acc[candidate.email]) {
        acc[candidate.email] = []
      }
      acc[candidate.email].push(candidate)
      return acc
    }, {})

    // Mostrar estadísticas
    const duplicatedEmails = Object.entries(candidatesByEmail).filter(([_, group]) => group.length > 1)
    
    console.log(`📧 Emails únicos: ${Object.keys(candidatesByEmail).length}`)
    console.log(`🔄 Emails con duplicados: ${duplicatedEmails.length}`)

    if (duplicatedEmails.length === 0) {
      console.log('✅ No hay candidatos duplicados para limpiar')
      return
    }

    console.log('\n🔍 CANDIDATOS DUPLICADOS ENCONTRADOS:')
    console.log('=====================================')

    let totalDuplicates = 0
    duplicatedEmails.forEach(([email, group]) => {
      console.log(`\n📧 ${email}:`)
      group.forEach((candidate, index) => {
        const status = index === 0 ? '✅ MANTENER' : '🗑️ ELIMINAR'
        console.log(`  ${status} - ID: ${candidate.id} | Nombre: ${candidate.name} | Creado: ${candidate.created_at}`)
      })
      totalDuplicates += group.length - 1
    })

    console.log(`\n📊 Total duplicados a eliminar: ${totalDuplicates}`)

    // Solicitar confirmación
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const confirmation = await new Promise(resolve => {
      readline.question('\n❓ ¿Proceder con la limpieza? (y/N): ', resolve)
    })
    
    readline.close()

    if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
      console.log('❌ Limpieza cancelada por el usuario')
      return
    }

    // Proceder con la limpieza
    console.log('\n🧹 INICIANDO LIMPIEZA...')
    console.log('========================')

    let totalCleaned = 0
    const errors = []

    for (const [email, candidateGroup] of duplicatedEmails) {
      const [keep, ...duplicates] = candidateGroup
      
      console.log(`\n🗑️ Limpiando ${email}:`)
      console.log(`   Manteniendo: ID ${keep.id} (${keep.name})`)
      console.log(`   Eliminando: ${duplicates.length} duplicado(s)`)

      const duplicateIds = duplicates.map(d => d.id)
      const { error: deleteError, count } = await supabase
        .from('candidates')
        .delete({ count: 'exact' })
        .in('id', duplicateIds)

      if (deleteError) {
        console.log(`   ❌ Error: ${deleteError.message}`)
        errors.push(`${email}: ${deleteError.message}`)
      } else {
        console.log(`   ✅ Eliminados: ${count} candidato(s)`)
        totalCleaned += count || 0
      }
    }

    console.log('\n🎯 RESULTADO FINAL:')
    console.log('==================')
    console.log(`✅ Candidatos eliminados: ${totalCleaned}`)
    console.log(`❌ Errores: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ ERRORES:')
      errors.forEach(error => console.log(`   ${error}`))
    }

    console.log('\n🎉 Limpieza completada!')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  }
}

cleanupDuplicates()

