#!/usr/bin/env node

/**
 * Script para verificar si las variables de entorno están disponibles en el navegador
 * Ejecuta: node scripts/verify-env-browser.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando variables de entorno para el navegador...')
console.log('=============================================\n')

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ Archivo .env.local no encontrado')
  console.log('Crea el archivo .env.local con las variables de Supabase')
  process.exit(1)
}

console.log('1️⃣ Verificando archivo .env.local...')
const envContent = fs.readFileSync(envPath, 'utf8')

// Buscar variables de Supabase
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
const supabaseServiceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)

console.log('📋 Variables encontradas:')
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Variables NEXT_PUBLIC_ no encontradas en .env.local')
  console.log('Asegúrate de que las variables estén definidas correctamente')
  process.exit(1)
}

console.log('\n2️⃣ Verificando configuración de Next.js...')

// Verificar next.config.mjs
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
  
  if (nextConfigContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('✅ Variables configuradas en next.config.mjs')
  } else {
    console.log('⚠️ Variables no configuradas en next.config.mjs')
  }
} else {
  console.log('⚠️ Archivo next.config.mjs no encontrado')
}

console.log('\n3️⃣ Verificando archivo .env.example...')

// Crear archivo .env.example si no existe
const envExamplePath = path.join(process.cwd(), '.env.example')
if (!fs.existsSync(envExamplePath)) {
  console.log('📝 Creando archivo .env.example...')
  const envExampleContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
`
  fs.writeFileSync(envExamplePath, envExampleContent)
  console.log('✅ Archivo .env.example creado')
} else {
  console.log('✅ Archivo .env.example existe')
}

console.log('\n4️⃣ Verificando que las variables sean válidas...')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('❌ Variables no disponibles después de cargar .env.local')
  process.exit(1)
}

// Verificar formato de URL
if (!url.startsWith('https://')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL no es una URL válida')
  process.exit(1)
}

// Verificar formato de anon key
if (!anonKey.startsWith('eyJ')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no tiene formato válido')
  process.exit(1)
}

console.log('✅ Variables de entorno válidas')

console.log('\n5️⃣ Generando script de verificación para el navegador...')

// Crear script para verificar en el navegador
const browserScript = `
// Script para verificar variables de entorno en el navegador
console.log('🔍 Verificando variables de entorno en el navegador...');

const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  windowProcess: typeof window !== 'undefined' && window.process,
  nextData: typeof window !== 'undefined' && window.__NEXT_DATA__,
  nextDataProps: typeof window !== 'undefined' && window.__NEXT_DATA__?.props,
};

console.log('Variables de entorno:', envVars);

if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ Variables de entorno disponibles en el navegador');
} else {
  console.log('❌ Variables de entorno NO disponibles en el navegador');
  console.log('Esto explica por qué la aplicación usa datos mock');
}

// Verificar si Supabase está inicializado
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Cliente de Supabase disponible en window.supabase');
} else {
  console.log('❌ Cliente de Supabase NO disponible en window.supabase');
}
`

const browserScriptPath = path.join(process.cwd(), 'browser-env-check.js')
fs.writeFileSync(browserScriptPath, browserScript)

console.log('✅ Script de verificación creado: browser-env-check.js')
console.log('   Copia y pega este script en la consola del navegador para verificar')

console.log('\n🎯 Resumen de verificación:')
console.log('=============================================')
console.log('✅ Variables de entorno configuradas en .env.local')
console.log('✅ Variables de entorno válidas')
console.log('✅ Script de verificación generado')
console.log('')
console.log('🔧 Para verificar en el navegador:')
console.log('   1. Abre la aplicación en el navegador')
console.log('   2. Abre las herramientas de desarrollador (F12)')
console.log('   3. Ve a la pestaña Console')
console.log('   4. Copia y pega el contenido de browser-env-check.js')
console.log('   5. Verifica si las variables están disponibles')
console.log('')
console.log('📝 Si las variables NO están disponibles:')
console.log('   - Reinicia el servidor de desarrollo')
console.log('   - Limpia la caché del navegador')
console.log('   - Verifica que .env.local esté en la raíz del proyecto')
console.log('=============================================')



