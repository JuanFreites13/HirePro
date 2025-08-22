"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, User, Menu, LogOut } from "lucide-react"
import { useAuth } from "./auth-provider"
import type { Page } from "./main-app"

interface ProfileMenuProps {
  onClose: () => void
  onNavigate: (page: Page) => void
}

export function ProfileMenu({ onClose, onNavigate }: ProfileMenuProps) {
  const { user, logout } = useAuth()

  const handleOptionClick = (option: Page) => {
    onNavigate(option)
    onClose()
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Usuario solicitó cerrar sesión')
      await logout()
      onClose()
    } catch (error) {
      console.error('❌ Error en handleLogout:', error)
      // Aún cerrar el menú aunque haya error
      onClose()
    }
  }

  if (!user) return null

  return (
    <>
      {/* Overlay para cerrar el menú */}
      <div className="fixed inset-0 z-10" onClick={onClose} />

      {/* Menú desplegable */}
      <Card className="absolute right-0 top-full mt-2 w-64 z-20 shadow-lg border">
        <CardContent className="p-0">
          {/* Header del usuario */}
          <div className="p-4 border-b bg-muted">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="py-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto"
              onClick={() => handleOptionClick("profile")}
            >
              <User className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Perfil</div>
                <div className="text-xs text-muted-foreground">Información personal</div>
              </div>
            </Button>

            {user.permissions.includes("acceso_configuracion") && (
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={() => handleOptionClick("configuration")}
              >
                <Settings className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Configuración</div>
                  <div className="text-xs text-muted-foreground">Gestión de permisos</div>
                </div>
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto"
              onClick={() => handleOptionClick("options")}
            >
              <Menu className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Opciones</div>
                <div className="text-xs text-muted-foreground">Preferencias y tema</div>
              </div>
            </Button>

            <div className="border-t my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Cerrar sesión</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
