"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Loader2, Sparkles } from "lucide-react"
import { candidatesService, applicationsService, attachmentsService } from "@/lib/supabase-service"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { AICandidateAnalyzer } from "@/components/ai-candidate-analyzer"

interface NewCandidateModalProps {
  onClose: () => void
}

export function NewCandidateModal({ onClose }: NewCandidateModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const canUseAI = user?.permissions?.includes("usar_ia") || user?.role === "Admin RRHH"
  const [applications, setApplications] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    location: "",
    salary: "",
    experience: "",
    source: "",
    notes: "",
    application_id: "", // Campo para seleccionar postulación existente
    stage: "Pre-entrevista", // Etapa inicial
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Cargar postulaciones existentes
  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await applicationsService.getAllApplications()
        setApplications(data.filter(app => app.status === "Activa"))
      } catch (error) {
        console.error("Error loading applications:", error)
      }
    }
    loadApplications()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('📄 Creando candidato con archivos:', uploadedFiles.length)
      
      const newCandidate = await candidatesService.createCandidate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        position: formData.position || "",
        stage: formData.stage,
        score: null,
        status: "pending" as "pending" | "scheduled" | "stalled" | "completed" | "rejected" | "on-hold",
        assignee_id: user?.id || "default-admin-id",
        application_id: formData.application_id ? parseInt(formData.application_id) : 1, // Valor por defecto
        experience: formData.experience || "",
        location: formData.location || "",
        avatar: "",
        applied_at: new Date().toISOString()
      })

      if (newCandidate) {
        console.log("✅ Nuevo candidato creado:", newCandidate)
        
        // Subir archivos si hay algunos seleccionados
        if (uploadedFiles.length > 0) {
          console.log('📎 Subiendo archivos adjuntos...')
          setUploadingFiles(true)
          
          try {
            for (const file of uploadedFiles) {
              console.log(`📄 Subiendo archivo: ${file.name}`)
              await attachmentsService.uploadFile(
                newCandidate.id,
                file,
                `Archivo inicial - ${file.name}`
              )
            }
            
            console.log(`✅ ${uploadedFiles.length} archivo(s) subido(s) exitosamente`)
          } catch (uploadError) {
            console.error('❌ Error subiendo archivos:', uploadError)
            // No fallar la creación del candidato por archivos
            alert(`Candidato creado, pero hubo un error subiendo archivos: ${uploadError}`)
          } finally {
            setUploadingFiles(false)
          }
        }
        
        onClose()
        // Redirigir al candidato creado
        router.push(`/candidates/${newCandidate.id}`)
      }
    } catch (error) {
      console.error("❌ Error creando candidato:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al crear el candidato: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAIAnalysisComplete = (candidateData: any) => {
    setFormData(prev => ({
      ...prev,
      name: candidateData.name || prev.name,
      email: candidateData.email || prev.email,
      phone: candidateData.phone || prev.phone,
      position: candidateData.position || prev.position,
      experience: candidateData.experience || prev.experience,
      location: candidateData.location || prev.location,
      source: candidateData.source || prev.source,
      notes: candidateData.notes || prev.notes,
      stage: candidateData.stage || prev.stage
    }))
    setShowAIAnalyzer(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nuevo Postulante</DialogTitle>
          <p className="text-sm text-gray-600">Agregar candidato a una postulación existente</p>
        </DialogHeader>

        {showAIAnalyzer ? (
          <AICandidateAnalyzer
            onAnalysisComplete={handleAIAnalysisComplete}
            onClose={() => setShowAIAnalyzer(false)}
          />
        ) : (
          <>
            {canUseAI && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Análisis Rápido con IA</h3>
                  <p className="text-sm text-gray-600">Sube un CV o descripción para autocompletar</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAIAnalyzer(true)}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Usar IA
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Postulación</h3>
            <div>
              <Label htmlFor="application_id">Seleccionar Postulación *</Label>
              <Select
                value={formData.application_id}
                onValueChange={(value) => handleInputChange("application_id", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar postulación existente" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id.toString()}>
                      {app.title} - {app.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ciudad, País"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Profesional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Posición Actual</Label>
                <Input
                  id="position"
                  placeholder="Desarrollador Frontend"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="experience">Años de Experiencia</Label>
                <Input
                  id="experience"
                  placeholder="3 años"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Fuente</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleInputChange("source", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="¿Cómo nos encontró?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="Referido">Referido</SelectItem>
                    <SelectItem value="Sitio Web">Sitio Web</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stage">Etapa Inicial</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleInputChange("stage", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-entrevista">Pre-entrevista</SelectItem>
                    <SelectItem value="Primera etapa">Primera etapa</SelectItem>
                    <SelectItem value="Segunda etapa">Segunda etapa</SelectItem>
                    <SelectItem value="Fit cultural">Fit cultural</SelectItem>
                    <SelectItem value="Stand by">Stand by</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el candidato..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Archivos Adjuntos</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Subir archivos
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, DOC, DOCX hasta 10MB
                    </span>
                  </Label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos seleccionados:</Label>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploadingFiles}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingFiles ? 'Subiendo archivos...' : 'Creando...'}
                </>
              ) : (
                "Crear Candidato"
              )}
            </Button>
          </div>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
