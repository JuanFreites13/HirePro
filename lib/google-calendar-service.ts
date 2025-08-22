// Servicio para Google Calendar API
interface CalendarEvent {
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: Array<{
    email: string
    displayName?: string
  }>
  reminders: {
    useDefault: boolean
  }
}

interface InterviewData {
  candidateName: string
  candidateEmail: string
  interviewerName: string
  interviewerEmail: string
  date: string
  time: string
  duration: number
  postulationTitle: string
  notes?: string
}

class GoogleCalendarService {
  private accessToken: string | null = null

  // Obtener token de acceso usando Google OAuth
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    // Usar Google Identity API para obtener token
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: 'https://www.googleapis.com/auth/calendar.events',
          callback: (response) => {
            this.accessToken = response.access_token
            resolve(response.access_token)
          },
          error_callback: (error) => {
            reject(new Error('Error obteniendo token: ' + error.message))
          }
        }).requestAccessToken()
      } else {
        reject(new Error('Google API no está disponible'))
      }
    })
  }

  // Crear evento en Google Calendar
  async createInterviewEvent(data: InterviewData): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      
      // Convertir fecha y hora a formato ISO
      const startDateTime = new Date(`${data.date}T${data.time}`)
      const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000)
      
      const event: CalendarEvent = {
        summary: `Entrevista: ${data.candidateName} - ${data.postulationTitle}`,
        description: `Entrevista para ${data.postulationTitle}\n\nCandidato: ${data.candidateName}\nEntrevistador: ${data.interviewerName}\n\n${data.notes || ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Santiago'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Santiago'
        },
        attendees: [
          { email: data.candidateEmail, displayName: data.candidateName },
          { email: data.interviewerEmail, displayName: data.interviewerName }
        ],
        reminders: {
          useDefault: true
        }
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`Error creando evento: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        eventId: result.id,
        eventUrl: result.htmlLink,
        data: result
      }
    } catch (error) {
      console.error('Error creando evento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Enviar email de confirmación usando Resend
  async sendInterviewEmail(data: InterviewData, eventUrl: string): Promise<any> {
    try {
      const response = await fetch('/api/send-interview-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateEmail: data.candidateEmail,
          candidateName: data.candidateName,
          interviewerName: data.interviewerName,
          postulationTitle: data.postulationTitle,
          date: data.date,
          time: data.time,
          duration: data.duration,
          eventUrl: eventUrl,
          notes: data.notes
        })
      })

      if (!response.ok) {
        throw new Error(`Error enviando email: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error enviando email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // Función principal para agendar entrevista
  async scheduleInterview(data: InterviewData): Promise<any> {
    try {
      console.log('📅 Agendando entrevista:', data)

      // 1. Crear evento en Google Calendar
      const calendarResult = await this.createInterviewEvent(data)
      
      if (!calendarResult.success) {
        return calendarResult
      }

      // 2. Enviar email de confirmación
      const emailResult = await this.sendInterviewEmail(data, calendarResult.eventUrl)
      
      if (!emailResult.success) {
        console.warn('⚠️ Evento creado pero email falló:', emailResult.error)
      }

      return {
        success: true,
        eventId: calendarResult.eventId,
        eventUrl: calendarResult.eventUrl,
        emailSent: emailResult.success
      }
    } catch (error) {
      console.error('❌ Error agendando entrevista:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()
export default googleCalendarService
