"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  File, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image, 
  Archive,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { storageService, type StoredFile } from '@/lib/storage-service'

interface FileListProps {
  candidateId: number
  onFileDeleted?: (fileId: string) => void
}

export function FileList({ candidateId, onFileDeleted }: FileListProps) {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [candidateId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const fileList = await storageService.getCandidateFiles(candidateId)
      setFiles(fileList)
    } catch (err: any) {
      setError(err.message || 'Error al cargar archivos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      return
    }

    try {
      setDeletingFile(fileId)
      const success = await storageService.deleteFile(parseInt(fileId))
      
      if (success) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        onFileDeleted?.(fileId)
      } else {
        throw new Error('Error al eliminar el archivo')
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el archivo')
    } finally {
      setDeletingFile(null)
    }
  }

  const handleDownload = (file: StoredFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-4 w-4" />
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (fileType.includes('zip') || fileType.includes('compressed')) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('image')) return 'bg-green-100 text-green-800'
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800'
    if (fileType.includes('word')) return 'bg-blue-100 text-blue-800'
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Archivos del Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando archivos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Archivos del Candidato ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay archivos subidos para este candidato</p>
            <p className="text-sm">Sube documentos, CVs o imágenes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{file.name}</p>
                      <Badge variant="secondary" className={getFileTypeColor(file.type)}>
                        {file.type.split('/')[1]?.toUpperCase() || 'ARCHIVO'}
                      </Badge>
                    </div>
                    
                                         <div className="flex items-center gap-4 text-sm text-gray-500">
                       <span>{storageService.formatFileSize(file.size)}</span>
                       <span>{new Date(file.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    title="Ver archivo"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    title="Descargar archivo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingFile === file.id}
                    title="Eliminar archivo"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
