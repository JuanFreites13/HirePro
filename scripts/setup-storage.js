#!/usr/bin/env node

/**
 * Script para configurar Supabase Storage
 * Ejecuta: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🗄️  Configurando Supabase Storage...')
console.log('=============================================\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Asegúrate de tener:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Crear cliente con service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  try {
    console.log('1️⃣ Creando bucket para archivos de candidatos...')
    
    // Crear bucket para archivos de candidatos
    const { data: filesBucket, error: filesError } = await supabase.storage.createBucket('candidate-files', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
      ]
    })

    if (filesError) {
      if (filesError.message.includes('already exists')) {
        console.log('✅ Bucket candidate-files ya existe')
      } else {
        console.error('❌ Error creando bucket candidate-files:', filesError.message)
      }
    } else {
      console.log('✅ Bucket candidate-files creado exitosamente')
    }

    console.log('\n2️⃣ Creando bucket para avatares de candidatos...')
    
    // Crear bucket para avatares
    const { data: avatarsBucket, error: avatarsError } = await supabase.storage.createBucket('candidate-avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    })

    if (avatarsError) {
      if (avatarsError.message.includes('already exists')) {
        console.log('✅ Bucket candidate-avatars ya existe')
      } else {
        console.error('❌ Error creando bucket candidate-avatars:', avatarsError.message)
      }
    } else {
      console.log('✅ Bucket candidate-avatars creado exitosamente')
    }

    console.log('\n3️⃣ Verificando buckets creados...')
    
    // Listar buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listando buckets:', listError.message)
    } else {
      const candidateBuckets = buckets.filter(bucket => 
        bucket.name === 'candidate-files' || bucket.name === 'candidate-avatars'
      )
      
      console.log('📋 Buckets encontrados:')
      candidateBuckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
        console.log(`     Límite: ${bucket.fileSizeLimit / (1024 * 1024)}MB`)
        console.log(`     Tipos permitidos: ${bucket.allowedMimeTypes?.length || 'Todos'}`)
      })
    }

    console.log('\n4️⃣ Configurando políticas de seguridad...')
    console.log('⚠️  Las políticas RLS deben configurarse manualmente en el SQL Editor')
    console.log('   Ejecuta el script: supabase/setup-storage.sql')

    console.log('\n🎉 Configuración de Storage completada!')
    console.log('=============================================')
    console.log('✅ Buckets creados:')
    console.log('   - candidate-files (privado, 10MB, documentos)')
    console.log('   - candidate-avatars (público, 5MB, imágenes)')
    console.log('')
    console.log('🔧 Próximos pasos:')
    console.log('   1. Ejecuta supabase/setup-storage.sql en el SQL Editor')
    console.log('   2. Configura las políticas RLS para seguridad')
    console.log('   3. Prueba subir archivos desde la aplicación')
    console.log('=============================================')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupStorage()
}

module.exports = { setupStorage }



