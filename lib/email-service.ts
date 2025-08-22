// Solo importar Resend en el servidor
let resend: any = null;

// Función para inicializar Resend solo en el servidor
function initializeResend() {
  if (typeof window !== 'undefined') {
    // Estamos en el cliente, no inicializar
    return false;
  }
  
  if (!resend && process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
    return true;
  }
  
  return !!resend;
}

interface EmailParams {
  to: string[]
  subject: string
  html: string
}

interface NotificationData {
  userName: string
  userEmail: string
  applicationTitle: string
  candidateName?: string
  oldStage?: string
  newStage?: string
  assignedBy?: string
  assignedAt?: string
  applicationId?: number
}

interface CandidateEmailData {
  candidateName: string
  candidateEmail: string
  subject: string
  message: string
  postulationTitle: string
  interviewerName: string
  meetingDetails?: {
    meetingUrl: string
    calendarEventId: string
    startTime: string
    endTime: string
  } | null
}

export const emailService = {
  getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  /**
   * Envía un email usando Resend
   */
  async sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
    // Verificar si estamos en el servidor y si Resend está disponible
    if (!initializeResend()) {
      console.log('⚠️ Resend no disponible (cliente o falta API key)')
      return false
    }

    try {
      console.log('📧 Enviando email a:', to.join(', '))
      console.log('📋 Asunto:', subject)

      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'no-reply@agendapro-devops.com',
        to,
        subject,
        html,
      })

      if (error) {
        console.error('❌ Error enviando email:', error)
        return false
      }

      console.log('✅ Email enviado exitosamente:', data?.id)
      return true
    } catch (error) {
      console.error('❌ Error en sendEmail:', error)
      return false
    }
  },

  /**
   * Notifica sobre la creación de un nuevo proceso
   */
  async notifyNewProcess(data: NotificationData): Promise<boolean> {
    const { userName, userEmail, applicationTitle, assignedBy } = data

    const subject = `🆕 Nuevo proceso asignado: ${applicationTitle}`
    
    const baseUrl = this.getBaseUrl()
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Proceso Asignado</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .info-box { background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .highlight { color: #6366f1; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Nuevo Proceso Asignado</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Se te ha asignado un nuevo proceso de reclutamiento en <strong>TalentoPro</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #374151;">📋 Detalles del Proceso</h3>
              <p><strong>Proceso:</strong> <span class="highlight">${applicationTitle}</span></p>
              <p><strong>Asignado por:</strong> ${assignedBy || 'Sistema'}</p>
              <p><strong>Estado:</strong> Activo</p>
            </div>
            
            <h3>🎯 Próximos pasos:</h3>
            <ul>
              <li>Revisa los detalles del proceso en la plataforma</li>
              <li>Verifica los candidatos existentes</li>
              <li>Comienza a evaluar y mover candidatos entre etapas</li>
              <li>Mantén actualizado el estado de cada candidato</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/postulations" class="button">
                🚀 Acceder a TalentoPro
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>Nota:</strong> Recuerda que puedes gestionar candidatos, cambiar etapas y colaborar con tu equipo directamente desde la plataforma.
            </p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente por <strong>TalentoPro</strong></p>
            <p>Sistema de Gestión de Talentos | AgendaPro</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: [userEmail],
      subject,
      html
    })
  },

  /**
   * Notifica sobre el cambio de etapa de un candidato
   */
  async notifyStageChange(data: NotificationData): Promise<boolean> {
    const { userName, userEmail, applicationTitle, candidateName, oldStage, newStage, assignedBy } = data

    const subject = `🔄 Candidato movido: ${candidateName} → ${newStage}`
    
    const baseUrl = this.getBaseUrl()
    const postulationUrl = data.applicationId ? `${baseUrl}/postulations/${data.applicationId}` : `${baseUrl}/postulations`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cambio de Etapa</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .stage-change { background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .stage-arrow { font-size: 24px; color: #10b981; margin: 10px 0; }
          .stage { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 0 10px; }
          .stage-old { background-color: #fee2e2; color: #dc2626; }
          .stage-new { background-color: #dcfce7; color: #166534; }
          .info-box { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .highlight { color: #10b981; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Cambio de Etapa</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Un candidato ha sido movido a una nueva etapa en <strong>TalentoPro</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #374151;">👤 Información del Candidato</h3>
              <p><strong>Candidato:</strong> <span class="highlight">${candidateName}</span></p>
              <p><strong>Proceso:</strong> ${applicationTitle}</p>
              <p><strong>Movido por:</strong> ${assignedBy || 'Sistema'}</p>
            </div>
            
            <div class="stage-change">
              <h3 style="margin-top: 0; color: #166534;">📊 Cambio de Etapa</h3>
              <div>
                <span class="stage stage-old">${oldStage || 'Etapa anterior'}</span>
                <div class="stage-arrow">↓</div>
                <span class="stage stage-new">${newStage}</span>
              </div>
            </div>
            
            <h3>🎯 Acciones recomendadas:</h3>
            <ul>
              <li>Revisa el perfil completo del candidato</li>
              <li>Verifica las evaluaciones previas</li>
              <li>Coordina la siguiente fase del proceso</li>
              <li>Mantén comunicación con el equipo</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${postulationUrl}" class="button">
                👀 Ver Candidato en TalentoPro
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>Recordatorio:</strong> Mantén actualizado el estado y agrega evaluaciones para un mejor seguimiento del proceso.
            </p>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente por <strong>TalentoPro</strong></p>
            <p>Sistema de Gestión de Talentos | AgendaPro</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: [userEmail],
      subject,
      html
    })
  },

  /**
   * Notifica al responsable asignado de la siguiente entrevista
   */
  async notifyNextInterview(data: NotificationData): Promise<boolean> {
    const { userName, userEmail, applicationTitle, candidateName, newStage, assignedBy, assignedAt } = data

    const dateStr = assignedAt
      ? new Date(assignedAt).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })
      : new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })

    const subject = `📅 Nueva entrevista asignada: ${candidateName} (${newStage})`

    const baseUrl = this.getBaseUrl()
    const postulationUrl = data.applicationId ? `${baseUrl}/postulations/${data.applicationId}` : `${baseUrl}/postulations`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Entrevista Asignada</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .info-box { background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .highlight { color: #7c3aed; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 Nueva Entrevista Asignada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Se te ha asignado la siguiente entrevista para el proceso <strong>${applicationTitle}</strong>.</p>
            <div class="info-box">
              <h3 style="margin-top: 0; color: #374151;">📋 Detalles</h3>
              <p><strong>Candidato:</strong> <span class="highlight">${candidateName}</span></p>
              <p><strong>Etapa:</strong> ${newStage}</p>
              <p><strong>Fecha de asignación:</strong> ${dateStr}</p>
              <p><strong>Asignado por:</strong> ${assignedBy || 'Sistema'}</p>
            </div>
            <div style="text-align: center;">
              <a href="${postulationUrl}" class="button">Abrir proceso en TalentoPro</a>
            </div>
          </div>
          <div class="footer">
            <p>Este email fue enviado automáticamente por <strong>TalentoPro</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: [userEmail],
      subject,
      html
    })
  },

  /**
   * Obtiene una lista de emails de entrevistadores para notificar
   */
  async getInterviewerEmails(excludeUserId?: string): Promise<string[]> {
    try {
      console.log('📋 Obteniendo emails de entrevistadores...')
      
      // Importar dinámicamente para evitar circular dependencies
      const { usersService } = await import('./supabase-service')
      
      const users = await usersService.getAllUsers()
      
      // Filtrar usuarios con permisos de ver postulaciones y excluir el usuario actual
      const interviewers = users.filter(user => {
        const isExcluded = excludeUserId && user.id === excludeUserId
        const canViewPostulations = user.permissions?.includes('ver_postulaciones_asignadas') || 
                                   user.permissions?.includes('ver_todas_postulaciones')
        
        return !isExcluded && canViewPostulations
      })
      
      const emails = interviewers.map(user => user.email)
      console.log(`📧 ${emails.length} entrevistadores encontrados para notificación`)
      
      return emails
    } catch (error) {
      console.error('❌ Error obteniendo emails de entrevistadores:', error)
      return []
    }
  },

  /**
   * Obtiene información de un usuario por ID
   */
  async getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
    try {
      const { usersService } = await import('./supabase-service')
      const user = await usersService.getUserById(userId)
      
      if (user) {
        return {
          name: user.name,
          email: user.email
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error obteniendo info de usuario:', error)
      return null
    }
  },

  /**
   * Envía un email personalizado a un candidato
   */
  async sendCandidateEmail(data: CandidateEmailData): Promise<boolean> {
    if (!initializeResend()) {
      console.log('⚠️ Resend no configurado, simulando envío de email al candidato')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    }

    try {
      const meetingSection = data.meetingDetails ? `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e40af;">📅 Reunión Programada</h3>
          <p>Se ha programado una reunión de Google Meet para tu entrevista:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Fecha:</strong> ${new Date(data.meetingDetails.startTime).toLocaleDateString('es-ES')}</li>
            <li><strong>Hora:</strong> ${new Date(data.meetingDetails.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${new Date(data.meetingDetails.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</li>
            <li><strong>Entrevistador:</strong> ${data.interviewerName}</li>
          </ul>
          <div style="text-align: center; margin: 15px 0;">
            <a href="${data.meetingDetails.meetingUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🎥 Unirse a la Reunión
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            La reunión se agregará automáticamente a tu calendario de Google.
          </p>
        </div>
      ` : ''

      const { data: result, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: [data.candidateEmail],
        subject: data.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Mensaje de Agendapro</h2>
            <p>Hola <strong>${data.candidateName}</strong>,</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Proceso de Selección: ${data.postulationTitle}</h3>
              <p><strong>Entrevistador:</strong> ${data.interviewerName}</p>
            </div>
            <div style="background-color: #fefefe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #374151;">Mensaje:</h3>
              <div style="white-space: pre-wrap; line-height: 1.6;">${data.message}</div>
            </div>
            ${meetingSection}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Este email fue enviado desde Agendapro. Si tienes alguna pregunta, no dudes en responder a este email.
            </p>
          </div>
        `
      })

      if (error) {
        console.error('❌ Error enviando email al candidato:', error)
        return false
      }

      console.log('✅ Email al candidato enviado:', result)
      return true
    } catch (error) {
      console.error('❌ Error en sendCandidateEmail:', error)
      return false
    }
  }
}

export default emailService
