"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Users, FileText, Building2, User, Calendar } from "lucide-react"
import { NewApplicationModal } from "./new-application-modal"
import { useAuth } from "./auth-provider"
import { applicationsService, candidatesService, usersService } from "@/lib/supabase-service"
import { LoadingSpinner, HoverCard, FocusCard } from "@/components/ui/accessibility"
import { useRouter } from "next/navigation"
import type { Page } from "./main-app"

const statuses = ["Activa", "Cerrada", "Pausada"]

interface PostulationsViewProps {
  onNavigate: (page: Page) => void
  onSelectPostulation: (id: number) => void
}

export function PostulationsView({ onNavigate, onSelectPostulation }: PostulationsViewProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [candidateCounts, setCandidateCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [showNewApplication, setShowNewApplication] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [responsibleFilters, setResponsibleFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  // Cargar aplicaciones, candidatos y usuarios desde Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [applicationsData, candidatesData, usersData] = await Promise.all([
          applicationsService.getAllApplications(),
          candidatesService.getAllCandidates(),
          usersService.getAllUsers()
        ])
        setApplications(applicationsData)
        setCandidates(candidatesData)
        setUsers(usersData)
        
        // Obtener conteo real de candidatos por aplicación usando el servicio corregido
        const counts: Record<number, number> = {}
        for (const app of applicationsData) {
          try {
            const appCandidates = await candidatesService.getCandidatesByApplication(app.id)
            counts[app.id] = appCandidates.length
            console.log(`📊 Aplicación ${app.title}: ${appCandidates.length} candidatos`)
          } catch (error) {
            console.error(`Error getting candidates for app ${app.id}:`, error)
            counts[app.id] = 0
          }
        }
        setCandidateCounts(counts)
        
        console.log('📋 Applications loaded from service:', applicationsData.length)
        console.log('👥 Candidates loaded from service:', candidatesData.length)
        console.log('👤 Users loaded from service:', usersData.length)
        console.log('📊 Candidate counts by application:', counts)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPostulations = applications.filter((postulation) => {
    const matchesSearch =
      searchTerm === "" ||
      postulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postulation.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postulation.status.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(postulation.status)
    const matchesResponsible = responsibleFilters.length === 0 || 
      (postulation.users && responsibleFilters.includes(postulation.users.name))

    const matchesDateRange =
      (!dateRange.from || postulation.created_at >= dateRange.from) &&
      (!dateRange.to || postulation.created_at <= dateRange.to)

    return matchesSearch && matchesStatus && matchesResponsible && matchesDateRange
  })

  const handleStatusFilterChange = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleResponsibleFilterChange = (responsible: string) => {
    setResponsibleFilters((prev) =>
      prev.includes(responsible) ? prev.filter((r) => r !== responsible) : [...prev, responsible],
    )
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

  const canCreateApplication = user?.permissions?.includes("crear_postulaciones") || false

  // Funciones para calcular estadísticas
  const getCandidatesByApplication = (applicationId: number) => {
    // Usar el conteo real obtenido del servicio corregido
    return candidateCounts[applicationId] || 0
  }

  const getTotalCandidates = () => {
    // Sumar todos los conteos reales de candidatos
    return Object.values(candidateCounts).reduce((sum, count) => sum + count, 0)
  }



  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Postulaciones</h1>
          <p className="text-muted-foreground">Gestiona las ofertas de trabajo y candidatos</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Postulaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPostulations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPostulations.filter((p) => p.status === "Activa").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getTotalCandidates()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar por estado:
                </span>
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={statusFilters.includes(status) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusFilterChange(status)}
                    className="text-xs"
                  >
                    {status}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Filtrar por responsable:
                </span>
                {users.map((user) => (
                  <Button
                    key={user.id}
                    variant={responsibleFilters.includes(user.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleResponsibleFilterChange(user.name)}
                    className="text-xs"
                  >
                    {user.name}
                  </Button>
                ))}
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rango de fechas:
                </span>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                  className="w-40"
                />
                <span className="text-sm text-muted-foreground">hasta</span>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
              </div>

              {(statusFilters.length > 0 || responsibleFilters.length > 0 || dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilters([])
                    setResponsibleFilters([])
                    setDateRange({ from: "", to: "" })
                  }}
                  className="text-xs text-muted-foreground w-fit"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Postulations List */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <LoadingSpinner size="default" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando aplicaciones...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPostulations.map((postulation) => (
              <HoverCard key={postulation.id}>
                <FocusCard>
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => router.push(`/postulations/${postulation.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {postulation.title}
                            </h3>
                            <Badge className={getStatusColor(postulation.status)}>
                              {postulation.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {postulation.area}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {postulation.users?.name || "Sin asignar"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {getCandidatesByApplication(postulation.id)} candidatos
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {postulation.description || "Sin descripción"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/postulations/${postulation.id}`)
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FocusCard>
              </HoverCard>
            ))}
          </div>
        )}

        {!loading && filteredPostulations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron postulaciones</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilters.length > 0 || responsibleFilters.length > 0
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera postulación"}
              </p>
              {canCreateApplication && (
                <Button onClick={() => setShowNewApplication(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Postulación
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Application Modal */}
      {showNewApplication && (
        <NewApplicationModal onClose={() => setShowNewApplication(false)} />
      )}
    </div>
  )
}
