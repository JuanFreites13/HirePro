import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface SupabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function useSupabase() {
  const [supabase, setSupabase] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeSupabase() {
      try {
        setLoading(true)
        setError(null)

        // Intentar obtener configuración desde el endpoint API
        const response = await fetch('/api/env')
        if (!response.ok) {
          throw new Error('Failed to fetch Supabase configuration')
        }

        const config: SupabaseConfig = await response.json()
        
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
          throw new Error('Supabase configuration incomplete')
        }

        // Crear cliente de Supabase
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        })

        // Exponer globalmente para debugging
        if (typeof window !== 'undefined') {
          (window as any).supabase = client
        }

        setSupabase(client)
        console.log('✅ Supabase client initialized successfully')
      } catch (err: any) {
        console.error('❌ Error initializing Supabase:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  return { supabase, loading, error }
}



