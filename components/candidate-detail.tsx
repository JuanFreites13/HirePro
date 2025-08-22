"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  MessageSquare,
  Star,
  ChevronRight,
  ChevronLeft,
  Upload,
  Download,
  User,
  Clock,
  Plus,
} from "lucide-react"
import { NewCandidateModal } from "./new-candidate-modal"
import { CandidateFilesSection } from "./candidate-files-section"

interface CandidateDetailProps {
  candidateId: number
  onBack: () => void
}



export function CandidateDetail({ candidateId, onBack }: CandidateDetailProps) {
  const [newNote, setNewNote] = useState("")
  const [newScore, setNewScore] = useState("")
  const [selectedStage, setSelectedStage] = useState("Pre-entrevista")
  const [showNewCandidate, setShowNewCandidate] = useState(false) // Estado para modal nuevo candidato

  const handleAdvanceStage = () => {
    console.log("Advancing to next stage")
  }

  const handleRejectCandidate = () => {
    console.log("Rejecting candidate")
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log("Adding note:", newNote)
      setNewNote("")
      setNewScore("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-semibold">Detalle del Candidato</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => {
                  // Cambiar a la pestaña de archivos y abrir subida
                  const tabsList = document.querySelector('[role="tablist"]') as HTMLElement
                  const attachmentsTab = tabsList?.querySelector('[data-value="attachments"]') as HTMLElement
                  attachmentsTab?.click()
                  // También cambiar a la subpestaña de subida
                  setTimeout(() => {
                    const uploadTab = document.querySelector('[data-value="upload"]') as HTMLElement
                    uploadTab?.click()
                  }, 100)
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
              <Button
                onClick={() => setShowNewCandidate(true)}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo postulante
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Candidate Profile */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      CA
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">Candidato</h2>
                  <p className="text-gray-600 mb-4">Posición</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      candidato@email.com
                    </div>
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      +56 9 1234 5678
                    </div>
                    <div className="flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      Santiago, Chile
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Pretensión salarial:</span>
                  <p className="font-medium">$2.000.000 - $3.000.000</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Experiencia:</span>
                  <p className="font-medium">3 años</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Etapa actual:</span>
                  <Badge variant="outline" className="ml-2">
                    Pre-entrevista
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Archivos:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      0 documentos
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      0 notas
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Archivos Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center text-gray-500 py-4">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No hay archivos disponibles</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      // Cambiar a la pestaña de archivos
                      const tabsList = document.querySelector('[role="tablist"]') as HTMLElement
                      const attachmentsTab = tabsList?.querySelector('[data-value="attachments"]') as HTMLElement
                      attachmentsTab?.click()
                    }}
                  >
                    Ver todos los archivos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleAdvanceStage} className="w-full bg-purple-600 hover:bg-purple-700">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Avanzar Etapa
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Retroceder Etapa
                </Button>
                <Button variant="destructive" onClick={handleRejectCandidate} className="w-full">
                  Descartar Candidato
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
                <TabsTrigger value="attachments">Archivos</TabsTrigger>
                <TabsTrigger value="communication">Comunicación</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso del Proceso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                    { stage: "Pre-entrevista", status: "completed", date: "2024-01-10" },
                    { stage: "Primera etapa", status: "current", date: "2024-01-12" },
                    { stage: "Segunda etapa", status: "pending", date: null },
                    { stage: "Fit cultural", status: "pending", date: null },
                    { stage: "Seleccionado", status: "pending", date: null },
                  ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              item.status === "completed"
                                ? "bg-green-500"
                                : item.status === "current"
                                  ? "bg-purple-500"
                                  : "bg-gray-300"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${item.status === "current" ? "text-purple-600" : ""}`}>
                              {item.stage}
                            </h4>
                            {item.date && <p className="text-sm text-gray-600">{item.date}</p>}
                          </div>
                          {item.status === "current" && (
                            <Badge variant="default" className="bg-purple-100 text-purple-800">
                              Actual
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <div className="space-y-6">
                  {/* Add New Note */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Agregar Nota</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={selectedStage} onValueChange={setSelectedStage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar etapa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pre-entrevista">Pre-entrevista</SelectItem>
                          <SelectItem value="Primera etapa">Primera etapa</SelectItem>
                          <SelectItem value="Segunda etapa">Segunda etapa</SelectItem>
                          <SelectItem value="Fit cultural">Fit cultural</SelectItem>
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="Escribe tus observaciones..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />

                      <div className="flex items-center space-x-4">
                        <Select value={newScore} onValueChange={setNewScore}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Puntaje" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score.toFixed(1)}/7
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button onClick={handleAddNote} className="bg-purple-600 hover:bg-purple-700">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Agregar Nota
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Existing Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                    {
                      id: 1,
                      author: "Admin",
                      stage: "Pre-entrevista",
                      content: "Candidato con perfil técnico adecuado.",
                      score: 7.0,
                      date: "2024-01-10",
                    },
                    {
                      id: 2,
                      author: "Admin",
                      stage: "Primera etapa",
                      content: "Buenas habilidades de comunicación.",
                      score: 7.5,
                      date: "2024-01-12",
                    },
                  ].map((note) => (
                          <div key={note.id} className="border-l-4 border-purple-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{note.author}</span>
                                <Badge variant="outline">{note.stage}</Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                  <span className="font-medium">{note.score.toFixed(1)}/7</span>
                                </div>
                                <span className="text-sm text-gray-500">{note.date}</span>
                              </div>
                            </div>
                            <p className="text-gray-700">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments">
                <CandidateFilesSection
                  candidateId={candidateId}
                  candidateName="Candidato"
                />
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle>Comunicación con el Candidato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Último mensaje enviado</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          "Hola María, hemos revisado tu perfil y nos gustaría agendar una entrevista técnica..."
                        </p>
                        <p className="text-xs text-blue-600 mt-2">Enviado el 12 de enero, 2024</p>
                      </div>

                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showNewCandidate && <NewCandidateModal onClose={() => setShowNewCandidate(false)} />}
    </div>
  )
}
