'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowRight, Clock } from 'lucide-react'
import { candidatesService } from '@/lib/supabase-service'

interface TimelineItem {
  id: number
  action_type: string
  action_description: string
  performed_by?: string
  performed_by_email?: string
  previous_value?: string
  new_value?: string
  metadata?: any
  created_at: string
}

export default function CandidateTimelinePage({ params }: { params: { id: string } }) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [params.id])

  const loadTimeline = async () => {
    try {
      const data = await candidatesService.getDetailedTimeline('candidate', parseInt(params.id))
      setTimeline(data)
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created': return '🎯'
      case 'updated': return '✏️'
      case 'moved': return '🔄'
      case 'evaluation_created': return '⭐'
      case 'note_created': return '📝'
      case 'attachment_uploaded': return '📎'
      case 'stage_changed': return '📊'
      default: return '📋'
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'created': return 'bg-green-100 text-green-800'
      case 'updated': return 'bg-blue-100 text-blue-800'
      case 'moved': return 'bg-purple-100 text-purple-800'
      case 'evaluation_created': return 'bg-yellow-100 text-yellow-800'
      case 'note_created': return 'bg-indigo-100 text-indigo-800'
      case 'attachment_uploaded': return 'bg-pink-100 text-pink-800'
      case 'stage_changed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatActionDescription = (actionType: string, description: string) => {
    switch (actionType) {
      case 'created':
        return `Candidato creado: ${description}`
      case 'updated':
        return `Información actualizada: ${description}`
      case 'moved':
        return `Movido de etapa: ${description}`
      case 'evaluation_created':
        return `Evaluación agregada: ${description}`
      case 'note_created':
        return `Nota agregada: ${description}`
      case 'attachment_uploaded':
        return `Archivo subido: ${description}`
      case 'stage_changed':
        return `Cambio de etapa: ${description}`
      default:
        return description
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline del Candidato</h1>
        <Badge variant="outline">
          {timeline.length} actividades
        </Badge>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay actividades registradas
          </h3>
          <p className="text-muted-foreground">
            Las actividades del candidato aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((item, index) => {
            const formattedDate = formatDate(item.created_at)
            return (
              <Card key={item.id} className="relative">
                <div className="absolute left-4 top-4 w-2 h-2 bg-primary rounded-full"></div>
                {index < timeline.length - 1 && (
                  <div className="absolute left-4 top-6 w-0.5 h-16 bg-border"></div>
                )}
                
                <CardHeader className="pl-12">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getActionIcon(item.action_type)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getActionColor(item.action_type)}>
                            {item.action_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formattedDate.date} a las {formattedDate.time}
                          </span>
                        </div>
                        <p className="mt-1 font-medium">
                          {formatActionDescription(item.action_type, item.action_description)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pl-12">
                  <div className="space-y-3">
                    {/* Mostrar cambios de valor si existen */}
                    {(item.previous_value || item.new_value) && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-sm">
                          {item.previous_value && (
                            <>
                              <span className="text-muted-foreground">De:</span>
                              <span className="font-medium">{item.previous_value}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </>
                          )}
                          {item.new_value && (
                            <span className="font-medium">{item.new_value}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mostrar metadata si existe */}
                    {item.metadata && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Información adicional: {JSON.stringify(item.metadata)}
                        </p>
                      </div>
                    )}

                    {/* Información del usuario que realizó la acción */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate.date}</span>
                      </div>
                      {(item.performed_by || item.performed_by_email) && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{item.performed_by_email || item.performed_by || 'Usuario del sistema'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

