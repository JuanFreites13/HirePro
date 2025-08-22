"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { verifySupabaseConfig, isSupabaseConfigured } from '@/lib/env-config'

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const info = {
      // Variables de entorno
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada',
      
      // Información del navegador
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      
      // Variables globales
      windowProcess: typeof window !== 'undefined' && (window as any).process ? '✅ Disponible' : '❌ No disponible',
      nextData: typeof window !== 'undefined' && (window as any).__NEXT_DATA__ ? '✅ Disponible' : '❌ No disponible',
      
      // Verificación adicional
      nextDataProps: typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props ? '✅ Disponible' : '❌ No disponible',
      supabaseUrlFromNext: typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.supabaseUrl ? '✅ Disponible' : '❌ No disponible',
      supabaseKeyFromNext: typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.props?.supabaseAnonKey ? '✅ Disponible' : '❌ No disponible',
      
      // Verificación de Supabase client
      supabaseClient: typeof window !== 'undefined' && (window as any).supabase ? '✅ Disponible' : '❌ No disponible',
      
      // Valores reales (sin mostrar las claves completas)
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'No disponible',
      supabaseKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'No disponible',
    }
    
    setDebugInfo(info)
  }, [])

  const testSupabaseConnection = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: '❌ Variables de entorno no configuradas'
        }))
        return
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Probar conexión
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: `❌ Error: ${error.message}`
        }))
      } else {
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: '✅ Conexión exitosa'
        }))
      }
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        connectionTest: `❌ Error: ${error.message}`
      }))
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        🐛 Debug Info
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-y-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>🐛 Debug Info</span>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Supabase URL:</strong> {debugInfo.supabaseUrl}
        </div>
        <div>
          <strong>Supabase Anon Key:</strong> {debugInfo.supabaseAnonKey}
        </div>
        <div>
          <strong>Connection Test:</strong> {debugInfo.connectionTest || 'No probado'}
        </div>
        <div>
          <strong>Window Process:</strong> {debugInfo.windowProcess}
        </div>
        <div>
          <strong>Next Data:</strong> {debugInfo.nextData}
        </div>
        <div>
          <strong>Next Data Props:</strong> {debugInfo.nextDataProps}
        </div>
        <div>
          <strong>Supabase URL from Next:</strong> {debugInfo.supabaseUrlFromNext}
        </div>
                       <div>
                 <strong>Supabase Key from Next:</strong> {debugInfo.supabaseKeyFromNext}
               </div>
               <div>
                 <strong>Supabase Client:</strong> {debugInfo.supabaseClient}
               </div>
               <div>
                 <strong>Supabase URL Value:</strong> {debugInfo.supabaseUrlValue}
               </div>
               <div>
                 <strong>Supabase Key Value:</strong> {debugInfo.supabaseKeyValue}
               </div>
               <div>
                 <strong>Config Test:</strong> {debugInfo.configTest || 'No probado'}
               </div>
               <div>
                 <strong>Timestamp:</strong> {debugInfo.timestamp}
               </div>
        
                       <Button
                 onClick={testSupabaseConnection}
                 size="sm"
                 className="w-full mt-2"
               >
                 🔗 Probar Conexión Supabase
               </Button>

               <Button
                 onClick={() => {
                   verifySupabaseConfig()
                   setDebugInfo(prev => ({
                     ...prev,
                     configTest: isSupabaseConfigured() ? '✅ Configurado' : '❌ No configurado'
                   }))
                 }}
                 size="sm"
                 className="w-full mt-2"
               >
                 ⚙️ Verificar Configuración
               </Button>
        
        <div className="text-xs text-gray-500 mt-2">
          <p>Si ves "❌ No configurada", las variables de entorno no están disponibles en el navegador.</p>
          <p>Esto significa que la aplicación está usando datos de Supabase.</p>
        </div>
      </CardContent>
    </Card>
  )
}
