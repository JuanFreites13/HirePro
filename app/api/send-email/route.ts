import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/send-email
 * Envía emails usando el servicio de email (solo servidor)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Validaciones básicas
    if (!type || !data) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros requeridos: type, data'
        },
        { status: 400 }
      )
    }

    // Importar dinámicamente el servicio de email (solo en servidor)
    const { emailService } = await import('@/lib/email-service')

    let result = false

    switch (type) {
      case 'new_process':
        result = await emailService.notifyNewProcess({
          userName: data.userName,
          userEmail: data.userEmail,
          applicationTitle: data.applicationTitle,
          assignedBy: data.assignedBy
        })
        break

      case 'stage_change':
        result = await emailService.notifyStageChange({
          userName: data.userName,
          userEmail: data.userEmail,
          applicationTitle: data.applicationTitle,
          candidateName: data.candidateName,
          oldStage: data.oldStage,
          newStage: data.newStage,
          assignedBy: data.assignedBy
        })
        break

      case 'next_interview': {
        // Enriquecer datos: obtener info real del usuario y de la aplicación
        const { emailService } = await import('@/lib/email-service')
        const { usersService, applicationsService } = await import('@/lib/supabase-service')

        let userInfo = { name: 'Responsable', email: 'responsable@example.com' }
        if (data.assigneeId) {
          const user = await usersService.getUserById(data.assigneeId)
          if (user) {
            userInfo = { name: user.name, email: user.email }
          }
        }

        let applicationTitle = data.applicationTitle
        if ((!applicationTitle || applicationTitle.length === 0) && data.applicationId) {
          const app = await applicationsService.getApplicationById(Number(data.applicationId))
          applicationTitle = app?.title || ''
        }

        result = await emailService.notifyNextInterview({
          userName: userInfo.name,
          userEmail: userInfo.email,
          applicationTitle,
          candidateName: data.candidateName,
          newStage: data.stage,
          assignedBy: data.assignedBy,
          assignedAt: data.assignedAt,
          applicationId: data.applicationId ? Number(data.applicationId) : undefined
        })
        break
      }

      case 'candidate_email': {
        const { emailService } = await import('@/lib/email-service')
        const { googleMeetService } = await import('@/lib/google-meet-service')
        const { createClient } = await import('@supabase/supabase-js')

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
        )

        // Obtener datos del candidato
        const { data: candidate } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', data.candidateId)
          .single()

        if (!candidate) {
          return NextResponse.json(
            { success: false, error: 'Candidato no encontrado' },
            { status: 404 }
          )
        }

        let postulation = null
        let applicationData = null
        let assigneeData = null

        // Verificar si es una postulación específica o un candidato directo
        if (data.postulationId.startsWith('candidate-')) {
          // Es un candidato directo, obtener datos de la aplicación y asignado
          const { data: app } = await supabase
            .from('applications')
            .select('*')
            .eq('id', candidate.application_id)
            .single()

          const { data: assignee } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', candidate.assignee_id)
            .single()

          applicationData = app
          assigneeData = assignee
        } else {
          // Es una postulación específica
          const { data: post } = await supabase
            .from('postulations')
            .select(`
              *,
              applications!inner(id, title),
              users!inner(name, email)
            `)
            .eq('id', data.postulationId)
            .single()

          if (!post) {
            return NextResponse.json(
              { success: false, error: 'Postulación no encontrada' },
              { status: 404 }
            )
          }

          postulation = post
          applicationData = post.applications
          assigneeData = post.users
        }

        if (!applicationData || !assigneeData) {
          return NextResponse.json(
            { success: false, error: 'Datos de aplicación o asignado no encontrados' },
            { status: 404 }
          )
        }

        let meetingDetails = null

        // Crear reunión de Google Meet si se solicita
        if (data.createMeeting && data.meetingDate && data.meetingTime) {
          const validation = googleMeetService.validateDateTime(data.meetingDate, data.meetingTime)
          if (!validation.isValid) {
            return NextResponse.json(
              { success: false, error: validation.error },
              { status: 400 }
            )
          }

          const startTime = new Date(`${data.meetingDate}T${data.meetingTime}`).toISOString()
          const endTime = googleMeetService.calculateEndTime(startTime, 60)

          try {
            meetingDetails = await googleMeetService.createMeeting({
              summary: googleMeetService.generateEventSummary(candidate.name, applicationData.title),
              description: googleMeetService.generateEventDescription(candidate.name, applicationData.title, data.message),
              startTime,
              endTime,
              attendees: [candidate.email, assigneeData.email],
              candidateName: candidate.name,
              candidateEmail: candidate.email,
              interviewerName: assigneeData.name,
              interviewerEmail: assigneeData.email,
              postulationTitle: applicationData.title
            })
          } catch (error: any) {
            console.error('❌ Error creando reunión:', error)
            return NextResponse.json(
              { success: false, error: `Error creando reunión: ${error.message}` },
              { status: 500 }
            )
          }
        }

        // Enviar email al candidato
        result = await emailService.sendCandidateEmail({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          subject: data.subject,
          message: data.message,
          postulationTitle: applicationData.title,
          interviewerName: assigneeData.name,
          meetingDetails
        })
        break
      }

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Tipo de email no soportado',
            supportedTypes: ['new_process', 'stage_change', 'next_interview', 'candidate_email']
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result,
      message: result ? 'Email enviado exitosamente' : 'Error enviando email'
    })

  } catch (error) {
    console.error('❌ Error en send-email API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

