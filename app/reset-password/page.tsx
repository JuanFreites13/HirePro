"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"

export default function ResetPasswordPage() {
  const { updatePassword, isLoading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const handleUpdate = async () => {
    setMsg("")
    setError("")
    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    const ok = await updatePassword(password)
    if (ok) setMsg('Tu contraseña fue actualizada. Ya puedes iniciar sesión.')
    else setError('No se pudo actualizar la contraseña. Intenta nuevamente.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-900">Restablecer contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input type="password" placeholder="Confirmar contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          {msg && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">{msg}</div>}
          <Button onClick={handleUpdate} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">Actualizar contraseña</Button>
        </CardContent>
      </Card>
    </div>
  )
}


