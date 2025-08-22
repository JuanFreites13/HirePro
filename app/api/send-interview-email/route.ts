import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      candidateEmail,
      candidateName,
      interviewerName,
      postulationTitle,
      date,
      time,
      duration,
      eventUrl,
      notes
    } = body

    // Validar datos requeridos
    if (!candidateEmail || !candidateName || !interviewerName || !postulationTitle || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Datos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Formatear fecha y hora
    const formattedDate = new Date(`${date}T${time}`).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const formattedTime = new Date(`${date}T${time}`).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Crear contenido del email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎯 Entrevista Confirmada</h2>
        
        <p>Hola <strong>${candidateName}</strong>,</p>
        
        <p>Tu entrevista ha sido confirmada exitosamente. Aquí están los detalles:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">📋 Detalles de la Entrevista</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Posición:</strong> ${postulationTitle}</li>
            <li><strong>Entrevistador:</strong> ${interviewerName}</li>
            <li><strong>Fecha:</strong> ${formattedDate}</li>
            <li><strong>Hora:</strong> ${formattedTime}</li>
            <li><strong>Duración:</strong> ${duration} minutos</li>
          </ul>
        </div>
        
        ${notes ? `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">📝 Notas Adicionales</h4>
          <p style="margin: 0;">${notes}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${eventUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            📅 Ver en Google Calendar
          </a>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">💡 Consejos para la Entrevista</h4>
          <ul style="margin: 10px 0;">
            <li>Llega 5 minutos antes</li>
            <li>Ten preparadas tus preguntas</li>
            <li>Mantén una actitud positiva</li>
            <li>Prepara ejemplos de tu experiencia</li>
          </ul>
        </div>
        
        <p>Si tienes alguna pregunta o necesitas reprogramar la entrevista, no dudes en contactarnos.</p>
        
        <p>¡Mucha suerte!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Este email fue enviado automáticamente por HirePro.<br>
          Si tienes problemas, contacta a soporte@agendapro.com
        </p>
      </div>
    `

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'no-reply@agendapro-devops.com',
      to: [candidateEmail],
      subject: `🎯 Entrevista Confirmada - ${postulationTitle}`,
      html: emailContent
    })

    if (error) {
      console.error('Error enviando email:', error)
      return NextResponse.json(
        { success: false, error: 'Error enviando email' },
        { status: 500 }
      )
    }

    console.log('✅ Email enviado exitosamente:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado exitosamente',
      data 
    })

  } catch (error) {
    console.error('❌ Error en send-interview-email:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
