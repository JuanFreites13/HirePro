"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { storageService, type FileUpload } from '@/lib/storage-service'

interface FileUploadProps {
  candidateId: number
  type: 'document' | 'avatar'
  onUploadComplete?: (file: any) => void
  onUploadError?: (error: string) => void
}

export function FileUpload({ candidateId, type, onUploadComplete, onUploadError }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      // Validar archivo
      const validation = storageService.validateFile(file, type)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Subir archivo
      const result = await storageService.uploadFile({
        file,
        candidateId,
        type
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result) {
        onUploadComplete?.(result)
        setTimeout(() => setProgress(0), 1000)
      } else {
        throw new Error('Error al subir el archivo')
      }

    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo')
      onUploadError?.(err.message)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }, [candidateId, type, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: type === 'avatar' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }
      : { 
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'text/plain': ['.txt'],
          'application/zip': ['.zip'],
          'application/x-zip-compressed': ['.zip']
        },
    multiple: false,
    disabled: uploading
  })

  const getUploadText = () => {
    if (uploading) return 'Subiendo archivo...'
    if (isDragActive) return 'Suelta el archivo aquí'
    if (isDragReject) return 'Tipo de archivo no permitido'
    
    return type === 'avatar' 
      ? 'Arrastra una imagen aquí o haz clic para seleccionar'
      : 'Arrastra un documento aquí o haz clic para seleccionar'
  }

  const getFileTypeText = () => {
    return type === 'avatar'
      ? 'Imágenes: JPG, PNG, GIF, WebP (máx. 5MB)'
      : 'Documentos: PDF, DOC, DOCX, TXT, ZIP (máx. 10MB)'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir {type === 'avatar' ? 'Avatar' : 'Documento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">


        {/* Área de drop */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400' : ''}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <File className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm font-medium">{getUploadText()}</p>
            <p className="text-xs text-gray-500">{getFileTypeText()}</p>
          </div>
        </div>

        {/* Progreso */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subiendo archivo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Botón manual */}
        <Button
          onClick={() => document.querySelector('input[type="file"]')?.click()}
          disabled={uploading}
          className="w-full"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Seleccionar archivo
        </Button>
      </CardContent>
    </Card>
  )
}
