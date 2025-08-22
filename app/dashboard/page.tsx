'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { dashboardService, pendingReviewsService } from '@/lib/supabase-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Briefcase, 
  Mail, 
  Phone, 
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Star
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const PendingReviewsModal = dynamic(() => import('@/components/pending-reviews-modal').then(m => m.PendingReviewsModal), { ssr: false })

interface Interview {
  id: string
  type: string
  candidateId: number
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  position: string
  stage: string
  score: number | null
  applicationId: number
  applicationTitle: string
  applicationArea: string
  applicationStatus: string
  assignedAt: string
  priority: number
  stageDisplay: string
}

interface DashboardStats {
  totalInterviews: number
  pendingInterviews: number
  todayInterviews: number
  byStage: Record<string, number>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    pendingInterviews: 0,
    todayInterviews: 0,
    byStage: {}
  })
  const [loading, setLoading] = useState(true)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      console.log('🔄 Cargando datos del dashboard para usuario:', user.id)
      
      const [interviewsData, statsData, pendingSummary] = await Promise.all([
        dashboardService.getAssignedInterviews(user.id),
        dashboardService.getDashboardStats(user.id),
        pendingReviewsService.getPendingSummaryForUser(user.id)
      ])

      setInterviews(interviewsData)
      setStats(statsData)
      setPendingCount(pendingSummary.count)
      
      console.log('📊 Dashboard cargado:', {
        interviews: interviewsData.length,
        stats: statsData
      })
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'pre-entrevista': 'bg-blue-100 text-blue-800',
      'primera-entrevista': 'bg-orange-100 text-orange-800',
      'segunda-entrevista': 'bg-purple-100 text-purple-800',
      'fit-cultural': 'bg-green-100 text-green-800',
      'stand-by': 'bg-yellow-100 text-yellow-800',
      'seleccionado': 'bg-emerald-100 text-emerald-800',
      'descartado': 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'pre-entrevista':
        return <Clock className="h-4 w-4" />
      case 'primera-entrevista':
      case 'segunda-entrevista':
        return <Users className="h-4 w-4" />
      case 'fit-cultural':
        return <CheckCircle className="h-4 w-4" />
      case 'stand-by':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'border-l-red-500 bg-red-50'
    if (priority <= 3) return 'border-l-orange-500 bg-orange-50'
    if (priority <= 4) return 'border-l-blue-500 bg-blue-50'
    return 'border-l-gray-500 bg-gray-50'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus entrevistas asignadas y mantén el seguimiento de candidatos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Bienvenido</p>
            <p className="font-semibold text-gray-900">{user?.name}</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrevistas</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">Asignadas a ti</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setShowPendingModal(true)} 
          className="cursor-pointer hover:bg-orange-50/40 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowPendingModal(true) }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Requieren acción</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayInterviews}</div>
            <p className="text-xs text-muted-foreground">Asignadas hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Etapas Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byStage).length}
            </div>
            <p className="text-xs text-muted-foreground">Diferentes etapas</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por Etapa */}
      {Object.keys(stats.byStage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución por Etapas
            </CardTitle>
            <CardDescription>
              Candidatos agrupados por etapa del proceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.byStage).map(([stage, count]) => (
                <div
                  key={stage}
                  className="bg-gray-50 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Entrevistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mis Entrevistas Asignadas
          </CardTitle>
          <CardDescription>
            Candidatos que requieren tu atención, ordenados por prioridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No tienes entrevistas asignadas
              </h3>
              <p className="text-gray-500 mb-4">
                Cuando se te asignen candidatos para entrevista, aparecerán aquí
              </p>
              <Link href="/postulations">
                <Button>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Ver Postulaciones
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(interview.priority)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información del Candidato */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(interview.candidateName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {interview.candidateName}
                          </h3>
                          <Badge 
                            className={`${getStageColor(interview.stage)} flex items-center gap-1`}
                          >
                            {getStageIcon(interview.stage)}
                            {interview.stageDisplay}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {interview.position}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{interview.applicationTitle}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{interview.candidateEmail}</span>
                          </div>
                          {interview.candidatePhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{interview.candidatePhone}</span>
                            </div>
                          )}
                        </div>
                        
                        {interview.score && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {interview.score}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del Proceso y Acciones */}
                    <div className="flex flex-col lg:items-end gap-3">
                      <div className="flex flex-col lg:items-end gap-1">
                        <Badge variant="outline" className="w-fit">
                          {interview.applicationArea}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Asignado: {formatDate(interview.assignedAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link 
                          href={`/candidates/${interview.candidateId}`}
                        >
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </Button>
                        </Link>
                        <Link 
                          href={`/postulations/${interview.applicationId}`}
                        >
                          <Button size="sm">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Ir al Proceso
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PendingReviewsModal open={showPendingModal} onOpenChange={setShowPendingModal} userId={user?.id || ''} />
    </div>
  )
}

