"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, User, Calendar } from "lucide-react"
import { usersService } from "@/lib/supabase-service"

interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  position: string
  stage: string
  status: string
  assignee: string
  lastActivity: string
  score: number
  avatar: string
}

interface StageChangeModalProps {
  candidate: Candidate
  newStage: string
  onConfirm: (feedback: string, score: number, assignee: string) => void
  onCancel: () => void
  fromStage?: string // Para determinar el tipo de modal
}

export function StageChangeModal({ candidate, newStage, onConfirm, onCancel, fromStage }: StageChangeModalProps) {
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(candidate.score.toString())
  const [assignee, setAssignee] = useState(candidate.assignee_id || candidate.assignee)
  const [errors, setErrors] = useState<{ feedback?: string; score?: string }>({})
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Cargar usuarios disponibles
  useEffect(() => {
    loadAvailableUsers()
  }, [])

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true)
      const users = await usersService.getAllUsers()
      setAvailableUsers(users)
    } catch (error) {
      console.error('❌ Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Determinar el tipo de modal según el movimiento
  const isSimpleAssignmentModal = fromStage === "Pre-entrevista" && newStage === "1ª Entrevista"
  const isFinalStageModal = newStage === "Seleccionado" || newStage === "Descartado"
  const isFullInterviewModal = !isSimpleAssignmentModal && !isFinalStageModal
  const isNextInterviewModal = ["1ª Entrevista", "2ª Entrevista", "Fit Cultural"].includes(newStage)

  const validateForm = () => {
    const newErrors: { feedback?: string; score?: string } = {}

    // Solo validar feedback y score para modales de entrevista completa y etapas finales
    if (isFullInterviewModal || isFinalStageModal) {
      if (!feedback.trim()) {
        newErrors.feedback = "El feedback es obligatorio"
      }

      const scoreNum = Number.parseFloat(score)
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
        newErrors.score = "El puntaje debe ser un número entre 0 y 10"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validateForm()) {
      // Para modal simple, no enviar feedback (será vacío)
      const finalFeedback = isSimpleAssignmentModal ? "" : feedback
      const finalScore = isSimpleAssignmentModal ? 0 : Number.parseFloat(score)
      onConfirm(finalFeedback, finalScore, assignee)
    }
  }

  const handleScoreChange = (value: string) => {
    // Permitir solo números con un decimal
    const regex = /^\d*\.?\d?$/
    if (regex.test(value) || value === "") {
      setScore(value)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "1ª Entrevista":
        return "bg-yellow-100 text-yellow-800"
      case "2ª Entrevista":
        return "bg-orange-100 text-orange-800"
      case "Fit Cultural":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "1ª Entrevista":
        return "👥"
      case "2ª Entrevista":
        return "🎯"
      case "Fit Cultural":
        return "🏢"
      default:
        return "📋"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getStageIcon(newStage)}</span>
            <span>
              {isSimpleAssignmentModal ? "Asignar Responsable" : "Calificar Entrevista"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del candidato */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.position}</p>
            </div>
          </div>

          {/* Etapas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Etapa actual:</span>
              <p className="text-gray-800">{candidate.stage}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Nueva etapa:</span>
              <Badge className={getStageColor(newStage)}>
                {newStage}
              </Badge>
            </div>
          </div>

          {/* Calificación - Para entrevistas y etapas finales */}
          {(isFullInterviewModal || isFinalStageModal) && (
            <div className="space-y-2">
              <Label htmlFor="score" className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Puntaje de la entrevista (0.0 - 10.0) *
              </Label>
              <Input
                id="score"
                type="text"
                placeholder="ej. 7.5"
                value={score}
                onChange={(e) => handleScoreChange(e.target.value)}
                className={errors.score ? "border-red-500" : ""}
              />
              {errors.score && <p className="text-red-500 text-sm">{errors.score}</p>}
            </div>
          )}

          {/* Feedback - Para entrevistas y etapas finales */}
          {(isFullInterviewModal || isFinalStageModal) && (
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback de la entrevista *</Label>
              <Textarea
                id="feedback"
                placeholder="Describe cómo fue la entrevista, fortalezas y áreas de mejora del candidato..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={errors.feedback ? "border-red-500" : ""}
                rows={4}
              />
              {errors.feedback && <p className="text-red-500 text-sm">{errors.feedback}</p>}
            </div>
          )}

          {/* Responsable - Solo para etapas que no son finales */}
          {!isFinalStageModal && (
            <div className="space-y-2">
              <Label htmlFor="assignee" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {isSimpleAssignmentModal || isNextInterviewModal ? "Responsable de la siguiente entrevista" : "Responsable de la entrevista"}
              </Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsers ? (
                    <SelectItem value="loading" disabled>
                      Cargando usuarios...
                    </SelectItem>
                  ) : (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Confirmar y Mover
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

