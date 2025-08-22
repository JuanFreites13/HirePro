"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Users, Calendar, MapPin, Star } from "lucide-react"
import { candidatesService } from "@/lib/supabase-service"
import { LoadingSpinner } from "@/components/ui/accessibility"
import { useRouter } from "next/navigation"
import { StageChangeModal } from "@/components/stage-change-modal"

interface PipelineViewProps {
  applicationId: number
}

interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  position: string
  stage: string
  score: number | null
  avatar: string
  location: string
  experience: string
  applied_at: string
  assignee?: string
  assignee_id?: string
}

const stages = [
  { id: "pre-entrevista", name: "Pre-entrevista", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", order: 0 },
  { id: "primera", name: "1ª Entrevista", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", order: 1 },
  { id: "segunda", name: "2ª Entrevista", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", order: 2 },
  { id: "fit-cultural", name: "Fit Cultural", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", order: 3 },
  { id: "seleccionado", name: "Seleccionado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", order: 4 },
  { id: "descartado", name: "Descartado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", order: 5 },
  { id: "stand-by", name: "Stand by", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", order: 6 },
]

export function PipelineView({ applicationId }: PipelineViewProps) {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null)
  const [showStageModal, setShowStageModal] = useState(false)
  const [targetStage, setTargetStage] = useState("")
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  useEffect(() => {
    loadCandidates()
  }, [applicationId])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const data = await candidatesService.getCandidatesByApplication(applicationId)
      setCandidates(data)
    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCandidatesByStage = (stageId: string) => {
    // Mapear nombres de etapas a IDs
    const stageMapping: { [key: string]: string } = {
      "Pre-entrevista": "pre-entrevista",
      "Primera etapa": "primera",
      "1ª Entrevista": "primera",
      "Segunda etapa": "segunda", 
      "2ª Entrevista": "segunda",
      "Fit cultural": "fit-cultural",
      "Fit Cultural": "fit-cultural",
      "Seleccionado": "seleccionado",
      "Descartado": "descartado",
      "Stand by": "stand-by"
    }
    
    const stageCandidates = candidates.filter(candidate => {
      const candidateStageId = stageMapping[candidate.stage] || candidate.stage
      return candidateStageId === stageId
    })
    
    return stageCandidates
  }

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.name || stageId
  }

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.color || "bg-gray-100 text-gray-800"
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverStage(stageId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverStage(null)
  }

  // Función para determinar si se debe mostrar el modal según el tipo de movimiento
  const shouldShowModal = (fromStageId: string, toStageId: string) => {
    // Etapas que requieren modal de entrevista (feedback completo)
    const interviewStages = ["segunda", "fit-cultural", "seleccionado", "descartado"]
    
    // Caso especial: Pre-entrevista → 1ª Entrevista (solo responsable)
    if (fromStageId === "pre-entrevista" && toStageId === "primera") {
      return true
    }
    
    // Para movimientos hacia etapas de entrevista
    if (interviewStages.includes(toStageId)) {
      return true
    }
    
    return false
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(null)
    

    
    if (draggedCandidate && draggedCandidate.stage !== stageId) {
      // Obtener el orden de las etapas
      const getCurrentStageOrder = (candidateStage: string) => {
        const stageMapping: { [key: string]: string } = {
          "Pre-entrevista": "pre-entrevista",
          "Primera etapa": "primera",
          "Segunda etapa": "segunda",
          "Fit cultural": "fit-cultural",
          "Fit Cultural": "fit-cultural",
          "Seleccionado": "seleccionado",
          "Descartado": "descartado",
          "Stand by": "stand-by"
        }
        const mappedStageId = stageMapping[candidateStage] || candidateStage
        const stage = stages.find(s => s.id === mappedStageId)
        return stage ? stage.order : 0
      }
      
      const currentOrder = getCurrentStageOrder(draggedCandidate.stage)
      const targetStage = stages.find(s => s.id === stageId)
      const targetOrder = targetStage ? targetStage.order : 0
      
      // Obtener el stage ID actual del candidato
      const currentStageMapping: { [key: string]: string } = {
        "Pre-entrevista": "pre-entrevista",
        "Primera etapa": "primera", 
        "Segunda etapa": "segunda",
        "Fit cultural": "fit-cultural",
        "Seleccionado": "seleccionado",
        "Descartado": "descartado",
        "Stand by": "stand-by"
      }
      const currentStageId = currentStageMapping[draggedCandidate.stage] || draggedCandidate.stage
      
      // Casos especiales para movimientos permitidos:
      
      // 1. Desde "Stand by" o "Descartado" se puede mover a cualquier etapa SIN modal
      if (currentStageId === 'stand-by' || currentStageId === 'descartado') {
        handleStageChange(draggedCandidate, stageId, "", 0, draggedCandidate.assignee_id || "")
        return
      }
      
      // 2. Movimiento a "stand-by" permitido desde cualquier etapa SIN modal
      if (stageId === 'stand-by') {
        handleStageChange(draggedCandidate, stageId, "", 0, draggedCandidate.assignee_id || "")
        return
      }
      
      // 3. Movimiento a "seleccionado" solo permitido desde etapas avanzadas CON modal
      if (stageId === 'seleccionado') {
        if (currentOrder >= 3) { // Desde Fit Cultural (order 3) en adelante
          setTargetStage(stageId)
          setShowStageModal(true)
        } else {
          alert('❌ Solo puedes seleccionar candidatos desde etapas avanzadas del proceso')
        }
        return
      }
      
      // 4. Para etapas progresivas normales (pre-entrevista -> fit-cultural), solo permitir avance
      if (targetOrder < currentOrder && targetOrder <= 3) {
        alert('❌ No puedes mover un candidato a una etapa anterior')
        return
      }
      
      // 5. Mostrar modal según el tipo de movimiento
      if (shouldShowModal(currentStageId, stageId)) {
        setTargetStage(stageId)
        setShowStageModal(true)
      } else {
        // Para otras etapas, mover directamente
        handleStageChange(draggedCandidate, stageId, "", 0, draggedCandidate.assignee_id || "")
      }
    }
  }

  const handleStageChange = async (
    candidate: Candidate, 
    newStage: string, 
    feedback: string, 
    score: number, 
    assignee: string
  ) => {
    try {
      // Mapear IDs de etapas a nombres para guardar en Supabase
      const stageNameMapping: { [key: string]: string } = {
        "pre-entrevista": "Pre-entrevista",
        "primera": "Primera etapa",
        "segunda": "Segunda etapa",
        "fit-cultural": "Fit cultural",
        "seleccionado": "Seleccionado",
        "descartado": "Descartado",
        "stand-by": "Stand by"
      }
      
      const stageName = stageNameMapping[newStage] || newStage
      
      // Solo pasar los campos que necesitamos actualizar, NO incluir score
      const updates: any = {
        stage: stageName
      }
      
      // Solo agregar assignee_id si parece un UUID válido
      if (assignee && assignee.trim()) {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
        if (uuidRegex.test(assignee.trim())) {
          updates.assignee_id = assignee.trim()
        }
      }

      // Guardar evaluación primero si existe feedback y no está vacío
      if (feedback && feedback.trim() && feedback !== "") {
        try {
          await candidatesService.createCandidateEvaluation({
            candidate_id: candidate.id,
            evaluator_id: null, // Enviar null en lugar de UUID inválido
            evaluation_type: 'entrevista',
            score: score || 0,
            feedback: feedback,
            stage: stageName
          })
          console.log('✅ Evaluación guardada exitosamente para candidato:', candidate.id)
        } catch (evaluationError) {
          console.error('Error al guardar evaluación:', evaluationError)
          console.error('Evaluation data:', { feedback, stageName, score, candidate_id: candidate.id })
        }
      }

      const result = await candidatesService.updateCandidate(candidate.id, updates, applicationId)
      
      if (result) {
        // Enviar email al responsable seleccionado si corresponde
        try {
          if (updates.assignee_id) {
            // Obtener info del responsable y de la aplicación en el servidor vía API
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'next_interview',
                data: {
                  // Estos datos los completará el endpoint usando los servicios (nombre/email del user)
                  userName: 'Responsable',
                  userEmail: 'responsable@example.com',
                  applicationTitle: '',
                  candidateName: candidate.name,
                  stage: stageName,
                  assignedBy: 'Sistema',
                  assignedAt: new Date().toISOString(),
                  assigneeId: updates.assignee_id,
                  applicationId
                }
              })
            })
          }
        } catch (emailError) {
          console.warn('⚠️ Error enviando email de siguiente entrevista:', emailError)
        }

        // Recargar candidatos para obtener el puntaje promedio actualizado
        loadCandidates()
      } else {
        console.error('No se pudo actualizar el candidato')
        alert('❌ Error al actualizar el candidato. Por favor intenta nuevamente.')
      }

      setShowStageModal(false)
      setDraggedCandidate(null)
      setTargetStage("")
    } catch (error) {
      console.error('Error al actualizar etapa del candidato:', error)
      alert('❌ Error al actualizar el candidato. Por favor intenta nuevamente.')
      setShowStageModal(false)
      setDraggedCandidate(null)
      setTargetStage("")
    }
  }

  const handleStageChangeConfirm = (feedback: string, score: number, assignee: string) => {
    if (draggedCandidate && targetStage) {
      handleStageChange(draggedCandidate, targetStage, feedback, score, assignee)
    }
  }

  const handleStageChangeCancel = () => {
    setShowStageModal(false)
    setDraggedCandidate(null)
    setTargetStage("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="default" />
        <span className="ml-2">Cargando pipeline...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline de Candidatos</h2>
        <Button onClick={() => router.push(`/postulations/${applicationId}`)}>
          Ver Detalles de Postulación
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-[600px] overflow-x-auto">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id)
          const isDragOver = dragOverStage === stage.id
          
          return (
            <div key={stage.id} className="min-w-0">
              <Card className={`h-full transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Badge className={stage.color}>
                        {stage.name}
                      </Badge>
                      <span className="text-muted-foreground">
                        ({stageCandidates.length})
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent 
                  className="pt-0 px-2"
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="space-y-3">
                    {stageCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-medium line-clamp-1">
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {candidate.position}
                            </p>
                          </div>
                        </div>
                        
                        {/* Información del candidato */}
                        <div className="space-y-1">
                          {/* Responsable asignado */}
                          {candidate.assignee && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                              <User className="h-3 w-3" />
                              <span className="font-medium truncate">{candidate.assignee}</span>
                            </div>
                          )}
                          
                          {/* Puntuación y fecha */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {candidate.score && candidate.score > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{candidate.score ? candidate.score.toFixed(1) : '0.0'}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(candidate.applied_at).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {stageCandidates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Sin candidatos</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {candidates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay candidatos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando candidatos a esta postulación
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de cambio de etapa */}
      {showStageModal && draggedCandidate && (
        <StageChangeModal
          candidate={{
            ...draggedCandidate,
            phone: draggedCandidate.phone || "",
            assignee: draggedCandidate.assignee || "",
            assignee_id: draggedCandidate.assignee_id || "",
            lastActivity: new Date().toISOString(),
            status: "active",
            score: draggedCandidate.score || 0
          }}
          newStage={getStageName(targetStage)}
          fromStage={draggedCandidate.stage}
          onConfirm={handleStageChangeConfirm}
          onCancel={handleStageChangeCancel}
        />
      )}
    </div>
  )
}


