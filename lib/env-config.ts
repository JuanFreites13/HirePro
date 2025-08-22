/**
 * Configuración de variables de entorno para el cliente
 * Este archivo expone las variables de entorno de forma más directa
 */

// Variables de entorno de Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

// Función para obtener configuración desde runtime config (fallback)
export const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.supabaseUrl) {
    return {
      url: (window as any).__NEXT_DATA__.props.supabaseUrl,
      anonKey: (window as any).__NEXT_DATA__.props.supabaseAnonKey,
    }
  }
  return SUPABASE_CONFIG
}

// Verificar si Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  // Intentar con variables de entorno directas
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    return true
  }
  
  // Intentar con runtime config como fallback
  const runtimeConfig = getRuntimeConfig()
  return !!(runtimeConfig.url && runtimeConfig.anonKey)
}

// Obtener configuración de Supabase
export const getSupabaseConfig = () => {
  return SUPABASE_CONFIG
}

// Verificar configuración en tiempo de ejecución
export const verifySupabaseConfig = () => {
  console.log('🔧 Verificando configuración de Supabase...')
  console.log('URL:', SUPABASE_CONFIG.url ? '✅ Configurada' : '❌ No configurada')
  console.log('Anon Key:', SUPABASE_CONFIG.anonKey ? '✅ Configurada' : '❌ No configurada')
  console.log('Service Key:', SUPABASE_CONFIG.serviceKey ? '✅ Configurada' : '❌ No configurada')
  
  if (isSupabaseConfigured()) {
    console.log('✅ Supabase está configurado correctamente')
    return true
  } else {
    console.log('❌ Supabase no está configurado')
    return false
  }
}

// Configuración del entorno
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
}

// Exportar configuración completa
export default {
  supabase: SUPABASE_CONFIG,
  env: ENV_CONFIG,
  isSupabaseConfigured,
  getSupabaseConfig,
  verifySupabaseConfig
}
