import { getApiUrl } from './config'

// Tipos para las APIs del backend
export interface EmailData {
  to: string
  subject: string
  message: string
  selectedPostulation?: string
  createMeeting?: boolean
  meetingDate?: string
  meetingTime?: string
}

export interface MeetingData {
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

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Clase para manejar las llamadas al backend
class BackendAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = getApiUrl('')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data)
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      console.error('❌ Network Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Email APIs
  async sendEmail(emailData: EmailData): Promise<ApiResponse> {
    return this.request('/api/send-email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    })
  }

  // Google Meet APIs
  async createMeeting(meetingData: MeetingData): Promise<ApiResponse> {
    return this.request('/api/google-meet/create', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    })
  }

  async deleteMeeting(eventId: string): Promise<ApiResponse> {
    return this.request(`/api/google-meet/delete/${eventId}`, {
      method: 'DELETE',
    })
  }

  // AI APIs
  async analyzeCandidate(data: any): Promise<ApiResponse> {
    return this.request('/api/ai/analyze-candidate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Data APIs
  async getCandidates(): Promise<ApiResponse> {
    return this.request('/api/candidates')
  }

  async getPostulations(): Promise<ApiResponse> {
    return this.request('/api/postulations')
  }

  async getUsers(): Promise<ApiResponse> {
    return this.request('/api/users')
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health')
  }
}

// Instancia singleton
export const backendAPI = new BackendAPI()

// Funciones de conveniencia
export const sendEmail = (data: EmailData) => backendAPI.sendEmail(data)
export const createMeeting = (data: MeetingData) => backendAPI.createMeeting(data)
export const deleteMeeting = (eventId: string) => backendAPI.deleteMeeting(eventId)
export const analyzeCandidate = (data: any) => backendAPI.analyzeCandidate(data)
export const getCandidates = () => backendAPI.getCandidates()
export const getPostulations = () => backendAPI.getPostulations()
export const getUsers = () => backendAPI.getUsers()
export const healthCheck = () => backendAPI.healthCheck()
