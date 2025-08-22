import { createClient } from '@supabase/supabase-js'

// Verificar configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured')
}

// Crear cliente de Supabase
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') && 
    !supabaseAnonKey.includes('placeholder'))
}



// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'Admin RRHH' | 'Entrevistador'
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'Admin RRHH' | 'Entrevistador'
          permissions: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'Admin RRHH' | 'Entrevistador'
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: number
          title: string
          area: string
          location: string
          type: string
          status: 'Activa' | 'Pausada' | 'Cerrada'
          responsible_id: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          area: string
          location: string
          type: string
          status?: 'Activa' | 'Pausada' | 'Cerrada'
          responsible_id: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          area?: string
          location?: string
          type?: string
          status?: 'Activa' | 'Pausada' | 'Cerrada'
          responsible_id?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: number
          name: string
          email: string
          phone: string
          position: string
          stage: string
          score: number
          status: 'pending' | 'scheduled' | 'stalled' | 'completed' | 'rejected' | 'on-hold'
          assignee_id: string
          application_id: number
          experience: string
          location: string
          avatar: string
          applied_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone: string
          position: string
          stage?: string
          score?: number
          status?: 'pending' | 'scheduled' | 'stalled' | 'completed' | 'rejected' | 'on-hold'
          assignee_id: string
          application_id: number
          experience: string
          location: string
          avatar?: string
          applied_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string
          position?: string
          stage?: string
          score?: number
          status?: 'pending' | 'scheduled' | 'stalled' | 'completed' | 'rejected' | 'on-hold'
          assignee_id?: string
          application_id?: number
          experience?: string
          location?: string
          avatar?: string
          applied_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidate_notes: {
        Row: {
          id: number
          candidate_id: number
          author_id: string
          stage: string
          content: string
          score: number
          created_at: string
        }
        Insert: {
          id?: number
          candidate_id: number
          author_id: string
          stage: string
          content: string
          score: number
          created_at?: string
        }
        Update: {
          id?: number
          candidate_id?: number
          author_id?: string
          stage?: string
          content?: string
          score?: number
          created_at?: string
        }
      }
      candidate_attachments: {
        Row: {
          id: number
          candidate_id: number
          name: string
          type: string
          file_path: string
          created_at: string
        }
        Insert: {
          id?: number
          candidate_id: number
          name: string
          type: string
          file_path: string
          created_at?: string
        }
        Update: {
          id?: number
          candidate_id?: number
          name?: string
          type?: string
          file_path?: string
          created_at?: string
        }
      }
      candidate_timeline: {
        Row: {
          id: number
          candidate_id: number
          stage: string
          status: 'completed' | 'current' | 'pending'
          date: string | null
          created_at: string
        }
        Insert: {
          id?: number
          candidate_id: number
          stage: string
          status: 'completed' | 'current' | 'pending'
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          candidate_id?: number
          stage?: string
          status?: 'completed' | 'current' | 'pending'
          date?: string | null
          created_at?: string
        }
      }
      postulations: {
        Row: {
          id: number
          candidate_id: number
          application_id: number
          stage: string
          status: 'active' | 'completed' | 'rejected' | 'on-hold'
          assignee_id: string | null
          score: number | null
          notes: string | null
          applied_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          candidate_id: number
          application_id: number
          stage?: string
          status?: 'active' | 'completed' | 'rejected' | 'on-hold'
          assignee_id?: string | null
          score?: number | null
          notes?: string | null
          applied_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          candidate_id?: number
          application_id?: number
          stage?: string
          status?: 'active' | 'completed' | 'rejected' | 'on-hold'
          assignee_id?: string | null
          score?: number | null
          notes?: string | null
          applied_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
