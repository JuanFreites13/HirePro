/**
 * Configuración de Supabase para diferentes entornos
 */

// Temporary Supabase configuration to prevent build errors
// These will be overridden by actual environment variables in production

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
};

// Check if we're in a build environment and provide fallbacks
export const isBuildEnvironment = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

if (isBuildEnvironment) {
  console.warn('⚠️ Build environment detected - using placeholder Supabase config');
}

// Tipos de entorno
export type Environment = 'development' | 'production' | 'test'

// Obtener configuración según el entorno
export const getSupabaseConfig = (env: Environment = 'development') => {
  return {
    ...supabaseConfig,
    auth: {
      autoRefreshToken: true,
      persistSession: env === 'development',
      detectSessionInUrl: env === 'development'
    }
  }
}
