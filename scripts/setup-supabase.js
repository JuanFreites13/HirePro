#!/usr/bin/env node

/**
 * Script para configurar Supabase automáticamente
 * Ejecutar: node scripts/setup-supabase.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Supabase para TalentoPro...\n');

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ Archivo .env.local ya existe');
  
  // Leer contenido actual
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar si tiene credenciales reales
  const hasRealCredentials = !envContent.includes('your_supabase_url') && 
                            !envContent.includes('your_supabase_anon_key');
  
  if (hasRealCredentials) {
    console.log('✅ Credenciales de Supabase ya configuradas');
    console.log('🚀 La aplicación debería funcionar con datos reales');
    return;
  } else {
    console.log('⚠️  Credenciales placeholder detectadas');
  }
}

// Crear template de .env.local
const envTemplate = `# Supabase Configuration
# Reemplaza con tus credenciales reales de Supabase

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-real-aqui

# Opcional: Service Role Key para operaciones del servidor
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Configuración adicional
NODE_ENV=development
`;

// Escribir archivo
fs.writeFileSync(envPath, envTemplate);

console.log('📝 Archivo .env.local creado/actualizado');
console.log('\n📋 Pasos para completar la configuración:');
console.log('\n1. Ve a https://supabase.com');
console.log('2. Crea una cuenta gratuita');
console.log('3. Crea un nuevo proyecto');
console.log('4. Ve a Settings > API');
console.log('5. Copia la URL y anon key');
console.log('6. Reemplaza los valores en .env.local');
console.log('7. Reinicia el servidor: npm run dev');
console.log('\n8. Ejecuta el script de base de datos:');
console.log('   - Ve a SQL Editor en Supabase');
console.log('   - Copia y ejecuta el contenido de supabase/init.sql');
console.log('\n9. Configura Storage (opcional):');
console.log('   - Ve a Storage en Supabase');
console.log('   - Crea bucket: candidate-files');
console.log('\n🎯 Una vez configurado, la aplicación usará datos reales de Supabase');

console.log('\n📁 Archivo creado en:', envPath);
console.log('\n🔍 Para verificar la configuración:');
console.log('   npm run verify-env');
console.log('\n✅ Configuración inicial completada');
