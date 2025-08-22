'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Plus, Calendar, User } from 'lucide-react'
import { candidatesService } from '@/lib/supabase-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Evaluation {
  id: number
  evaluation_type: string
  score: number
  feedback: string
  stage: string
  created_at: string
  users?: {
    email: string
    name?: string
  }
  applications?: {
    id: number
    title: string
  }
}

export default function CandidateEvaluationsPage({ params }: { params: { id: string } }) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEvaluation, setNewEvaluation] = useState({
    evaluation_type: 'general',
    score: 5,
    feedback: '',
    stage: 'general'
  })

  useEffect(() => {
    loadEvaluations()
  }, [params.id])

  const loadEvaluations = async () => {
    try {
      console.log('🔍 Cargando evaluaciones para candidato ID:', params.id)
      const data = await candidatesService.getCandidateEvaluations(parseInt(params.id))
      console.log('📊 Evaluaciones cargadas:', data)
      console.log('📊 Tipo de data:', typeof data)
      console.log('📊 Es array?:', Array.isArray(data))
      console.log('📊 Longitud:', data?.length)
      if (data && data.length > 0) {
        console.log('📊 Primera evaluación:', data[0])
      }
      setEvaluations(data || [])
    } catch (error) {
      console.error('❌ Error loading evaluations:', error)
      setEvaluations([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvaluation = async () => {
    try {
      await candidatesService.createCandidateEvaluation({
        candidate_id: parseInt(params.id),
        evaluation_type: newEvaluation.evaluation_type,
        score: newEvaluation.score,
        feedback: newEvaluation.feedback,
        stage: newEvaluation.stage
      })
      
      setShowAddDialog(false)
      setNewEvaluation({
        evaluation_type: 'general',
        score: 5,
        feedback: '',
        stage: 'general'
      })
      loadEvaluations()
    } catch (error) {
      console.error('Error adding evaluation:', error)
    }
  }

  const getEvaluationTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800'
      case 'técnica': return 'bg-green-100 text-green-800'
      case 'cultural': return 'bg-purple-100 text-purple-800'
      case 'entrevista': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando evaluaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluaciones del Candidato</h1>
          <p className="text-muted-foreground mt-1">
            Historial completo de evaluaciones y feedback
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Evaluación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="evaluation_type">Tipo de Evaluación</Label>
                  <Select 
                    value={newEvaluation.evaluation_type} 
                    onValueChange={(value) => setNewEvaluation({...newEvaluation, evaluation_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="técnica">Técnica</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="entrevista">Entrevista</SelectItem>
                      <SelectItem value="habilidades">Habilidades</SelectItem>
                      <SelectItem value="experiencia">Experiencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="stage">Etapa</Label>
                  <Select 
                    value={newEvaluation.stage} 
                    onValueChange={(value) => setNewEvaluation({...newEvaluation, stage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="pre-entrevista">Pre-entrevista</SelectItem>
                      <SelectItem value="1ª entrevista">1ª Entrevista</SelectItem>
                      <SelectItem value="2ª entrevista">2ª Entrevista</SelectItem>
                      <SelectItem value="fit cultural">Fit Cultural</SelectItem>
                      <SelectItem value="seleccionado">Seleccionado</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="score">Puntaje (1-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="score"
                    type="number"
                    min="1"
                    max="10"
                    value={newEvaluation.score}
                    onChange={(e) => setNewEvaluation({...newEvaluation, score: parseInt(e.target.value)})}
                    className="w-20"
                  />
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-muted-foreground">/ 10</span>
                    <Star className={`h-4 w-4 ${getScoreColor(newEvaluation.score)}`} />
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {newEvaluation.score >= 8 && 'Excelente candidato'}
                  {newEvaluation.score >= 6 && newEvaluation.score < 8 && 'Buen candidato'}
                  {newEvaluation.score >= 4 && newEvaluation.score < 6 && 'Candidato regular'}
                  {newEvaluation.score < 4 && 'Candidato con áreas de mejora'}
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback Detallado</Label>
                <Textarea
                  id="feedback"
                  value={newEvaluation.feedback}
                  onChange={(e) => setNewEvaluation({...newEvaluation, feedback: e.target.value})}
                  placeholder="Describe detalladamente la evaluación, fortalezas, áreas de mejora, y recomendaciones..."
                  rows={4}
                  className="resize-none"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Incluye fortalezas, áreas de mejora, y recomendaciones específicas.
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddEvaluation}>
                  Agregar Evaluación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen de estadísticas */}
      {evaluations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Promedio General</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Evaluaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{evaluations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Última Evaluación</p>
                  <p className="text-sm font-bold text-green-600">
                    {new Date(evaluations[0]?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm font-medium">Mejor Puntaje</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.max(...evaluations.map(e => e.score))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay evaluaciones
          </h3>
          <p className="text-muted-foreground">
            Comienza agregando la primera evaluación del candidato.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getEvaluationTypeColor(evaluation.evaluation_type)}>
                      {evaluation.evaluation_type}
                    </Badge>
                    <Badge variant="outline">
                      {evaluation.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className={`h-4 w-4 ${getScoreColor(evaluation.score)}`} />
                    <span className={`font-semibold ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score}/10
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Información de la postulación */}
                  {evaluation.applications && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-blue-700">📋 Postulación:</span>
                        <span className="text-sm text-blue-800 font-medium">
                          {evaluation.applications.title}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feedback detallado */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">📝 Feedback Detallado:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {evaluation.feedback || 'No se proporcionó feedback específico.'}
                      </p>
                    </div>
                  </div>

                  {/* Información del evaluador y fecha */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(evaluation.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {evaluation.users && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium">
                            {evaluation.users.name || evaluation.users.email}
                          </span>
                          {evaluation.users.name && (
                            <span className="text-gray-500">
                              ({evaluation.users.email})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Etapa de la evaluación */}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-600">Etapa:</span>
                      <Badge variant="secondary" className="text-xs">
                        {evaluation.stage}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
