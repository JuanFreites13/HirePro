"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  MoreHorizontal, 
  Filter,
  Search,
  List,
  Grid3X3,
  Kanban
} from "lucide-react"
import { candidatesService } from "@/lib/supabase-service"
import { LoadingSpinner, HoverCard, FocusCard } from "@/components/ui/accessibility"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CandidatesViewProps {
  searchTerm?: string
}

interface Candidate {
  id: number
  name: string
  email: string
  position: string
  stage: string
  score: number | null
  avatar: string
  location: string
  experience: string
  applied_at: string
  application_id: number
}

const stages = [
  { id: "pre-entrevista", name: "Pre-entrevista", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { id: "primera", name: "1ª Entrevista", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { id: "segunda", name: "2ª Entrevista", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { id: "fit-cultural", name: "Fit Cultural", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { id: "seleccionado", name: "Seleccionado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { id: "descartado", name: "Descartado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { id: "stand-by", name: "Stand by", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
]

type ViewMode = 'list' | 'cards' | 'kanban'

export function CandidatesView({ searchTerm = "" }: CandidatesViewProps) {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [stageFilter, setStageFilter] = useState<string>("")

  useEffect(() => {
    loadCandidates()
  }, [])

  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const data = await candidatesService.getAllCandidates()
      setCandidates(data)
    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      localSearchTerm === "" ||
      candidate.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(localSearchTerm.toLowerCase())

    const matchesStage = stageFilter === "" || candidate.stage === stageFilter

    return matchesSearch && matchesStage
  })

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage)
    return stageConfig?.color || "bg-gray-100 text-gray-800"
  }

  const getStageName = (stage: string) => {
    const stageConfig = stages.find(s => s.id === stage)
    return stageConfig?.name || stage
  }

  const renderListView = () => (
    <div className="space-y-3">
      {filteredCandidates.map((candidate) => (
        <HoverCard key={candidate.id}>
          <FocusCard>
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {candidate.position}
                        </Badge>
                        <Badge className={getStageColor(candidate.stage)}>
                          {getStageName(candidate.stage)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {candidate.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{candidate.score}/10</span>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/candidates/${candidate.id}`)}>
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>Agendar entrevista</DropdownMenuItem>
                        <DropdownMenuItem>Enviar email</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FocusCard>
        </HoverCard>
      ))}
    </div>
  )

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCandidates.map((candidate) => (
        <HoverCard key={candidate.id}>
          <FocusCard>
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback>
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => router.push(`/candidates/${candidate.id}`)}>
                        Ver perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>Agendar entrevista</DropdownMenuItem>
                      <DropdownMenuItem>Enviar email</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{candidate.email}</span>
                  </div>
                  
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(candidate.applied_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge className={getStageColor(candidate.stage)}>
                      {getStageName(candidate.stage)}
                    </Badge>
                    {candidate.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{candidate.score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FocusCard>
        </HoverCard>
      ))}
    </div>
  )

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 overflow-x-auto">
      {stages.map((stage) => {
        const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id)
        
        return (
          <div key={stage.id} className="min-w-[280px]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge className={stage.color}>
                    {stage.name}
                  </Badge>
                  <span className="text-muted-foreground">
                    ({stageCandidates.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {stageCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-card border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-medium line-clamp-1">
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {candidate.position}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {candidate.score && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{candidate.score}/10</span>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{candidate.location}</span>
                          </div>
                        )}
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
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="default" />
        <span className="ml-2">Cargando candidatos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidatos</h1>
          <p className="text-muted-foreground">Gestiona todos los candidatos y sus postulaciones</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => !['seleccionado', 'descartado'].includes(c.stage)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seleccionados</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.stage === 'seleccionado').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Puntaje</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.score).length > 0
                ? Math.round(candidates.filter(c => c.score).reduce((sum, c) => sum + (c.score || 0), 0) / candidates.filter(c => c.score).length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar candidatos..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-1" />
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Tarjetas
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className="h-8 px-3"
                >
                  <Kanban className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por etapa:
              </span>
              <Button
                variant={stageFilter === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setStageFilter("")}
                className="text-xs"
              >
                Todas
              </Button>
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={stageFilter === stage.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStageFilter(stageFilter === stage.id ? "" : stage.id)}
                  className="text-xs"
                >
                  {stage.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
            <p className="text-muted-foreground">
              {localSearchTerm || stageFilter
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando candidatos a las postulaciones"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {viewMode === 'list' && renderListView()}
          {viewMode === 'cards' && renderCardsView()}
          {viewMode === 'kanban' && renderKanbanView()}
        </div>
      )}
    </div>
  )
}
