"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from './file-upload'
import { FileList } from './file-list'
import { File, Upload } from 'lucide-react'

interface CandidateFilesSectionProps {
  candidateId: number
  candidateName: string
}

export function CandidateFilesSection({ candidateId, candidateName }: CandidateFilesSectionProps) {
  const [activeTab, setActiveTab] = useState('files')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    // Refrescar la lista de archivos
    setRefreshKey(prev => prev + 1)
  }

  const handleFileDeleted = () => {
    // Refrescar la lista de archivos
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Archivos de {candidateName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Ver Archivos
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Archivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-6">
            <FileList 
              key={refreshKey}
              candidateId={candidateId} 
              onFileDeleted={handleFileDeleted}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Subir Documento</h3>
                <FileUpload
                  candidateId={candidateId}
                  type="document"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={(error) => console.error('Error:', error)}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Subir Avatar</h3>
                <FileUpload
                  candidateId={candidateId}
                  type="avatar"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={(error) => console.error('Error:', error)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}



