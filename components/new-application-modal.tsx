"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2 } from "lucide-react"
import { applicationsService } from "@/lib/supabase-service"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface NewApplicationModalProps {
  onClose: () => void
}

export function NewApplicationModal({ onClose }: NewApplicationModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    position: "",
    department: "",
    description: "",
    requirements: "",
    assignee: "",
    priority: "media",
    status: "Activa"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const newApplication = await applicationsService.createApplication({
        title: formData.title,
        area: formData.department,
        location: "Santiago, Chile", // Valor por defecto
        type: "Tiempo completo", // Valor por defecto
        status: formData.status as "Activa" | "Pausada" | "Cerrada",
        responsible_id: user?.id || "default-admin-id", // Default admin ID
        description: formData.description || ""
      })

      if (newApplication) {
        console.log("✅ Nueva postulación creada:", newApplication)
        onClose()
        // Redirigir a la nueva postulación
        router.push(`/postulations/${newApplication.id}`)
      }
    } catch (error) {
      console.error("❌ Error creando postulación:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al crear la postulación: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Nueva Postulación
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la postulación *</Label>
              <Input
                id="title"
                placeholder="ej. Búsqueda Desarrollador Frontend Senior"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                placeholder="ej. Desarrollador Frontend Senior"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleChange("department", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Operaciones">Operaciones</SelectItem>
                  <SelectItem value="Diseño">Diseño</SelectItem>
                  <SelectItem value="Producto">Producto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleChange("priority", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el puesto y las responsabilidades..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea
              id="requirements"
              placeholder="Lista los requisitos y habilidades necesarias..."
              value={formData.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Postulación"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
