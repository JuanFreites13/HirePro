"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestEnvPage() {
  const [envInfo, setEnvInfo] = useState<any>({})
  const [supabaseTest, setSupabaseTest] = useState<any>({})

  useEffect(() => {
    const info = {
      // Variables de entorno
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // Verificaciones
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // Información del navegador
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      
      // Variables globales
      windowProcess: typeof window !== 'undefined' && (window as any).process,
      nextData: typeof window !== 'undefined' && (window as any).__NEXT_DATA__,
      supabaseClient: typeof window !== 'undefined' && (window as any).supabase,
    }
    
    setEnvInfo(info)
  }, [])

  const testSupabaseConnection = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setSupabaseTest({
          success: false,
          error: 'Variables de entorno no disponibles'
        })
        return
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Probar conexión
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        setSupabaseTest({
          success: false,
          error: error.message
        })
      } else {
        setSupabaseTest({
          success: true,
          message: 'Conexión exitosa',
          data
        })
      }
    } catch (error: any) {
      setSupabaseTest({
        success: false,
        error: error.message
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Prueba de Variables de Entorno
          </h1>
          <p className="text-gray-600">
            Verificación de configuración de Supabase en el navegador
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Variables de Entorno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
                <div className="mt-1">
                  {envInfo.hasUrl ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✅ Configurada
                    </Badge>
                  ) : (
                    <Badge variant="destructive">❌ No configurada</Badge>
                  )}
                </div>
                {envInfo.NEXT_PUBLIC_SUPABASE_URL && (
                  <p className="text-sm text-gray-600 mt-1">
                    {envInfo.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...
                  </p>
                )}
              </div>

              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
                <div className="mt-1">
                  {envInfo.hasKey ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✅ Configurada
                    </Badge>
                  ) : (
                    <Badge variant="destructive">❌ No configurada</Badge>
                  )}
                </div>
                {envInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                  <p className="text-sm text-gray-600 mt-1">
                    {envInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Estado General:</h3>
              {envInfo.hasUrl && envInfo.hasKey ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Variables de entorno disponibles
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ❌ Variables de entorno faltantes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔗 Prueba de Conexión Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testSupabaseConnection}
              className="w-full"
              disabled={!envInfo.hasUrl || !envInfo.hasKey}
            >
              Probar Conexión a Supabase
            </Button>

            {supabaseTest.success !== undefined && (
              <div className={`p-4 rounded-lg ${
                supabaseTest.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className="font-semibold mb-2">
                  {supabaseTest.success ? '✅ Éxito' : '❌ Error'}
                </h4>
                <p className="text-sm">
                  {supabaseTest.message || supabaseTest.error}
                </p>
                {supabaseTest.data && (
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                    {JSON.stringify(supabaseTest.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Información del Navegador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>User Agent:</strong> {envInfo.userAgent}</div>
              <div><strong>Timestamp:</strong> {envInfo.timestamp}</div>
              <div><strong>Window Process:</strong> {envInfo.windowProcess ? '✅ Disponible' : '❌ No disponible'}</div>
              <div><strong>Next Data:</strong> {envInfo.nextData ? '✅ Disponible' : '❌ No disponible'}</div>
              <div><strong>Supabase Client:</strong> {envInfo.supabaseClient ? '✅ Disponible' : '❌ No disponible'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Instrucciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Si las variables NO están disponibles:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Reinicia el servidor de desarrollo</li>
                <li>Limpia la caché del navegador</li>
                <li>Verifica que el archivo .env.local esté en la raíz del proyecto</li>
                <li>Verifica que las variables tengan el prefijo NEXT_PUBLIC_</li>
              </ul>
              
              <p className="mt-4"><strong>Si las variables SÍ están disponibles pero la conexión falla:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Verifica que las credenciales sean correctas</li>
                <li>Verifica que Supabase esté funcionando</li>
                <li>Verifica las políticas RLS</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



