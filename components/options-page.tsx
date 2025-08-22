"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "./auth-provider"
import { ArrowLeft, Palette, Eye, Calendar, Save } from "lucide-react"
import type { Page } from "./main-app"

interface OptionsPageProps {
  onNavigate: (page: Page) => void
}

export function OptionsPage({ onNavigate }: OptionsPageProps) {
  const { user, isDarkMode, toggleDarkMode } = useAuth()
  const [defaultView, setDefaultView] = useState("Lista")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [timeFormat, setTimeFormat] = useState("24h")
  const [defaultSort, setDefaultSort] = useState("fecha_desc")

  useEffect(() => {
    // Load saved preferences
    const savedDefaultView = localStorage.getItem("defaultView") || "Lista"
    const savedDateFormat = localStorage.getItem("dateFormat") || "DD/MM/YYYY"
    const savedTimeFormat = localStorage.getItem("timeFormat") || "24h"
    const savedDefaultSort = localStorage.getItem("defaultSort") || "fecha_desc"

    setDefaultView(savedDefaultView)
    setDateFormat(savedDateFormat)
    setTimeFormat(savedTimeFormat)
    setDefaultSort(savedDefaultSort)
  }, [])

  const handleSavePreferences = () => {
    localStorage.setItem("defaultView", defaultView)
    localStorage.setItem("dateFormat", dateFormat)
    localStorage.setItem("timeFormat", timeFormat)
    localStorage.setItem("defaultSort", defaultSort)

    // Show success message
    alert("Preferencias guardadas correctamente")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => onNavigate("postulations")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Postulaciones
              </Button>
              <h1 className="text-xl font-semibold text-foreground">Opciones</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Tema
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <label className="text-sm font-medium text-foreground">Modo oscuro</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activa el tema oscuro para reducir la fatiga visual
                  </p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Preferencias de Vista */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Preferencias de Vista
              </CardTitle>
              <CardDescription>Configura cómo quieres ver la información por defecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Vista por defecto</label>
                <Select value={defaultView} onValueChange={setDefaultView}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lista">Lista</SelectItem>
                    <SelectItem value="Cards">Cards</SelectItem>
                    <SelectItem value="Kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Orden por defecto</label>
                <Select value={defaultSort} onValueChange={setDefaultSort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fecha_desc">Más recientes primero</SelectItem>
                    <SelectItem value="fecha_asc">Más antiguos primero</SelectItem>
                    <SelectItem value="nombre_asc">Nombre A-Z</SelectItem>
                    <SelectItem value="nombre_desc">Nombre Z-A</SelectItem>
                    <SelectItem value="puntaje_desc">Mayor puntaje primero</SelectItem>
                    <SelectItem value="puntaje_asc">Menor puntaje primero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preferencias de Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Preferencias de Fechas
              </CardTitle>
              <CardDescription>Configura el formato de fechas y horas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Formato de fecha</label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Formato de hora</label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas (14:30)</SelectItem>
                    <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-center space-x-4">
            <Button onClick={handleSavePreferences} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar Preferencias
            </Button>
            <Button variant="outline" onClick={() => onNavigate("postulations")}>
              Volver a Postulaciones
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
