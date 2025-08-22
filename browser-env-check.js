
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
