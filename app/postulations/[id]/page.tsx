"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  Users, 
  Edit, 
  Archive, 
  Trash2,
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Kanban,
  List
} from "lucide-react"
import { useState, useEffect } from "react"
import { applicationsService, candidatesService } from "@/lib/supabase-service"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewCandidateModal } from "@/components/new-candidate-modal"
import { PipelineView } from "@/components/pipeline-view"

const stages = [
  { id: "pre-entrevista", name: "Pre-entrevista", color: "bg-blue-100 text-blue-800" },
  { id: "primera", name: "1ª Entrevista", color: "bg-yellow-100 text-yellow-800" },
  { id: "segunda", name: "2ª Entrevista", color: "bg-orange-100 text-orange-800" },
  { id: "fit-cultural", name: "Fit Cultural", color: "bg-purple-100 text-purple-800" },
  { id: "seleccionado", name: "Seleccionado", color: "bg-green-100 text-green-800" },
  { id: "descartado", name: "Descartado", color: "bg-red-100 text-red-800" },
  { id: "stand-by", name: "Stand by", color: "bg-gray-100 text-gray-800" },
]

export default function PostulationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postulationId = Number(params.id)
  const [postulation, setPostulation] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [showNewCandidate, setShowNewCandidate] = useState(false)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    area: '',
    status: ''
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [postulationData, candidatesData] = await Promise.all([
          applicationsService.getApplicationById(postulationId),
          candidatesService.getCandidatesByApplication(postulationId)
        ])
        setPostulation(postulationData)
        setCandidates(candidatesData)
        setNewStatus(postulationData?.status || "")
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (postulationId) {
      loadData()
    }
  }, [postulationId])

  const handleStatusUpdate = async () => {
    if (!postulation || !newStatus) return
    
    try {
      const updatedPostulation = await applicationsService.updateApplication(postulation.id, {
        status: newStatus as "Activa" | "Pausada" | "Cerrada"
      })
      if (updatedPostulation) {
        setPostulation(updatedPostulation)
        setEditingStatus(false)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleEditPostulation = () => {
    if (!postulation) return
    
    setEditData({
      title: postulation.title || '',
      description: postulation.description || '',
      area: postulation.area || '',
      status: postulation.status || ''
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!postulation) return
    
    try {
      const updatedPostulation = await applicationsService.updateApplication(postulation.id, {
        title: editData.title,
        description: editData.description,
        area: editData.area,
        status: editData.status as "Activa" | "Pausada" | "Cerrada",
        updated_at: new Date().toISOString()
      })
      
      if (updatedPostulation) {
        setPostulation(updatedPostulation)
        setShowEditModal(false)
        alert('Postulación actualizada exitosamente')
      }
    } catch (error) {
      console.error('Error updating postulation:', error)
      alert('Error actualizando la postulación')
    }
  }

  const handleArchivePostulation = async () => {
    if (!postulation) return
    
    const confirmArchive = confirm(`¿Estás seguro de que quieres archivar "${postulation.title}"?`)
    if (!confirmArchive) return
    
    try {
      const result = await applicationsService.archiveApplication(postulation.id)
      if (result) {
        setPostulation(result)
        alert('Postulación archivada exitosamente')
      }
    } catch (error) {
      console.error('Error archiving postulation:', error)
      alert('Error archivando la postulación')
    }
  }

  const handleDeletePostulation = async () => {
    if (!postulation) return
    
    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar permanentemente "${postulation.title}"?\n\nEsta acción no se puede deshacer y eliminará toda la información asociada.`
    )
    if (!confirmDelete) return
    
    try {
      await applicationsService.deleteApplication(postulation.id)
      alert('Postulación eliminada exitosamente')
      router.push('/postulations')
    } catch (error: any) {
      console.error('Error deleting postulation:', error)
      alert(`Error eliminando la postulación: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Cerrada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Pausada":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage.toLowerCase().replace(/\s+/g, '-'))
    return stageConfig?.color || "bg-gray-100 text-gray-800"
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

  if (!postulation) {
    return (
      <div className="min-h-full bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Postulación no encontrada</h2>
              <p className="text-muted-foreground">La postulación que buscas no existe o ha sido eliminada.</p>
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
            <Button variant="outline" size="sm" onClick={handleEditPostulation}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchivePostulation}>
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDeletePostulation}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Postulation Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{postulation.title}</CardTitle>
                <p className="text-muted-foreground mt-1">{postulation.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {editingStatus ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-32"
                      placeholder="Estado"
                    />
                    <Button size="sm" onClick={handleStatusUpdate}>✓</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingStatus(false)}>✕</Button>
                  </div>
                ) : (
                  <Badge 
                    className={`${getStatusColor(postulation.status)} cursor-pointer`}
                    onClick={() => setEditingStatus(true)}
                  >
                    {postulation.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{postulation.area || "Sin área"}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Responsable: {postulation.users?.name || "Sin asignar"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Creada el {new Date(postulation.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidatos ({candidates.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('pipeline')}
                    className="h-8 px-3"
                  >
                    <Kanban className="h-4 w-4 mr-1" />
                    Pipeline
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4 mr-1" />
                    Lista
                  </Button>
                </div>
                <Button size="sm" onClick={() => setShowNewCandidate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Candidato
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'pipeline' ? (
              <PipelineView applicationId={postulationId} />
            ) : (
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/candidates/${candidate.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStageColor(candidate.stage)}>
                        {candidate.stage}
                      </Badge>
                      {candidate.score && (
                        <div className="text-sm font-medium text-primary">
                          {candidate.score}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>



        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium">Postulación creada</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(postulation.created_at).toLocaleDateString("es-ES")} - {postulation.users?.name || "Sistema"}
                  </div>
                </div>
              </div>
              {candidates.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-medium">{candidates.length} candidatos agregados</div>
                    <div className="text-sm text-muted-foreground">
                      Última actualización: {new Date().toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para nuevo candidato */}
      {showNewCandidate && (
        <NewCandidateModal onClose={() => setShowNewCandidate(false)} />
      )}

      {/* Modal para editar postulación */}
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Postulación</DialogTitle>
              <DialogDescription>
                Modifica los datos de la postulación
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la postulación"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la postulación"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-area">Área</Label>
                  <Input
                    id="edit-area"
                    value={editData.area}
                    onChange={(e) => setEditData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="Área o departamento"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Cerrada">Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
