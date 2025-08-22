import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

interface MeetingDetails {
  summary: string
  description: string
  startTime: string
  endTime: string
  attendees: string[]
  candidateName: string
  candidateEmail: string
  interviewerName: string
  interviewerEmail: string
  postulationTitle: string
}

// Variables globales para auth y calendar
let auth: any = null
let calendar: any = null

export const googleMeetService = {
  getAuth() {
    if (!auth) {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error('Configuración de Google API incompleta. Verifica las variables de entorno.')
      }

      auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
      )

      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      })
    }
    return auth
  },
  
  getCalendar() {
    if (!calendar) {
      const authInstance = this.getAuth()
      calendar = google.calendar({ version: 'v3', auth: authInstance })
    }
    return calendar
  },
  async createMeeting(meetingDetails: MeetingDetails): Promise<{
    meetingUrl: string
    calendarEventId: string
    startTime: string
    endTime: string
  }> {
    try {
      console.log('🔗 Creando reunión de Google Meet:', meetingDetails)
      
      const authInstance = this.getAuth()
      const calendarInstance = this.getCalendar()

      const event = {
        summary: meetingDetails.summary,
        description: meetingDetails.description,
        start: {
          dateTime: meetingDetails.startTime,
          timeZone: 'America/Santiago',
        },
        end: {
          dateTime: meetingDetails.endTime,
          timeZone: 'America/Santiago',
        },
        attendees: meetingDetails.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 día antes
            { method: 'popup', minutes: 15 } // 15 minutos antes
          ]
        }
      }

      const response = await calendarInstance.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      })

      if (!response.data?.id || !response.data?.conferenceData?.entryPoints?.[0]?.uri) {
        throw new Error('Error creando la reunión. No se pudo obtener la URL de Meet.')
      }

      const meetingUrl = response.data.conferenceData.entryPoints[0].uri
      const calendarEventId = response.data.id

      console.log('✅ Reunión creada exitosamente:', {
        meetingUrl,
        calendarEventId,
        startTime: meetingDetails.startTime,
        endTime: meetingDetails.endTime
      })

      return {
        meetingUrl,
        calendarEventId,
        startTime: meetingDetails.startTime,
        endTime: meetingDetails.endTime
      }
    } catch (error: any) {
      console.error('❌ Error creando reunión de Google Meet:', error)
      throw new Error(`Error creando reunión: ${error.message}`)
    }
  },

  generateEventDescription(candidateName: string, postulationTitle: string, customMessage?: string): string {
    const baseDescription = `Entrevista para el candidato ${candidateName} en el proceso de selección: ${postulationTitle}`
    
    if (customMessage) {
      return `${baseDescription}\n\nMensaje personalizado:\n${customMessage}\n\n---\n\nEste evento fue creado automáticamente por Agendapro.`
    }
    
    return `${baseDescription}\n\n---\n\nEste evento fue creado automáticamente por Agendapro.`
  },

  generateEventSummary(candidateName: string, postulationTitle: string): string {
    return `Entrevista: ${candidateName} - ${postulationTitle}`
  },

  calculateEndTime(startTime: string, durationMinutes: number = 60): string {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    return end.toISOString()
  },

  validateDateTime(date: string, time: string): { isValid: boolean; error?: string } {
    if (!date || !time) {
      return { isValid: false, error: 'Fecha y hora son requeridas' }
    }

    const dateTime = new Date(`${date}T${time}`)
    const now = new Date()

    if (isNaN(dateTime.getTime())) {
      return { isValid: false, error: 'Fecha u hora inválida' }
    }

    if (dateTime <= now) {
      return { isValid: false, error: 'La fecha y hora deben ser futuras' }
    }

    return { isValid: true }
  }
}
