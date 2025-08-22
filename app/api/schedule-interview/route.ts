import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { googleMeetService } from '@/lib/google-meet-service'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateId, date, time, duration, assigneeId, postulationId, notes } = body

    if (!candidateId || !date || !time || !assigneeId || !postulationId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtener datos del candidato
    const { data: candidate } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single()

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      )
    }

    // Obtener datos del responsable
    const { data: assignee } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', assigneeId)
      .single()

    if (!assignee) {
      return NextResponse.json(
        { success: false, error: 'Responsable no encontrado' },
        { status: 404 }
      )
    }

    // Obtener datos de la aplicación basada en postulationId
    let applicationTitle = ''
    
    if (postulationId.startsWith('app-')) {
      // Es una aplicación directa
      const appId = postulationId.replace('app-', '')
      const { data: application } = await supabase
        .from('applications')
        .select('title')
        .eq('id', appId)
        .single()

      if (!application) {
        return NextResponse.json(
          { success: false, error: 'Aplicación no encontrada' },
          { status: 404 }
        )
      }
      applicationTitle = application.title
    } else {
      // Es una postulación específica
      const { data: postulation } = await supabase
        .from('postulations')
        .select(`
          applications!inner(id, title)
        `)
        .eq('id', postulationId)
        .single()

      if (!postulation) {
        return NextResponse.json(
          { success: false, error: 'Postulación no encontrada' },
          { status: 404 }
        )
      }
      applicationTitle = postulation.applications.title
    }

    // Crear evento en Google Calendar
    const startTime = new Date(`${date}T${time}`).toISOString()
    const endTime = googleMeetService.calculateEndTime(startTime, duration)

    const meetingDetails = await googleMeetService.createMeeting({
      summary: googleMeetService.generateEventSummary(candidate.name, applicationTitle),
      description: googleMeetService.generateEventDescription(candidate.name, applicationTitle, notes),
      startTime,
      endTime,
      attendees: [candidate.email, assignee.email],
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      interviewerName: assignee.name,
      interviewerEmail: assignee.email,
      postulationTitle: applicationTitle
    })

    // Actualizar el candidato con el nuevo responsable y etapa
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        assignee_id: assigneeId,
        stage: 'entrevista-programada',
        updated_at: new Date().toISOString()
      })
      .eq('id', candidateId)

    if (updateError) {
      console.error('❌ Error actualizando candidato:', updateError)
      return NextResponse.json(
        { success: false, error: 'Error actualizando candidato' },
        { status: 500 }
      )
    }

    // Enviar email de confirmación al candidato
    const emailSent = await emailService.sendCandidateEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      subject: `Entrevista programada - ${applicationTitle}`,
      message: `Hola ${candidate.name},\n\nTu entrevista para el puesto de ${applicationTitle} ha sido programada exitosamente.\n\nDetalles de la entrevista:\n- Fecha: ${new Date(startTime).toLocaleDateString('es-ES')}\n- Hora: ${new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n- Duración: ${duration} minutos\n- Entrevistador: ${assignee.name}\n\n${notes ? `\nNotas adicionales:\n${notes}\n` : ''}\nTe esperamos en la reunión.\n\nSaludos,\nEquipo de Agendapro`,
      postulationTitle: applicationTitle,
      interviewerName: assignee.name,
      meetingDetails
    })

    if (!emailSent) {
      console.warn('⚠️ No se pudo enviar el email de confirmación')
    }

    console.log('✅ Entrevista agendada exitosamente:', {
      candidateId,
      assigneeId,
      startTime,
      endTime,
      meetingUrl: meetingDetails.meetingUrl
    })

    return NextResponse.json({
      success: true,
      message: 'Entrevista agendada exitosamente',
      meetingDetails
    })

  } catch (error: any) {
    console.error('❌ Error agendando entrevista:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
