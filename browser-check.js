// Script para verificar variables de entorno en el navegador
// Copia y pega este script en la consola del navegador (F12)

console.log('🔍 Verificando variables de entorno en el navegador...');
console.log('=============================================');

// Verificar variables de entorno
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

// Verificar configuración de Next.js
if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
  console.log('✅ __NEXT_DATA__ disponible');
  console.log('Props:', window.__NEXT_DATA__.props);
} else {
  console.log('❌ __NEXT_DATA__ no disponible');
}

console.log('=============================================');
console.log('Si ves "❌ Variables de entorno NO disponibles",');
console.log('el problema está en la configuración de Next.js');
console.log('=============================================');



