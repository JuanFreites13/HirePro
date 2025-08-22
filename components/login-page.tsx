"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./auth-provider"
import { Eye, EyeOff } from "lucide-react"

export function LoginPage() {
  const { login, resetPassword, isLoading } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")

    const success = await login(email, password)
    if (!success) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña o restablece la contraseña.')
      toast({ title: 'Credenciales incorrectas', description: 'El email o la contraseña no son válidos.', variant: 'destructive' })
    }
  }

  const handleResetPassword = async () => {
    setError("")
    setInfo("")
    if (!email) {
      setError('Ingresa tu email para enviarte el enlace de recuperación.')
      return
    }
    const ok = await resetPassword(email)
    if (ok) setInfo('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.')
    else setError('No se pudo enviar el enlace. Intenta nuevamente.')
  }

  // Login solo con credenciales administradas (sin Google)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-900">Plataforma de Entrevistas</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Acceso solo por email/contraseña (Google deshabilitado) */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Iniciar Sesión
            </Button>

            <div className="text-center">
              <button type="button" onClick={handleResetPassword} className="text-sm text-purple-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {info && <div className="text-xs text-green-700 bg-green-50 p-2 rounded-md">{info}</div>}
          </form>


        </CardContent>
      </Card>
    </div>
  )
}
