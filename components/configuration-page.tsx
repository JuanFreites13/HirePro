"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "./auth-provider"
import { ArrowLeft, Settings, Shield, Users, AlertTriangle } from "lucide-react"
import type { Page } from "./main-app"

interface ConfigurationPageProps {
  onNavigate: (page: Page) => void
}



export function ConfigurationPage({ onNavigate }: ConfigurationPageProps) {
  const { user } = useAuth()
  const [interviewers, setInterviewers] = useState<any[]>([])

  if (!user) return null

  // Debug: Mostrar información del usuario
  console.log('🔍 Debug - Usuario actual:', {
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  })

  // Check if user has access to configuration
  if (user.role !== "Admin RRHH" || !user.permissions.includes("acceso_configuracion")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
              <p className="text-sm text-gray-600 mb-4">
                No tienes permisos para acceder a la gestión de usuarios.
              </p>
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                <p>Rol actual: {user.role}</p>
                <p>Permisos: {user.permissions?.join(', ') || 'Ninguno'}</p>
                <p>¿Tiene acceso_configuracion?: {user.permissions?.includes('acceso_configuracion') ? 'Sí' : 'No'}</p>
              </div>
              <Button onClick={() => onNavigate("dashboard")}>Volver al Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handlePermissionChange = (userId: string, permission: string, enabled: boolean) => {
    setInterviewers((prev) =>
      prev.map((interviewer) =>
        interviewer.id === userId
          ? {
              ...interviewer,
              permissions: {
                ...interviewer.permissions,
                [permission]: enabled,
              },
            }
          : interviewer,
      ),
    )
  }

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      mover_etapas: "Mover candidatos entre etapas",
      crear_postulaciones: "Crear nuevas postulaciones",
      ver_todas_postulaciones: "Ver todas las postulaciones",
      gestionar_candidatos: "Gestionar candidatos",
    }
    return labels[permission] || permission
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Gestión de Permisos de Usuarios
            </CardTitle>
            <CardDescription>
              Administra los permisos de los entrevistadores registrados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {interviewers.map((interviewer) => (
                <div key={interviewer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{interviewer.name}</h3>
                        <p className="text-sm text-gray-500">{interviewer.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Entrevistador
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(interviewer.permissions).map(([permission, enabled]) => (
                      <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{getPermissionLabel(permission)}</label>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => handlePermissionChange(interviewer.id, permission, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Información sobre permisos</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Los cambios en los permisos se aplican inmediatamente. Los usuarios verán las nuevas opciones
                    disponibles la próxima vez que accedan a la plataforma.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={() => onNavigate("dashboard")} className="bg-purple-600 hover:bg-purple-700">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
