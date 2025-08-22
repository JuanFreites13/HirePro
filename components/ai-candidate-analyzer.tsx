"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Video, Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { aiService, type AIAnalysisResponse } from "@/lib/ai-service"
import { applicationsService, candidatesService } from "@/lib/supabase-service"

interface AICandidateAnalyzerProps {
  onAnalysisComplete: (candidateData: any) => void
  onClose: () => void
}

// Usar el tipo del servicio de IA
type AnalysisResult = AIAnalysisResponse

export function AICandidateAnalyzer({ onAnalysisComplete, onClose }: AICandidateAnalyzerProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload')
  const [files, setFiles] = useState<{
    video?: File
    cv?: File
  }>({})
  const [description, setDescription] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApplication, setSelectedApplication] = useState("")

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

  const handleFileUpload = (type: 'video' | 'cv', file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleAnalyze = async () => {
    if (!files.cv && !description.trim()) {
      setError("Por favor, proporciona al menos un CV o una descripción.")
      return
    }

    setLoading(true)
    setError("")
    setStep('analyzing')

    try {
      console.log('🤖 Iniciando análisis de IA...')
      console.log('📋 Archivos disponibles:')
      console.log('  CV:', files.cv ? `${files.cv.name} (${files.cv.size} bytes)` : 'No proporcionado')
      console.log('  Descripción:', description ? `${description.length} caracteres` : 'No proporcionada')

      // Usar el endpoint API para análisis de IA
      const formData = new FormData()
      if (files.cv) {
        formData.append('cvFile', files.cv)
        console.log('✅ CV agregado al FormData')
      }
      if (description) {
        formData.append('description', description)
        console.log('✅ Descripción agregada al FormData')
      }

      console.log('📡 Enviando datos al servidor...')
      const response = await fetch('/api/ai/analyze-candidate', {
        method: 'POST',
        body: formData
      })

      console.log('📊 Respuesta del servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.error || 'Error en el análisis')
      }

      const result = await response.json()
      console.log('✅ Análisis completado exitosamente')
      console.log('📊 Resultado:', {
        name: result.data.name,
        email: result.data.email,
        position: result.data.position,
        skills: result.data.skills.length,
        score: result.data.score
      })

      setAnalysisResult(result.data)
      setStep('review')
    } catch (error) {
      console.error('❌ Error en análisis de IA:', error)
      setError(error instanceof Error ? error.message : "Error al analizar los datos. Intenta de nuevo.")
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  // La función simulateAIAnalysis ya no es necesaria, se usa el servicio real

  const handleConfirm = async () => {
    if (analysisResult && selectedApplication) {
      setLoading(true)
      try {
        // 1. Subir archivos a Supabase Storage si existen
        let cvUrl = null
        let videoUrl = null

        console.log('📁 Archivos a procesar:', {
          cv: files.cv ? `${files.cv.name} (${files.cv.size} bytes, ${files.cv.type})` : 'No CV',
          video: files.video ? `${files.video.name} (${files.video.size} bytes, ${files.video.type})` : 'No video'
        })

        if (files.cv) {
          console.log('📄 Subiendo CV a Supabase Storage...')
          const cvPath = `candidates/${Date.now()}/cv/${files.cv.name}`
          cvUrl = await candidatesService.uploadFile(files.cv, 'candidate-files', cvPath)
          console.log('✅ CV subido:', cvUrl)
        }

        if (files.video) {
          console.log('🎥 Subiendo video a Supabase Storage...')
          const videoPath = `candidates/${Date.now()}/video/${files.video.name}`
          videoUrl = await candidatesService.uploadFile(files.video, 'candidate-files', videoPath)
          console.log('✅ Video subido:', videoUrl)
        }

        // 2. Buscar si el candidato ya existe globalmente (si la tabla existe)
        const existingCandidate = await candidatesService.findCandidateByEmail(analysisResult.email)

        let globalCandidateId
        if (existingCandidate) {
          // Candidato existe, usar el ID existente
          globalCandidateId = existingCandidate.id
          console.log('✅ Candidato encontrado:', existingCandidate.name)
        } else {
          // Intentar crear candidato global (fallback a modo simple si falla)
          const globalCandidate = await candidatesService.createGlobalCandidate({
            name: analysisResult.name,
            email: analysisResult.email,
            phone: analysisResult.phone,
            position: analysisResult.position,
            experience: analysisResult.experience,
            location: analysisResult.location,
            source: analysisResult.source,
            skills: analysisResult.skills,
            cv_url: cvUrl,
            video_url: videoUrl,
            ai_analysis: analysisResult
          })
          globalCandidateId = globalCandidate?.id
          console.log('✅ Candidato procesado:', globalCandidate?.name)
        }

        // 3. Crear candidato en tabla principal
        const candidateData = {
          name: analysisResult.name,
          email: analysisResult.email,
          phone: analysisResult.phone || "",
          position: analysisResult.position || "",
          stage: analysisResult.stage,
          score: analysisResult.score,
          status: "pending" as "pending" | "scheduled" | "stalled" | "completed" | "rejected" | "on-hold",
          assignee_id: null, // Cambiar a null para evitar errores de UUID
          application_id: parseInt(selectedApplication),
          experience: analysisResult.experience || "",
          location: analysisResult.location || "",
          avatar: "",
          applied_at: new Date().toISOString()
        }

        console.log('🎯 Datos del candidato a crear:', candidateData)
        console.log('📋 Tipos de datos:')
        console.log('  - name:', typeof candidateData.name, candidateData.name)
        console.log('  - email:', typeof candidateData.email, candidateData.email)
        console.log('  - phone:', typeof candidateData.phone, candidateData.phone)
        console.log('  - position:', typeof candidateData.position, candidateData.position)
        console.log('  - stage:', typeof candidateData.stage, candidateData.stage)
        console.log('  - score:', typeof candidateData.score, candidateData.score)
        console.log('  - status:', typeof candidateData.status, candidateData.status)
        console.log('  - assignee_id:', typeof candidateData.assignee_id, candidateData.assignee_id)
        console.log('  - application_id:', typeof candidateData.application_id, candidateData.application_id)
        console.log('  - experience:', typeof candidateData.experience, candidateData.experience)
        console.log('  - location:', typeof candidateData.location, candidateData.location)
        console.log('  - avatar:', typeof candidateData.avatar, candidateData.avatar)
        console.log('  - applied_at:', typeof candidateData.applied_at, candidateData.applied_at)

        const finalCandidate = await candidatesService.createCandidate(candidateData)

        // 4. Registrar en timeline
        if (finalCandidate) {
          await candidatesService.logTimelineAction(
            'candidate',
            finalCandidate.id,
            'created',
            `Candidato ${analysisResult.name} creado con análisis de IA`,
            undefined,
            undefined,
            undefined,
            `Email: ${analysisResult.email}, Posición: ${analysisResult.position}`
          )
        }

        if (finalCandidate) {
          onAnalysisComplete({
            ...analysisResult,
            id: finalCandidate.id,
            global_candidate_id: globalCandidateId,
            application_id: selectedApplication,
            cv_url: cvUrl,
            video_url: videoUrl
          })
        }
      } catch (error) {
        console.error('Error creando candidato:', error)
        setError('Error al crear el candidato. Por favor intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRetry = () => {
    setStep('upload')
    setAnalysisResult(null)
    setError("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Análisis con IA</h2>
        <Badge variant="secondary">Beta</Badge>
      </div>

      {step === 'upload' && (
        <div className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CV del Candidato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <Label htmlFor="cv-upload" className="cursor-pointer">
                      <span className="text-sm font-medium">Subir CV</span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX hasta 10MB
                      </span>
                    </Label>
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload('cv', file)
                      }}
                    />
                  </div>
                </div>
                {files.cv && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{files.cv.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Postulación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="application">Seleccionar Postulación</Label>
                  <Select
                    value={selectedApplication}
                    onValueChange={setSelectedApplication}
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
                
                <div>
                  <Label htmlFor="description">Descripción Adicional</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe brevemente al candidato, la entrevista, o cualquier información adicional relevante..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analizar con IA
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Analizando con IA</h3>
          <p className="text-muted-foreground">
            Procesando CV y descripción...
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm">Extrayendo información del CV</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm">Analizando perfil profesional</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm">Evaluando habilidades técnicas</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm">Generando recomendación</span>
            </div>
          </div>
        </div>
      )}

      {step === 'review' && analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Análisis Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Información del Candidato */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-blue-700">📋 Información del Candidato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><strong>Nombre:</strong> {analysisResult.name}</div>
                    <div><strong>Email:</strong> {analysisResult.email}</div>
                    <div><strong>Teléfono:</strong> {analysisResult.phone}</div>
                    <div><strong>Ubicación:</strong> {analysisResult.location}</div>
                    <div className="md:col-span-2"><strong>LinkedIn:</strong> {analysisResult.linkedin || 'No especificado'}</div>
                  </div>
                </div>

                {/* Perfil Profesional */}
                {analysisResult.professional_summary && (
                  <div>
                    <h4 className="font-semibold text-base mb-3 text-green-700">👤 Perfil Profesional</h4>
                    <p className="text-sm bg-green-50 p-3 rounded-md border-l-4 border-green-500">{analysisResult.professional_summary}</p>
                  </div>
                )}

                {/* Educación */}
                {analysisResult.education && analysisResult.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-base mb-3 text-purple-700">🎓 Educación</h4>
                    <div className="space-y-2">
                      {analysisResult.education.map((edu, index) => (
                        <div key={index} className="bg-purple-50 p-3 rounded-md border-l-4 border-purple-500">
                          <div className="font-medium text-sm">{edu.degree}</div>
                          <div className="text-xs text-gray-600">{edu.institution}</div>
                          <div className="text-xs text-gray-500">{edu.years}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experiencia Laboral */}
                {analysisResult.work_experience && analysisResult.work_experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-base mb-3 text-orange-700">💼 Experiencia Laboral</h4>
                    <div className="space-y-3">
                      {analysisResult.work_experience.map((exp, index) => (
                        <div key={index} className="bg-orange-50 p-3 rounded-md border-l-4 border-orange-500">
                          <div className="font-medium text-sm">{exp.position}</div>
                          <div className="text-xs text-gray-600">{exp.company} • {exp.company_location}</div>
                          <div className="text-xs text-gray-500 mb-2">{exp.start_date} – {exp.end_date}</div>
                          
                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <div className="text-xs">
                              <div className="font-medium text-gray-700">Responsabilidades:</div>
                              <ul className="list-disc list-inside text-gray-600 ml-2">
                                {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                                  <li key={idx}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habilidades */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-teal-700">🛠️ Habilidades</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Idiomas */}
                    {analysisResult.languages && analysisResult.languages.length > 0 && (
                      <div className="bg-teal-50 p-3 rounded-md">
                        <h5 className="font-medium text-xs mb-2">💬 Idiomas</h5>
                        <div className="space-y-1">
                          {analysisResult.languages.map((lang, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{lang.language}</span>
                              <span className="text-gray-500"> ({lang.level})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Herramientas */}
                    {analysisResult.tools_software && analysisResult.tools_software.length > 0 && (
                      <div className="bg-teal-50 p-3 rounded-md">
                        <h5 className="font-medium text-xs mb-2">🔧 Herramientas</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.tools_software.slice(0, 4).map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Técnicas */}
                    {analysisResult.technical_skills && analysisResult.technical_skills.length > 0 && (
                      <div className="bg-teal-50 p-3 rounded-md">
                        <h5 className="font-medium text-xs mb-2">⚡ Técnicas</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.technical_skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evaluación IA */}
                <div>
                  <h4 className="font-semibold text-base mb-3 text-indigo-700">🤖 Evaluación IA</h4>
                  <div className="bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <strong>Puntaje:</strong>
                        <Badge variant="outline">{analysisResult.score}/10</Badge>
                      </div>
                      <div><strong>Etapa Sugerida:</strong> {analysisResult.stage}</div>
                    </div>
                    
                    {/* Habilidades detectadas */}
                    {analysisResult.detected_skills_tags && analysisResult.detected_skills_tags.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-sm">Habilidades detectadas:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.detected_skills_tags.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fortalezas y Consideraciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-green-700">✅ Fortalezas:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {analysisResult.strengths && analysisResult.strengths.slice(0, 3).map((strength, index) => (
                            <li key={index} className="text-xs text-gray-600">{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <strong className="text-orange-700">⚠️ Consideraciones:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {analysisResult.concerns && analysisResult.concerns.slice(0, 3).map((concern, index) => (
                            <li key={index} className="text-xs text-gray-600">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recomendación */}
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <strong className="text-sm text-indigo-700">💡 Recomendación:</strong>
                      <p className="text-xs text-gray-700 mt-1 bg-white p-2 rounded border">{analysisResult.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleRetry}>
              Reanalizar
            </Button>
            <Button onClick={handleConfirm}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Usar Datos Analizados
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


