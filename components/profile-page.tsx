"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-provider"
import { ArrowLeft, User, Mail, Shield, CheckCircle } from "lucide-react"
import type { Page } from "./main-app"

interface ProfilePageProps {
  onNavigate: (page: Page) => void
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user } = useAuth()

  if (!user) return null

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      crear_postulaciones: "Crear postulaciones",
      mover_etapas: "Mover candidatos entre etapas",
      ver_todas_postulaciones: "Ver todas las postulaciones",
      ver_postulaciones_asignadas: "Ver postulaciones asignadas",
      gestionar_usuarios: "Gestionar usuarios",
      acceso_configuracion: "Acceso a configuración",
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
              <h1 className="text-xl font-semibold text-gray-900">Mi Perfil</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Información Personal
              </CardTitle>
              <CardDescription>Datos básicos de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                  <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rol</label>
                <div className="mt-1">
                  <Badge
                    variant={user.role === "Admin RRHH" ? "default" : "secondary"}
                    className={user.role === "Admin RRHH" ? "bg-purple-600" : ""}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Permisos Vigentes
              </CardTitle>
              <CardDescription>Acciones que puedes realizar en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {user.permissions.map((permission) => (
                  <div key={permission} className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-800">{getPermissionLabel(permission)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={() => onNavigate("dashboard")} className="bg-purple-600 hover:bg-purple-700">
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
