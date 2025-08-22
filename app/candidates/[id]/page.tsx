"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText,
  Building2,
  Star,
  Download,
  Plus,
  Edit,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Image,
  Archive,
  Download as DownloadIcon
} from "lucide-react"
import { useState, useEffect } from "react"
import { candidatesService, applicationsService, attachmentsService, timelineService, duplicateService, usersService } from "@/lib/supabase-service"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoveStageModal } from "@/components/move-stage-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendEmail } from "@/lib/backend-api"
import googleCalendarService from "@/lib/google-calendar-service"
// Evaluations Tab Component
function EvaluationsTabContent({ candidateId }: { candidateId: number }) {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvaluations()
  }, [candidateId])

  const loadEvaluations = async () => {
    try {
      console.log('🔍 Cargando evaluaciones para candidato ID:', candidateId)
      const data = await candidatesService.getCandidateEvaluations(candidateId)
      console.log('📊 Evaluaciones cargadas en tab:', data)
      setEvaluations(data || [])
    } catch (error) {
      console.error('❌ Error loading evaluations:', error)
      setEvaluations([])
    } finally {
      setLoading(false)
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
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando evaluaciones...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de estadísticas */}
      {evaluations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Lista de evaluaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Evaluaciones</CardTitle>
            <Button size="sm" onClick={() => window.open(`/candidates/${candidateId}/evaluations`, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalle Completo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay evaluaciones
              </h3>
              <p className="text-muted-foreground">
                Comienza agregando la primera evaluación del candidato.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.slice(0, 5).map((evaluation) => (
                <div key={evaluation.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
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
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {evaluation.feedback || 'Sin comentarios adicionales'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(evaluation.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {evaluation.users && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{evaluation.users.name || evaluation.users.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {evaluations.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => window.open(`/candidates/${candidateId}/evaluations`, '_blank')}>
                    Ver todas las evaluaciones ({evaluations.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Attachments Tab Component
function AttachmentsTabContent({ candidateId }: { candidateId: number }) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    description: ''
  })

  useEffect(() => {
    loadAttachments()
  }, [candidateId])

  const loadAttachments = async () => {
    try {
      const data = await attachmentsService.getCandidateAttachments(candidateId)
      setAttachments(data || [])
    } catch (error) {
      console.error('❌ Error loading attachments:', error)
      setAttachments([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      attachmentsService.validateFile(file)
      setUploadData({ ...uploadData, file })
    } catch (error: any) {
      alert(error.message)
      event.target.value = '' // Reset input
    }
  }

  const handleUpload = async () => {
    if (!uploadData.file) return

    try {
      setUploading(true)
      await attachmentsService.uploadFile(candidateId, uploadData.file, uploadData.description)
      
      // Reset form and reload attachments
      setUploadData({ file: null, description: '' })
      setShowUploadDialog(false)
      loadAttachments()
      
      alert('Archivo subido exitosamente')
    } catch (error: any) {
      console.error('❌ Error uploading file:', error)
      alert('Error subiendo archivo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (attachment: any) => {
    try {
      await attachmentsService.downloadFile(attachment.file_path, attachment.original_name)
    } catch (error: any) {
      console.error('❌ Error downloading file:', error)
      alert('Error descargando archivo: ' + error.message)
    }
  }

  const handleDelete = async (attachment: any) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${attachment.original_name}"?`)) {
      return
    }

    try {
      await attachmentsService.deleteFile(attachment.id, attachment.file_path)
      loadAttachments()
      alert('Archivo eliminado exitosamente')
    } catch (error: any) {
      console.error('❌ Error deleting file:', error)
      alert('Error eliminando archivo: ' + error.message)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5" />
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Archivos Adjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando archivos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Archivos Adjuntos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              CVs, certificados, documentos y otros archivos del candidato
            </p>
          </div>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Archivo Adjunto</DialogTitle>
                <DialogDescription>
                  Selecciona un archivo para agregar a este candidato. Formatos soportados: PDF, Word, Excel, imágenes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Seleccionar Archivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Formatos soportados: PDF, Word, Excel, imágenes, ZIP. Máximo 50MB.
                  </div>
                </div>

                {uploadData.file && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(uploadData.file.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{uploadData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadData.file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Describe el contenido del archivo..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowUploadDialog(false)
                      setUploadData({ file: null, description: '' })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!uploadData.file || uploading}
                  >
                    {uploading ? 'Subiendo...' : 'Subir Archivo'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay archivos adjuntos
            </h3>
            <p className="text-muted-foreground">
              Comienza subiendo el primer archivo del candidato.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.file_type)}
                    <div className="flex-1">
                      <p className="font-medium">{attachment.original_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>
                          {new Date(attachment.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {attachment.uploaded_by_user && (
                          <>
                            <span>•</span>
                            <span>{attachment.uploaded_by_user.email}</span>
                          </>
                        )}
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(attachment)}
                    >
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(attachment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Timeline Tab Component
function TimelineTabContent({ candidateId }: { candidateId: number }) {
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [candidateId])

  const loadTimeline = async () => {
    try {
      const events = await timelineService.getCompleteTimeline(candidateId)
      setTimelineEvents(events || [])
    } catch (error) {
      console.error('❌ Error loading timeline:', error)
      setTimelineEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha no disponible'
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventColor = (actionType: string) => {
    switch (actionType) {
      case 'candidate_created':
        return 'border-green-200 bg-green-50'
      case 'candidate_updated':
        return 'border-blue-200 bg-blue-50'
      case 'candidate_deleted':
        return 'border-red-200 bg-red-50'
      case 'postulation_created':
        return 'border-purple-200 bg-purple-50'
      case 'postulation_updated':
        return 'border-yellow-200 bg-yellow-50'
      case 'postulation_deleted':
        return 'border-red-200 bg-red-50'
      case 'evaluation_created':
        return 'border-indigo-200 bg-indigo-50'
      case 'evaluation_updated':
        return 'border-pink-200 bg-pink-50'
      case 'evaluation_deleted':
        return 'border-red-200 bg-red-50'
      case 'note_created':
        return 'border-cyan-200 bg-cyan-50'
      case 'note_updated':
        return 'border-teal-200 bg-teal-50'
      case 'note_deleted':
        return 'border-red-200 bg-red-50'
      case 'attachment_uploaded':
        return 'border-orange-200 bg-orange-50'
      case 'attachment_updated':
        return 'border-amber-200 bg-amber-50'
      case 'attachment_deleted':
        return 'border-red-200 bg-red-50'
      case 'stage_update':
        return 'border-blue-200 bg-blue-50'
      case 'score_update':
        return 'border-yellow-200 bg-yellow-50'
      case 'assignee_update':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getEventIcon = (actionType: string) => {
    switch (actionType) {
      case 'candidate_created':
        return '👤'
      case 'candidate_updated':
        return '✏️'
      case 'candidate_deleted':
        return '🗑️'
      case 'postulation_created':
        return '📝'
      case 'postulation_updated':
        return '🔄'
      case 'postulation_deleted':
        return '❌'
      case 'evaluation_created':
        return '⭐'
      case 'evaluation_updated':
        return '📊'
      case 'evaluation_deleted':
        return '🗑️'
      case 'note_created':
        return '📝'
      case 'note_updated':
        return '✏️'
      case 'note_deleted':
        return '🗑️'
      case 'attachment_uploaded':
        return '📎'
      case 'attachment_updated':
        return '📄'
      case 'attachment_deleted':
        return '🗑️'
      case 'stage_update':
        return '🔄'
      case 'score_update':
        return '⭐'
      case 'assignee_update':
        return '👥'
      default:
        return '📋'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando timeline...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Actividades</CardTitle>
        <p className="text-sm text-muted-foreground">
          Historial completo del candidato en todas las postulaciones
        </p>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay actividades registradas
            </h3>
            <p className="text-muted-foreground">
              El historial aparecerá aquí conforme el candidato participe en postulaciones.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {timelineEvents
                  .filter(event => event.created_at && !isNaN(new Date(event.created_at).getTime()))
                  .map((event, index) => (
                  <div key={event.id} className="relative flex items-start space-x-4">
                    {/* Punto del timeline */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center text-xl">
                        {getEventIcon(event.action_type)}
                      </div>
                      {index !== timelineEvents.length - 1 && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                      )}
                    </div>
                    
                    {/* Contenido del evento */}
                    <div className={`flex-1 p-4 rounded-lg border-2 ${getEventColor(event.action_type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.action_description}</h4>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(event.created_at)}</span>
                            </div>
                            {event.performed_by_email && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{event.performed_by_email}</span>
                              </div>
                            )}
                            {event.metadata?.application_title && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-3 w-3" />
                                <span>{event.metadata.application_title}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Mostrar cambios de valor si existen */}
                          {event.previous_value && event.new_value && (
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="line-through">{event.previous_value}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{event.new_value}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Badge de etapa si existe en metadata */}
                        {event.metadata?.stage && (
                          <Badge variant="outline" className="ml-2">
                            {event.metadata.stage}
                          </Badge>
                        )}
                        
                        {/* Puntaje si es evaluación */}
                        {event.metadata?.score && (
                          <div className="ml-2 flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{event.metadata.score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const stages = [
  { id: "pre-entrevista", name: "Pre-entrevista", color: "bg-blue-100 text-blue-800" },
  { id: "primera", name: "1ª Entrevista", color: "bg-yellow-100 text-yellow-800" },
  { id: "segunda", name: "2ª Entrevista", color: "bg-orange-100 text-orange-800" },
  { id: "fit-cultural", name: "Fit Cultural", color: "bg-purple-100 text-purple-800" },
  { id: "seleccionado", name: "Seleccionado", color: "bg-green-100 text-green-800" },
  { id: "descartado", name: "Descartado", color: "bg-red-100 text-red-800" },
  { id: "stand-by", name: "Stand by", color: "bg-gray-100 text-gray-800" },
]

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = Number(params?.id)
  const [candidate, setCandidate] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [candidatePostulations, setCandidatePostulations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoveStage, setShowMoveStage] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    experience: ''
  })
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [activeApplications, setActiveApplications] = useState<any[]>([])
  const [duplicateData, setDuplicateData] = useState({
    applicationId: '',
    stage: 'pre-entrevista',
    assigneeId: ''
  })
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: 60,
    assigneeId: '',
    postulationId: '',
    notes: ''
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    selectedPostulation: '',
    createMeeting: false,
    meetingDate: '',
    meetingTime: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [candidateData, applicationsData, usersData] = await Promise.all([
        candidatesService.getCandidateById(candidateId),
        applicationsService.getAllApplications(),
        usersService.getAllUsers()
      ])
      setCandidate(candidateData)
      setApplications(applicationsData || [])
      setUsers(usersData || [])

      // Cargar postulaciones del candidato (si tabla postulations existe)
      try {
        const postulations = await duplicateService.getCandidatePostulations(candidateId)
        setCandidatePostulations(postulations)
        console.log('📋 Postulaciones del candidato:', postulations)
      } catch (error) {
        console.log('⚠️ Tabla postulations no disponible, usando método tradicional')
        setCandidatePostulations([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (candidateId) {
      loadData()
    }
  }, [candidateId])

  // Limpiar estado cuando el modal se cierra
  useEffect(() => {
    if (!showEmailModal) {
      setEmailSending(false)
      setEmailData({
        subject: '',
        message: '',
        selectedPostulation: '',
        createMeeting: false,
        meetingDate: '',
        meetingTime: ''
      })
    }
  }, [showEmailModal])

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage.toLowerCase().replace(/\s+/g, '-'))
    return stageConfig?.color || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "on-hold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStageChanged = () => {
    // Recargar datos del candidato
    loadData()
  }

  const handleEditProfile = () => {
    // Prellenar datos actuales
    setEditData({
      name: candidate?.name || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      location: candidate?.location || '',
      position: candidate?.position || '',
      experience: candidate?.experience || 0
    })
    setShowEditProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      console.log('💾 Guardando perfil del candidato:', candidateId, editData)
      
      await candidatesService.updateCandidate(candidateId, editData)
      
      setShowEditProfile(false)
      loadData() // Recargar datos
      alert('Perfil actualizado exitosamente')
    } catch (error: any) {
      console.error('❌ Error updating profile:', error)
      alert('Error actualizando perfil: ' + error.message)
    }
  }

  const handleOpenDuplicateModal = async () => {
    try {
      console.log('🔍 Cargando datos para duplicar candidato...')
      
      // Obtener aplicaciones activas (excluyendo la actual)
      const apps = await duplicateService.getActiveApplications(candidate?.application_id)
      setActiveApplications(apps)
      
      // Resetear datos del formulario
      setDuplicateData({
        applicationId: '',
        stage: 'pre-entrevista',
        assigneeId: ''
      })
      
      setShowDuplicateModal(true)
    } catch (error: any) {
      console.error('❌ Error loading duplicate data:', error)
      alert('Error cargando procesos disponibles: ' + error.message)
    }
  }

  const handleDuplicateCandidate = async () => {
    try {
      if (!duplicateData.applicationId) {
        alert('Por favor selecciona un proceso de postulación')
        return
      }

      if (!duplicateData.assigneeId) {
        alert('Por favor selecciona un responsable')
        return
      }

      console.log('🔗 Vinculando candidato:', candidateId, duplicateData)
      
      await duplicateService.duplicateCandidate(
        candidateId,
        parseInt(duplicateData.applicationId),
        duplicateData.stage,
        duplicateData.assigneeId
      )
      
      setShowDuplicateModal(false)
      alert('Candidato vinculado exitosamente al nuevo proceso')
      
      // Recargar datos para mostrar la nueva postulación
      loadData()
    } catch (error: any) {
      console.error('❌ Error linking candidate:', error)
      alert('Error vinculando candidato: ' + error.message)
    }
  }

  const handleDeleteCandidate = async () => {
    try {
      const confirmDelete = confirm(
        `¿Estás seguro de que quieres eliminar a ${candidate?.name}?\n\nEsta acción eliminará al candidato de TODOS los procesos y no se puede deshacer.\n\nSi hay duplicados temporales, se eliminarán TODOS.`
      )
      
      if (!confirmDelete) return

      console.log('🗑️ Eliminando candidato y duplicados:', candidateId)
      
      const result = await candidatesService.deleteCandidate(candidateId)
      
      if (result && typeof result === 'object') {
        alert(
          `Candidato eliminado exitosamente!\n\n` +
          `• Nombre: ${result.name}\n` +
          `• Email: ${result.email}\n` +
          `• Entradas eliminadas: ${result.deleted}\n\n` +
          `${(result.deleted || 0) > 1 ? 'Se eliminaron múltiples duplicados.' : ''}`
        )
      } else {
        alert('Candidato eliminado exitosamente')
      }
      
      // Redirigir a la lista de candidatos
      router.push('/candidates')
    } catch (error: any) {
      console.error('❌ Error deleting candidate:', error)
      alert('Error eliminando candidato: ' + error.message)
    }
  }

  const handleScheduleInterview = async () => {
    try {
      if (!scheduleData.date || !scheduleData.time || !scheduleData.assigneeId || !scheduleData.postulationId) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      setScheduleLoading(true)
      console.log('📅 Agendando entrevista:', scheduleData)

      // Obtener datos del candidato y entrevistador
      const selectedUser = users.find(user => user.id.toString() === scheduleData.assigneeId)
      const selectedPostulation = candidatePostulations.find(p => p.id.toString() === scheduleData.postulationId) ||
                                 applications.find(app => app.id.toString() === scheduleData.postulationId.replace('app-', ''))

      if (!selectedUser || !selectedPostulation) {
        alert('Error: No se encontró el usuario o postulación seleccionada')
        return
      }

      // Preparar datos para el servicio de Google Calendar
      const interviewData = {
        candidateName: candidate?.name || '',
        candidateEmail: candidate?.email || '',
        interviewerName: selectedUser.name || selectedUser.email,
        interviewerEmail: selectedUser.email,
        date: scheduleData.date,
        time: scheduleData.time,
        duration: scheduleData.duration,
        postulationTitle: selectedPostulation.title || selectedPostulation.applications?.title || 'Entrevista',
        notes: scheduleData.notes
      }

      // Usar el nuevo servicio de Google Calendar
      const result = await googleCalendarService.scheduleInterview(interviewData)

      if (result.success) {
        alert(`✅ Entrevista agendada exitosamente!\n\n📅 Evento creado en Google Calendar\n📧 Email enviado al candidato\n\n${result.eventUrl ? `Ver evento: ${result.eventUrl}` : ''}`)
        setShowScheduleModal(false)
        setScheduleData({
          date: '',
          time: '',
          duration: 60,
          postulationId: '',
          assigneeId: '',
          notes: ''
        })
      } else {
        alert(`❌ Error agendando entrevista: ${result.error}`)
      }
    } catch (error: any) {
      console.error('❌ Error scheduling interview:', error)
      alert('Error agendando entrevista: ' + error.message)
    } finally {
      setScheduleLoading(false)
    }
  }
      setScheduleLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      if (!emailData.subject || !emailData.message) {
        alert('Por favor completa el asunto y el mensaje')
        return
      }
      
      if (!emailData.selectedPostulation) {
        alert('Por favor selecciona una postulación')
        return
      }

      setEmailSending(true)
      console.log('📧 Enviando email:', emailData)
      
      // Usar el backend de Render
      const result = await sendEmail({
        to: candidate.email,
        subject: emailData.subject,
        message: emailData.message,
        selectedPostulation: emailData.selectedPostulation,
        createMeeting: emailData.createMeeting,
        meetingDate: emailData.meetingDate,
        meetingTime: emailData.meetingTime
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Error enviando email')
      }

      // Cerrar modal y resetear estado
      setShowEmailModal(false)
      setEmailData({
        subject: '',
        message: '',
        selectedPostulation: '',
        createMeeting: false,
        meetingDate: '',
        meetingTime: ''
      })
      
      // Forzar re-render del componente
      setForceUpdate(prev => prev + 1)
      console.log('✅ Email enviado, cerrando modal y forzando re-render')
      setTimeout(() => {
        alert('Email enviado exitosamente. La página se refrescará automáticamente.')
        // Refrescar la página después del alert
        window.location.reload()
      }, 100)
    } catch (error: any) {
      console.error('❌ Error sending email:', error)
      alert('Error enviando email: ' + error.message)
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-full bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Candidato no encontrado</h2>
              <p className="text-muted-foreground">El candidato que buscas no existe o ha sido eliminado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar entrevista
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEmailModal(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar email
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={handleDeleteCandidate}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar candidato
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={candidate.avatar || "/generic-user-avatar.png"} />
                <AvatarFallback className="text-lg">
                  {candidate.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-2xl font-bold">{candidate.name}</h1>
                  <Badge className={getStageColor(candidate.stage)}>
                    {candidate.stage}
                  </Badge>
                  {candidate.score && (
                    <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                      <Star className="h-5 w-5 fill-current" />
                      {candidate.score}/10
                    </div>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-4">{candidate.position}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="applications">Postulaciones</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
            <TabsTrigger value="attachments">Adjuntos</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                    <p>{candidate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <p>{candidate.phone}</p>
                    </div>
                  )}
                  {candidate.location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                      <p>{candidate.location}</p>
                    </div>
                  )}
                  {candidate.created_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de registro</label>
                      <p>{new Date(candidate.created_at).toLocaleDateString("es-ES")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Experiencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Posición actual</label>
                    <p>{candidate.position}</p>
                  </div>
                  {candidate.experience && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Años de experiencia</label>
                      <p>{candidate.experience}</p>
                    </div>
                  )}
                  {candidate.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                      <p className="text-sm">{candidate.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Postulaciones Vinculadas</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenDuplicateModal}
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vincular a otro proceso
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mostrar postulaciones desde tabla postulations (si existe) */}
                  {candidatePostulations.length > 0 ? (
                    candidatePostulations.map((postulation) => (
                      <div
                        key={`postulation-${postulation.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/postulations/${postulation.application_id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{postulation.applications?.title}</div>
                            <div className="text-sm text-muted-foreground">{postulation.applications?.area}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStageColor(postulation.stage)}>
                            {postulation.stage}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Score: {postulation.score || 0}/10
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Método tradicional: mostrar desde candidates */
                    applications
                      .filter(app => app.id === candidate.application_id)
                      .map((application) => (
                        <div
                          key={application.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/postulations/${application.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{application.title}</div>
                              <div className="text-sm text-muted-foreground">{application.area}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStageColor(candidate?.stage || 'pre-entrevista')}>
                              {candidate?.stage || 'Pre-entrevista'}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              Tradicional
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))
                  )}
                  
                  {/* Mensaje cuando no hay postulaciones */}
                  {candidatePostulations.length === 0 && 
                   applications.filter(app => app.id === candidate?.application_id).length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay postulaciones vinculadas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations" className="space-y-6">
            <EvaluationsTabContent candidateId={candidateId} />
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsTabContent candidateId={candidateId} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <TimelineTabContent candidateId={candidateId} />
          </TabsContent>
                 </Tabs>
       </div>

              {/* Modal para mover etapa */}
       {showMoveStage && candidate && (
         <MoveStageModal
           onClose={() => setShowMoveStage(false)}
           candidate={candidate}
           currentStage={candidate.stage}
           onStageChanged={handleStageChanged}
         />
       )}

       {/* Modal para editar perfil */}
       <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Editar Perfil del Candidato</DialogTitle>
             <DialogDescription>
               Modifica la información personal y profesional del candidato.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="edit-name">Nombre completo</Label>
                 <Input
                   id="edit-name"
                   value={editData.name}
                   onChange={(e) => setEditData({...editData, name: e.target.value})}
                   placeholder="Nombre del candidato"
                 />
               </div>
               <div>
                 <Label htmlFor="edit-email">Email</Label>
                 <Input
                   id="edit-email"
                   type="email"
                   value={editData.email}
                   onChange={(e) => setEditData({...editData, email: e.target.value})}
                   placeholder="email@ejemplo.com"
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="edit-phone">Teléfono</Label>
                 <Input
                   id="edit-phone"
                   value={editData.phone}
                   onChange={(e) => setEditData({...editData, phone: e.target.value})}
                   placeholder="+1 234 567 8900"
                 />
               </div>
               <div>
                 <Label htmlFor="edit-location">Ubicación</Label>
                 <Input
                   id="edit-location"
                   value={editData.location}
                   onChange={(e) => setEditData({...editData, location: e.target.value})}
                   placeholder="Ciudad, País"
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="edit-position">Posición actual</Label>
                 <Input
                   id="edit-position"
                   value={editData.position}
                   onChange={(e) => setEditData({...editData, position: e.target.value})}
                   placeholder="Cargo o posición"
                 />
               </div>
                                 <div>
                    <Label htmlFor="edit-experience">Años de experiencia</Label>
                    <Input
                      id="edit-experience"
                      type="text"
                      value={editData.experience}
                      onChange={(e) => setEditData({...editData, experience: e.target.value})}
                      placeholder="0"
                    />
                  </div>
             </div>

             <div className="flex justify-end space-x-2 pt-4">
               <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                 Cancelar
               </Button>
               <Button onClick={handleSaveProfile}>
                 Guardar Cambios
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal para duplicar candidato */}
       <DuplicateCandidateModal 
         isOpen={showDuplicateModal}
         onClose={() => setShowDuplicateModal(false)}
         onDuplicate={handleDuplicateCandidate}
         activeApplications={activeApplications}
         duplicateData={duplicateData}
         setDuplicateData={setDuplicateData}
         candidateName={candidate?.name || ''}
       />

       {/* Email Modal */}
       <Dialog 
         key={`email-modal-${forceUpdate}`}
         open={showEmailModal} 
         onOpenChange={(open) => {
           setShowEmailModal(open)
           if (!open) {
             setEmailSending(false)
             // Refrescar la página cuando se cierre el modal
             setTimeout(() => {
               window.location.reload()
             }, 200)
           }
         }}
       >
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Enviar Email al Candidato</DialogTitle>
             <DialogDescription>
               Envía un email personalizado a {candidate?.name} y opcionalmente crea una reunión de Google Meet.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             {/* Selector de postulación */}
             <div>
               <Label htmlFor="postulation-select">Postulación relacionada</Label>
               <Select 
                 value={emailData.selectedPostulation} 
                 onValueChange={(value) => setEmailData({...emailData, selectedPostulation: value})}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Selecciona la postulación relacionada" />
                 </SelectTrigger>
                                 <SelectContent>
                  {/* Mostrar postulaciones desde tabla postulations si existen */}
                  {candidatePostulations.length > 0 ? (
                    candidatePostulations.map((postulation) => (
                      <SelectItem key={postulation.id} value={postulation.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{postulation.applications?.title}</span>
                          <span className="text-sm text-muted-foreground">
                            Etapa: {postulation.stage} | Score: {postulation.score || 0}/10
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    /* Método alternativo: usar la aplicación del candidato */
                    applications
                      .filter(app => app.id === candidate?.application_id)
                      .map((application) => (
                        <SelectItem key={`app-${application.id}`} value={`candidate-${candidateId}`}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{application.title}</span>
                            <span className="text-sm text-muted-foreground">
                              Etapa: {candidate?.stage} | Score: {candidate?.score || 0}/10
                            </span>
                          </div>
                        </SelectItem>
                      ))
                  )}
                  {candidatePostulations.length === 0 && 
                   applications.filter(app => app.id === candidate?.application_id).length === 0 && (
                    <SelectItem value="no-postulations" disabled>
                      No hay postulaciones disponibles
                    </SelectItem>
                  )}
                </SelectContent>
               </Select>
             </div>

             {/* Asunto */}
             <div>
               <Label htmlFor="subject">Asunto</Label>
               <Input 
                 id="subject" 
                 value={emailData.subject} 
                 onChange={(e) => setEmailData({...emailData, subject: e.target.value})} 
                 placeholder="Asunto del email" 
               />
             </div>

             {/* Mensaje */}
             <div>
               <Label htmlFor="message">Mensaje</Label>
               <Textarea 
                 id="message" 
                 value={emailData.message} 
                 onChange={(e) => setEmailData({...emailData, message: e.target.value})} 
                 placeholder="Escribe tu mensaje aquí..." 
                 rows={6} 
               />
             </div>

             {/* Opción para crear reunión */}
             <div className="flex items-center space-x-2">
               <input 
                 type="checkbox" 
                 id="create-meeting" 
                 checked={emailData.createMeeting} 
                 onChange={(e) => setEmailData({...emailData, createMeeting: e.target.checked})} 
                 className="rounded" 
               />
               <Label htmlFor="create-meeting">Crear reunión de Google Meet</Label>
             </div>

             {/* Campos de fecha y hora para la reunión */}
             {emailData.createMeeting && (
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="meeting-date">Fecha de la reunión</Label>
                   <Input 
                     id="meeting-date" 
                     type="date" 
                     value={emailData.meetingDate} 
                     onChange={(e) => setEmailData({...emailData, meetingDate: e.target.value})} 
                     min={new Date().toISOString().split('T')[0]} 
                   />
                 </div>
                 <div>
                   <Label htmlFor="meeting-time">Hora de la reunión</Label>
                   <Input 
                     id="meeting-time" 
                     type="time" 
                     value={emailData.meetingTime} 
                     onChange={(e) => setEmailData({...emailData, meetingTime: e.target.value})} 
                   />
                 </div>
               </div>
             )}

             {/* Información del candidato */}
             <div className="bg-blue-50 p-4 rounded-lg">
               <h4 className="font-medium text-blue-900 mb-2">📧 Información del destinatario</h4>
               <ul className="text-sm text-blue-800 space-y-1">
                 <li><strong>Nombre:</strong> {candidate?.name}</li>
                 <li><strong>Email:</strong> {candidate?.email}</li>
                 <li><strong>Teléfono:</strong> {candidate?.phone || 'No disponible'}</li>
                 <li><strong>Postulaciones activas:</strong> {candidatePostulations.length > 0 ? candidatePostulations.length : (applications.filter(app => app.id === candidate?.application_id).length)}</li>
               </ul>
             </div>

             {/* Botones */}
             <div className="flex justify-end space-x-2">
               <Button 
                 variant="outline" 
                 onClick={() => {
                   setShowEmailModal(false)
                   setEmailSending(false)
                   // Refrescar la página cuando se cancele
                   setTimeout(() => {
                     window.location.reload()
                   }, 200)
                 }}
                 disabled={emailSending}
               >
                 Cancelar
               </Button>
               <Button 
                 onClick={handleSendEmail} 
                 disabled={!emailData.subject || !emailData.message || !emailData.selectedPostulation || emailSending}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                 {emailSending ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     {emailData.createMeeting ? 'Enviando email y creando reunión...' : 'Enviando email...'}
                   </>
                 ) : (
                   <>
                     <Mail className="h-4 w-4 mr-2" />
                     Enviar Email
                   </>
                 )}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal de Agendar Entrevista */}
       <Dialog 
         key={`schedule-modal-${forceUpdate}`}
         open={showScheduleModal} 
         onOpenChange={(open) => {
           setShowScheduleModal(open)
           if (!open) {
             // Refrescar la página cuando se cierre el modal
             setTimeout(() => {
               window.location.reload()
             }, 200)
           }
         }}
       >
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Agendar Entrevista</DialogTitle>
             <DialogDescription>
               Agenda una entrevista para {candidate?.name} y crea automáticamente un evento en Google Calendar.
             </DialogDescription>
           </DialogHeader>

           <div className="space-y-4">
             {/* Fecha */}
             <div>
               <Label htmlFor="interview-date">Fecha de la entrevista</Label>
               <Input
                 id="interview-date"
                 type="date"
                 value={scheduleData.date}
                 onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                 min={new Date().toISOString().split('T')[0]}
               />
             </div>

             {/* Hora */}
             <div>
               <Label htmlFor="interview-time">Hora de la entrevista</Label>
               <Input
                 id="interview-time"
                 type="time"
                 value={scheduleData.time}
                 onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
               />
             </div>

             {/* Duración */}
             <div>
               <Label htmlFor="interview-duration">Duración (minutos)</Label>
               <Select value={scheduleData.duration.toString()} onValueChange={(value) => setScheduleData(prev => ({ ...prev, duration: parseInt(value) }))}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="30">30 minutos</SelectItem>
                   <SelectItem value="45">45 minutos</SelectItem>
                   <SelectItem value="60">1 hora</SelectItem>
                   <SelectItem value="90">1.5 horas</SelectItem>
                   <SelectItem value="120">2 horas</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             {/* Postulación */}
             <div>
               <Label htmlFor="interview-postulation">Postulación</Label>
               <Select value={scheduleData.postulationId} onValueChange={(value) => setScheduleData(prev => ({ ...prev, postulationId: value }))}>
                 <SelectTrigger>
                   <SelectValue placeholder="Selecciona la postulación" />
                 </SelectTrigger>
                 <SelectContent>
                   {/* Mostrar postulaciones desde tabla postulations si existen */}
                   {candidatePostulations.length > 0 ? (
                     candidatePostulations.map((postulation) => (
                       <SelectItem key={postulation.id} value={postulation.id.toString()}>
                         <div className="flex flex-col items-start">
                           <span className="font-medium">{postulation.applications?.title}</span>
                           <span className="text-sm text-muted-foreground">
                             Etapa: {postulation.stage} | Score: {postulation.score || 0}/10
                           </span>
                         </div>
                       </SelectItem>
                     ))
                   ) : (
                     /* Método alternativo: usar la aplicación del candidato */
                     applications
                       .filter(app => app.id === candidate?.application_id)
                       .map((application) => (
                         <SelectItem key={`app-${application.id}`} value={`app-${application.id}`}>
                           <div className="flex flex-col items-start">
                             <span className="font-medium">{application.title}</span>
                             <span className="text-sm text-muted-foreground">
                               Etapa: {candidate?.stage} | Score: {candidate?.score || 0}/10
                             </span>
                           </div>
                         </SelectItem>
                       ))
                   )}
                   {candidatePostulations.length === 0 && 
                    applications.filter(app => app.id === candidate?.application_id).length === 0 && (
                     <SelectItem value="no-postulations" disabled>
                       No hay postulaciones disponibles
                     </SelectItem>
                   )}
                 </SelectContent>
               </Select>
             </div>

             {/* Responsable */}
             <div>
               <Label htmlFor="interview-assignee">Responsable de la entrevista</Label>
               <Select value={scheduleData.assigneeId} onValueChange={(value) => setScheduleData(prev => ({ ...prev, assigneeId: value }))}>
                 <SelectTrigger>
                   <SelectValue placeholder="Selecciona un responsable" />
                 </SelectTrigger>
                 <SelectContent>
                   {users.map((user) => (
                     <SelectItem key={user.id} value={user.id.toString()}>
                       {user.name} ({user.email})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Notas */}
             <div>
               <Label htmlFor="interview-notes">Notas adicionales (opcional)</Label>
               <Textarea
                 id="interview-notes"
                 placeholder="Agrega notas sobre la entrevista..."
                 value={scheduleData.notes}
                 onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                 rows={3}
               />
             </div>

             {/* Información del candidato */}
             <div className="bg-muted p-4 rounded-lg">
               <h4 className="font-medium mb-2">Información del candidato</h4>
               <ul className="text-sm space-y-1">
                 <li><strong>Nombre:</strong> {candidate?.name}</li>
                 <li><strong>Email:</strong> {candidate?.email}</li>
                 <li><strong>Teléfono:</strong> {candidate?.phone}</li>
                 <li><strong>Postulación:</strong> {applications.find(app => app.id === candidate?.application_id)?.title}</li>
               </ul>
             </div>

             {/* Botones */}
             <div className="flex justify-end space-x-2">
               <Button 
                 variant="outline" 
                 onClick={() => {
                   setShowScheduleModal(false)
                   // Refrescar la página cuando se cancele
                   setTimeout(() => {
                     window.location.reload()
                   }, 200)
                 }}
                 disabled={scheduleLoading}
               >
                 Cancelar
               </Button>
               <Button 
                 onClick={handleScheduleInterview} 
                 disabled={!scheduleData.date || !scheduleData.time || !scheduleData.assigneeId || !scheduleData.postulationId || scheduleLoading}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                 {scheduleLoading ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Agendando entrevista...
                   </>
                 ) : (
                   <>
                     <Calendar className="h-4 w-4 mr-2" />
                     Agendar Entrevista
                   </>
                 )}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   )
 }

// Modal para duplicar candidato
function DuplicateCandidateModal({ 
  isOpen, 
  onClose, 
  onDuplicate, 
  activeApplications, 
  duplicateData, 
  setDuplicateData,
  candidateName 
}: {
  isOpen: boolean
  onClose: () => void
  onDuplicate: () => void
  activeApplications: any[]
  duplicateData: any
  setDuplicateData: (data: any) => void
  candidateName: string
}) {
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const users = await duplicateService.getAvailableUsers()
      setAvailableUsers(users)
    } catch (error) {
      console.error('❌ Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const stages = [
    { value: 'pre-entrevista', label: 'Pre-entrevista' },
    { value: 'primera', label: '1ª Entrevista' },
    { value: 'segunda', label: '2ª Entrevista' },
    { value: 'fit-cultural', label: 'Fit Cultural' },
    { value: 'seleccionado', label: 'Seleccionado' },
    { value: 'descartado', label: 'Descartado' },
    { value: 'stand-by', label: 'Stand-by' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vincular Candidato a Otro Proceso</DialogTitle>
          <DialogDescription>
            Vincular a <strong>{candidateName}</strong> a un proceso de postulación adicional. 
            El mismo candidato aparecerá en múltiples procesos. Selecciona el proceso destino, la etapa inicial y el responsable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Selector de proceso */}
          <div>
            <Label htmlFor="application-select">Proceso de postulación</Label>
            <Select 
              value={duplicateData.applicationId} 
              onValueChange={(value) => setDuplicateData({...duplicateData, applicationId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proceso activo" />
              </SelectTrigger>
              <SelectContent>
                {activeApplications.map((app) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{app.title}</span>
                      <span className="text-sm text-muted-foreground">{app.area}</span>
                    </div>
                  </SelectItem>
                ))}
                {activeApplications.length === 0 && (
                  <SelectItem value="no-apps" disabled>
                    No hay procesos activos disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de etapa */}
          <div>
            <Label htmlFor="stage-select">Etapa inicial</Label>
            <Select 
              value={duplicateData.stage} 
              onValueChange={(value) => setDuplicateData({...duplicateData, stage: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la etapa inicial" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de responsable */}
          <div>
            <Label htmlFor="assignee-select">Responsable del proceso</Label>
            <Select 
              value={duplicateData.assigneeId} 
              onValueChange={(value) => setDuplicateData({...duplicateData, assigneeId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un responsable" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.name || user.email}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
                {loading && (
                  <SelectItem value="loading" disabled>
                    Cargando usuarios...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Información del candidato */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🔗 Resumen de vinculación</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Candidato:</strong> {candidateName}</li>
              <li><strong>Proceso destino:</strong> {
                activeApplications.find(app => app.id.toString() === duplicateData.applicationId)?.title || 'Sin seleccionar'
              }</li>
              <li><strong>Etapa inicial:</strong> {
                stages.find(stage => stage.value === duplicateData.stage)?.label || 'Pre-entrevista'
              }</li>
              <li><strong>Responsable:</strong> {
                availableUsers.find(user => user.id === duplicateData.assigneeId)?.name ||
                availableUsers.find(user => user.id === duplicateData.assigneeId)?.email ||
                'Sin seleccionar'
              }</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={onDuplicate}
              disabled={!duplicateData.applicationId || !duplicateData.assigneeId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Vincular Candidato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
 }
