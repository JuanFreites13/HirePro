'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Upload, File, Calendar, User, Plus } from 'lucide-react'
import { candidatesService } from '@/lib/supabase-service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Attachment {
  id: number
  file_name: string
  file_type: string
  file_url: string
  file_size: number
  created_at: string
  uploaded_by?: string
}

export default function CandidateAttachmentsPage({ params }: { params: { id: string } }) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState('cv')

  useEffect(() => {
    loadAttachments()
  }, [params.id])

  const loadAttachments = async () => {
    try {
      const data = await candidatesService.getCandidateAttachments(parseInt(params.id))
      setAttachments(data)
    } catch (error) {
      console.error('Error loading attachments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Subir archivo a Supabase Storage
      const timestamp = Date.now()
      const path = `candidates/${params.id}/${fileType}/${timestamp}_${selectedFile.name}`
      const fileUrl = await candidatesService.uploadFile(selectedFile, 'candidate-files', path)

      if (fileUrl) {
        // Crear registro en la base de datos
        await candidatesService.createCandidateAttachment({
          candidate_id: parseInt(params.id),
          file_name: selectedFile.name,
          file_type: fileType,
          file_url: fileUrl,
          file_size: selectedFile.size
        })

        setShowUploadDialog(false)
        setSelectedFile(null)
        setFileType('cv')
        loadAttachments()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (attachment: Attachment) => {
            if (attachment.file_url.startsWith('mock://')) {
          // Para archivos no disponibles, mostrar mensaje
      alert('Este es un archivo de prueba. En producción, se descargaría el archivo real.')
    } else {
      // Para archivos reales, abrir en nueva pestaña
      window.open(attachment.file_url, '_blank')
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'cv': return '📄'
      case 'video': return '🎥'
      case 'document': return '📋'
      case 'image': return '🖼️'
      default: return '📎'
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'cv': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'document': return 'bg-green-100 text-green-800'
      case 'image': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando archivos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Archivos Adjuntos</h1>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Nuevo Archivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file_type">Tipo de Archivo</Label>
                <Select value={fileType} onValueChange={setFileType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cv">CV</SelectItem>
                    <SelectItem value="video">Video de Entrevista</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">Seleccionar Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png"
                />
              </div>

              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Subiendo...' : 'Subir Archivo'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-12">
          <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay archivos adjuntos
          </h3>
          <p className="text-muted-foreground">
            Comienza subiendo el primer archivo del candidato.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {attachments.map((attachment) => (
            <Card key={attachment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileTypeIcon(attachment.file_type)}</span>
                    <div>
                      <h3 className="font-medium">{attachment.file_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getFileTypeColor(attachment.file_type)}>
                          {attachment.file_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                  </div>
                  {attachment.uploaded_by && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{attachment.uploaded_by}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

