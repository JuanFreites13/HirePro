"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  List,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
} from "lucide-react"
import { CandidateDetail } from "./candidate-detail"
import { NewApplicationModal } from "./new-application-modal"
import { NewCandidateModal } from "./new-candidate-modal"
import { ProfileMenu } from "./profile-menu"
import { ListView } from "./list-view"
import { CardsView } from "./cards-view"
import { KanbanView } from "./kanban-view"
import { useAuth } from "./auth-provider"
import { candidatesService, applicationsService } from "@/lib/supabase-service"
import type { Page } from "./main-app"



const stages = [
  "Pre-entrevista",
  "Primera etapa",
  "Segunda etapa",
  "Fit cultural",
  "Seleccionado",
  "Descartado",
  "Stand by",
]



interface DashboardProps {
  onNavigate: (page: Page) => void
  selectedPostulation?: number | null
  onBackToPostulations?: () => void
}

export function Dashboard({ onNavigate, selectedPostulation, onBackToPostulations }: DashboardProps) {
  const { user } = useAuth()
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [showNewApplication, setShowNewApplication] = useState(false)
  const [showNewCandidate, setShowNewCandidate] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [stageFilters, setStageFilters] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "cards" | "kanban">("list")
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeProcesses: 0,
    scheduledInterviews: 0,
    stalled: 0
  })

  const postulationCandidates = selectedPostulation
    ? candidates.filter((candidate) => candidate.postulationId === selectedPostulation)
    : candidates

  const filteredCandidates = postulationCandidates.filter((candidate) => {
    const matchesSearch =
      searchTerm === "" ||
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.stage.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilters.length === 0 || stageFilters.includes(candidate.stage)

    return matchesSearch && matchesStage
  })

  const handleStageChange = (candidateId: number, newStage: string, feedback: string, score: number) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, stage: newStage, score, lastActivity: new Date().toISOString().split("T")[0] }
          : candidate,
      ),
    )
  }

  const handleStageFilterChange = (stage: string) => {
    setStageFilters((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]))
  }

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Cargando datos del dashboard...')
        
        const [candidatesData, applicationsData] = await Promise.all([
          candidatesService.getAllCandidates(),
          applicationsService.getAllApplications()
        ])
        
        setCandidates(candidatesData || [])
        
        // Calcular estadísticas
        const totalCandidates = candidatesData?.length || 0
        const activeProcesses = applicationsData?.filter(app => app.status === 'active').length || 0
        const scheduledInterviews = candidatesData?.filter(c => 
          c.stage === 'primera-entrevista' || c.stage === 'segunda-entrevista'
        ).length || 0
        const stalled = candidatesData?.filter(c => 
          c.stage === 'stand-by'
        ).length || 0
        
        setStats({
          totalCandidates,
          activeProcesses,
          scheduledInterviews,
          stalled
        })
        
        console.log('📊 Dashboard cargado:', {
          candidates: totalCandidates,
          applications: activeProcesses,
          interviews: scheduledInterviews,
          stalled
        })
      } catch (error) {
        console.error('❌ Error cargando dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "stalled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "on-hold":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "scheduled":
        return <Calendar className="h-4 w-4" />
      case "stalled":
        return <AlertTriangle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const canCreateApplication = user?.permissions.includes("crear_postulaciones") || false

  if (selectedCandidate) {
    return <CandidateDetail candidateId={selectedCandidate} onBack={() => setSelectedCandidate(null)} />
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de candidatos y postulaciones</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalCandidates
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Procesos Activos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.activeProcesses
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrevistas Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.scheduledInterviews
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estancados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.stalled
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar por etapas:
                </span>
                {stages.map((stage) => (
                  <Button
                    key={stage}
                    variant={stageFilters.includes(stage) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStageFilterChange(stage)}
                    className="text-xs"
                  >
                    {stage}
                  </Button>
                ))}
                {stageFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStageFilters([])}
                    className="text-xs text-muted-foreground"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "list" && (
          <ListView
            candidates={filteredCandidates}
            onSelectCandidate={setSelectedCandidate}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {viewMode === "cards" && (
          <CardsView
            candidates={filteredCandidates}
            onSelectCandidate={setSelectedCandidate}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {viewMode === "kanban" && (
          <KanbanView
            candidates={filteredCandidates}
            stages={stages}
            onSelectCandidate={setSelectedCandidate}
            onStageChange={handleStageChange}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}
      </div>

      {showNewApplication && <NewApplicationModal onClose={() => setShowNewApplication(false)} />}
      {showNewCandidate && <NewCandidateModal onClose={() => setShowNewCandidate(false)} />}
    </div>
  )
}
