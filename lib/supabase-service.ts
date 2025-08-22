import { supabase, isSupabaseConfigured, Database } from './supabase'

// Types from database
type User = Database['public']['Tables']['users']['Row']
type Application = Database['public']['Tables']['applications']['Row']
type Candidate = Database['public']['Tables']['candidates']['Row']
type CandidateNote = Database['public']['Tables']['candidate_notes']['Row']
type CandidateAttachment = Database['public']['Tables']['candidate_attachments']['Row']
type CandidateTimeline = Database['public']['Tables']['candidate_timeline']['Row']

// Check if Supabase is configured - using imported function



// Authentication service
export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      // Create a default admin user for testing
      const defaultUser: User = {
        id: '00000000-0000-0000-0000-000000000000',
    name: 'Admin TalentoPro',
        email: email,
    role: 'Admin RRHH',
    permissions: [
      'crear_postulaciones',
      'mover_etapas',
      'ver_todas_postulaciones',
      'gestionar_usuarios',
      'acceso_configuracion',
      'eliminar_candidatos',
          'editar_postulaciones',
          'usar_ia'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
      }
      return defaultUser
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Get user profile from our users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        return userProfile
      }

      return null
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  },

  async loginWithGoogle(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      // Mock Google authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Create a default admin user for testing
      const defaultUser: User = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Admin TalentoPro',
        email: 'admin@talentopro.com',
        role: 'Admin RRHH',
        permissions: [
          'crear_postulaciones',
          'mover_etapas',
          'ver_todas_postulaciones',
          'gestionar_usuarios',
          'acceso_configuracion',
          'eliminar_candidatos',
          'editar_postulaciones',
          'usar_ia'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return defaultUser
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return null // Will be handled by redirect
    } catch (error) {
      console.error('Google login error:', error)
      return null
    }
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, simulando logout')
      return
    }

    try {
      console.log('🔐 Cerrando sesión en Supabase...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Error en logout de Supabase:', error)
        throw error
      }
      
      console.log('✅ Sesión cerrada exitosamente en Supabase')
    } catch (error) {
      console.error('❌ Error en logout:', error)
      throw error
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return true
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Reset password error:', error)
      return false
    }
  },

  async updatePassword(newPassword: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return true
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Update password error:', error)
      return false
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      // Create a default admin user for testing
      const defaultUser: User = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Admin TalentoPro',
        email: 'admin@talentopro.com',
        role: 'Admin RRHH',
        permissions: [
          'crear_postulaciones',
          'mover_etapas',
          'ver_todas_postulaciones',
          'gestionar_usuarios',
          'acceso_configuracion',
          'eliminar_candidatos',
          'editar_postulaciones',
          'usar_ia'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return defaultUser
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      return userProfile
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }
}

// Users service implementation moved to later in file

// Applications service
export const applicationsService = {
  async getAllApplications(): Promise<Application[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users!applications_responsible_id_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get applications error:', error)
      return []
    }
  },

  async getApplicationById(id: number): Promise<Application | null> {
    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users!applications_responsible_id_fkey(name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get application error:', error)
      return null
    }
  },

  async createApplication(applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application | null> {
    if (!isSupabaseConfigured()) {
      const newApplication: Application = {
        ...applicationData,
        id: Date.now(), // Use timestamp as ID for local testing
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return newApplication
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single()

      if (error) throw error
      
      console.log('✅ Application created successfully:', data.title)
      
      // Enviar notificaciones por email de nuevo proceso
      try {
        console.log('📧 Enviando notificaciones de nuevo proceso...')
        
        // Obtener usuarios con permisos de entrevistador (excluyendo al creador)
        const users = await usersService.getAllUsers()
        const interviewers = users.filter(user => {
          const isExcluded = applicationData.responsible_id && user.id === applicationData.responsible_id
          const canViewPostulations = user.permissions?.includes('ver_postulaciones_asignadas') || user.permissions?.includes('ver_todas_postulaciones')
          return !isExcluded && canViewPostulations
        })
        
        if (interviewers.length > 0) {
          // Obtener información del responsable
          const responsibleInfo = applicationData.responsible_id 
            ? users.find(u => u.id === applicationData.responsible_id)
            : null
          
          // Enviar notificación a cada entrevistador usando API endpoint
          for (const user of interviewers) {
            try {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'new_process',
                  data: {
                    userName: user.name,
                    userEmail: user.email,
                    applicationTitle: data.title,
                    assignedBy: responsibleInfo?.name || 'Sistema'
                  }
                })
              })
            } catch (emailError) {
              console.warn(`⚠️ Error enviando email a ${user.email}:`, emailError)
            }
          }
          
          console.log(`✅ Notificaciones enviadas a ${interviewers.length} entrevistadores`)
        } else {
          console.log('ℹ️ No hay entrevistadores para notificar')
        }
      } catch (notificationError) {
        console.error('⚠️ Error enviando notificaciones (no afecta creación):', notificationError)
      }

      return data
    } catch (error) {
      console.error('Create application error:', error)
      return null
    }
  },

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | null> {
    if (!isSupabaseConfigured()) {
      // For local testing, just return the updated data
      return {
        id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Application
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update application error:', error)
      return null
    }
  },

  async archiveApplication(id: number): Promise<Application | null> {
    console.log('📁 Archivando postulación:', id)
    
    try {
      const result = await this.updateApplication(id, { 
        status: 'Cerrada' as 'Activa' | 'Pausada' | 'Cerrada',
        updated_at: new Date().toISOString()
      })
      
      if (result) {
        console.log('✅ Postulación archivada exitosamente')
      }
      
      return result
    } catch (error) {
      console.error('❌ Error archivando postulación:', error)
      throw error
    }
  },

  async deleteApplication(id: number): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, simulando eliminación')
      return true
    }

    try {
      console.log('🗑️ Eliminando postulación:', id)
      
      // Primero verificar si hay candidatos asociados
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, name')
        .eq('application_id', id)
      
      if (candidatesError) {
        console.error('❌ Error verificando candidatos:', candidatesError)
        throw candidatesError
      }

      const candidateCount = candidates?.length || 0
      console.log(`📊 Candidatos asociados: ${candidateCount}`)

      if (candidateCount > 0) {
        const candidateNames = candidates?.map(c => c.name).join(', ')
        throw new Error(`No se puede eliminar la postulación porque tiene ${candidateCount} candidato(s) asociado(s): ${candidateNames}. Primero elimina o reasigna los candidatos.`)
      }

      // Verificar si hay postulaciones en la nueva tabla
      try {
        const { data: postulations } = await supabase
          .from('postulations')
          .select('id')
          .eq('application_id', id)
        
        const postulationCount = postulations?.length || 0
        if (postulationCount > 0) {
          throw new Error(`No se puede eliminar la postulación porque tiene ${postulationCount} postulación(es) vinculada(s) en el nuevo sistema. Primero elimina las vinculaciones.`)
        }
      } catch (postError) {
        // Tabla postulations puede no existir, continuar
        console.log('ℹ️ Tabla postulations no disponible o vacía')
      }

      // Eliminar la postulación
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error eliminando postulación:', error)
        throw error
      }

      console.log('✅ Postulación eliminada exitosamente')
      return true
    } catch (error) {
      console.error('❌ Error en deleteApplication:', error)
      throw error
    }
  }
}

// Candidates service
// Servicio para archivos adjuntos
export const attachmentsService = {
  // Subir archivo al storage y registrar en la base de datos
  async uploadFile(candidateId: number, file: File, description?: string) {
    try {
      console.log('📎 Subiendo archivo:', file.name, 'para candidato:', candidateId)
      
      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      const user = await supabase.auth.getUser()
      const userId = user.data.user?.id
      const filePath = `${userId}/${candidateId}/${uniqueFileName}`

      // Subir archivo al storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Error uploading file:', uploadError)
        throw uploadError
      }

      console.log('✅ Archivo subido al storage:', uploadData.path)

      // Registrar archivo en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from('candidate_attachments')
        .insert([
          {
            candidate_id: candidateId,
            original_name: file.name,
            file_name: uniqueFileName,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            description: description || null,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          }
        ])
        .select()
        .single()

      if (dbError) {
        console.error('❌ Error saving attachment to database:', dbError)
        // Intentar eliminar el archivo del storage si falló la DB
        await supabase.storage
          .from('candidates')
          .remove([uploadData.path])
        throw dbError
      }

      console.log('✅ Archivo registrado en base de datos:', dbData.id)

      // Encolar archivo para procesamiento de IA automáticamente
      try {
        console.log('🤖 Encolando archivo para procesamiento de IA...')
        
        // Obtener URL pública del archivo
        const { data: urlData } = supabase.storage
          .from('candidates')
          .getPublicUrl(uploadData.path)

        if (urlData?.publicUrl) {
          // Llamar al endpoint API para encolar el archivo
          const response = await fetch('/api/ai-processing/enqueue-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              candidateId: candidateId,
              attachmentId: dbData.id,
              fileName: file.name,
              fileUrl: urlData.publicUrl,
              fileSize: file.size,
              fileType: file.type,
              uploadedBy: (await supabase.auth.getUser()).data.user?.id
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log('✅ Archivo encolado para procesamiento de IA:', result.data?.queueId)
          } else {
            console.warn('⚠️ Error encolando archivo para IA:', response.status)
          }
        } else {
          console.warn('⚠️ No se pudo obtener URL pública para IA')
        }
      } catch (aiError) {
        console.warn('⚠️ Error encolando para IA (no crítico):', aiError)
        // No fallar la subida por error en IA
      }

      return dbData
    } catch (error) {
      console.error('❌ Upload file error:', error)
      throw error
    }
  },

  // Obtener archivos adjuntos de un candidato
  async getCandidateAttachments(candidateId: number) {
    try {
      // Obtener archivos sin JOIN (simplificado)
      const { data, error } = await supabase
        .from('candidate_attachments')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error getting candidate attachments:', error)
        throw error
      }
      
      // Agregar información mock del usuario (por ahora)
      const attachmentsWithUser = data?.map(attachment => ({
        ...attachment,
        uploaded_by_user: {
          email: 'admin@talentopro.com'
        }
      })) || []

      return attachmentsWithUser
    } catch (error) {
      console.error('❌ Get candidate attachments error:', error)
      return []
    }
  },

  // Descargar archivo
  async downloadFile(filePath: string, originalName: string) {
    try {
      console.log('📥 Descargando archivo:', filePath)
      
      const { data, error } = await supabase.storage
        .from('candidates')
        .download(filePath)

      if (error) {
        console.error('❌ Error downloading file:', error)
        throw error
      }

      // Crear URL de descarga y descargar automáticamente
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('✅ Archivo descargado:', originalName)
      return true
    } catch (error) {
      console.error('❌ Download file error:', error)
      throw error
    }
  },

  // Eliminar archivo
  async deleteFile(attachmentId: number, filePath: string) {
    try {
      console.log('🗑️ Eliminando archivo:', attachmentId, filePath)
      
      // Eliminar de la base de datos primero
      const { error: dbError } = await supabase
        .from('candidate_attachments')
        .delete()
        .eq('id', attachmentId)

      if (dbError) {
        console.error('❌ Error deleting attachment from database:', dbError)
        throw dbError
      }

      // Eliminar del storage
      const { error: storageError } = await supabase.storage
        .from('candidates')
        .remove([filePath])

      if (storageError) {
        console.error('❌ Error deleting file from storage:', storageError)
        // No lanzar error aquí, el registro ya se eliminó de la DB
      }

      console.log('✅ Archivo eliminado completamente')
      return true
    } catch (error) {
      console.error('❌ Delete file error:', error)
      throw error
    }
  },

  // Obtener URL pública temporal para previsualización
  async getFilePreviewUrl(filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('candidates')
        .createSignedUrl(filePath, 3600) // URL válida por 1 hora

      if (error) {
        console.error('❌ Error creating signed URL:', error)
        throw error
      }

      return data.signedUrl
    } catch (error) {
      console.error('❌ Get file preview URL error:', error)
      return null
    }
  },

  // Validar archivo antes de subir
  validateFile(file: File) {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ]

    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 50MB.')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Formatos soportados: PDF, Word, Excel, imágenes, ZIP.')
    }

    return true
  }
}

// Servicio para timeline del candidato (simplificado temporalmente)
export const timelineService = {
    // Obtener historial completo del candidato
  async getCandidateTimeline(candidateId: number) {
    try {
      // Usar directamente el fallback final ya que las funciones RPC y tabla detailed_timeline no existen
      // Fallback: datos básicos del candidato
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select(`
        *,
        users!candidates_assignee_id_fkey(name),
        applications!candidates_application_id_fkey(title)
      `)
      .eq('id', candidateId)
      .single()

    if (!candidateError && candidateData) {
      const timelineEvents = []
      
      // Evento de creación del candidato
      timelineEvents.push({
        id: 1,
        candidate_id: candidateId,
        action_type: 'candidate_created',
        action_description: 'Candidato creado en el sistema',
        performed_by_email: 'sistema@talentopro.com',
        created_at: candidateData.created_at,
        metadata: {
          stage: candidateData.stage,
          score: candidateData.score,
          assignee_id: candidateData.assignee_id,
          application_title: candidateData.applications?.title
        }
      })

      // Evento de cambio de etapa (si updated_at es diferente de created_at)
      if (candidateData.stage && candidateData.updated_at && 
          new Date(candidateData.updated_at).getTime() > new Date(candidateData.created_at).getTime()) {
        timelineEvents.push({
          id: 2,
          candidate_id: candidateId,
          action_type: 'stage_update',
          action_description: `Candidato movido a etapa: ${candidateData.stage}`,
          performed_by_email: candidateData.users?.name || 'Admin TalentoPro',
          created_at: candidateData.updated_at,
          metadata: {
            stage: candidateData.stage,
            score: candidateData.score,
            assignee_id: candidateData.assignee_id,
            assignee_name: candidateData.users?.name,
            application_title: candidateData.applications?.title
          }
        })
      }

      // Evento de puntuación si existe y es mayor a 0
      if (candidateData.score && candidateData.score > 0) {
        timelineEvents.push({
          id: 3,
          candidate_id: candidateId,
          action_type: 'score_update',
          action_description: `Puntuación asignada: ${candidateData.score}/10`,
          performed_by_email: candidateData.users?.name || 'Admin TalentoPro',
          created_at: candidateData.updated_at || candidateData.created_at,
          metadata: {
            stage: candidateData.stage,
            score: candidateData.score,
            assignee_id: candidateData.assignee_id,
            assignee_name: candidateData.users?.name
          }
        })
      }

      // Evento de asignación de responsable si existe
      if (candidateData.assignee_id && candidateData.users?.name) {
        timelineEvents.push({
          id: 4,
          candidate_id: candidateId,
          action_type: 'assignee_update',
          action_description: `Responsable asignado: ${candidateData.users.name}`,
          performed_by_email: 'Admin TalentoPro',
          created_at: candidateData.updated_at || candidateData.created_at,
          metadata: {
            stage: candidateData.stage,
            score: candidateData.score,
            assignee_id: candidateData.assignee_id,
            assignee_name: candidateData.users.name,
            application_title: candidateData.applications?.title
          }
        })
      }

      return timelineEvents
    }

      return []
    } catch (error) {
      console.error('❌ Get candidate timeline error:', error)
      return []
    }
  },

  // Obtener timeline de una aplicación
  async getApplicationTimeline(applicationId: number) {
    try {
      console.log('📋 Obteniendo timeline para aplicación:', applicationId)
      
      // Usar la función de la base de datos para obtener timeline de la aplicación
      const { data, error } = await supabase
        .rpc('get_application_timeline', { p_application_id: applicationId })

      if (error) {
        console.error('❌ Error getting application timeline:', error)
        throw error
      }

      console.log('✅ Timeline de aplicación obtenido:', data?.length || 0, 'eventos')
      return data || []
    } catch (error) {
      console.error('❌ Get application timeline error:', error)
      return []
    }
  },

  // Obtener evaluaciones del candidato para el timeline
  async getCandidateEvaluationsForTimeline(candidateId: number) {
    try {
      const { data, error } = await supabase
        .from('candidate_evaluations')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(evaluation => ({
        id: `evaluation-${evaluation.id}`,
        candidate_id: candidateId,
        action_type: 'evaluation_created',
        action_description: `Evaluación ${evaluation.evaluation_type}: ${evaluation.score}/10`,
        performed_by_email: 'Admin TalentoPro',
        created_at: evaluation.created_at,
        metadata: {
          stage: evaluation.stage,
          score: evaluation.score,
          evaluation_type: evaluation.evaluation_type,
          feedback: evaluation.feedback
        }
      })) || []
    } catch (error) {
      console.error('❌ Error getting evaluations for timeline:', error)
      return []
    }
  },

  // Obtener timeline completo (postulaciones + evaluaciones)
  async getCompleteTimeline(candidateId: number) {
    try {
      const [applicationEvents, evaluationEvents] = await Promise.all([
        this.getCandidateTimeline(candidateId),
        this.getCandidateEvaluationsForTimeline(candidateId)
      ])

      const allEvents = [...applicationEvents, ...evaluationEvents]
      
      // Ordenar por fecha - manejar diferentes estructuras de eventos
      allEvents.sort((a: any, b: any) => {
        const dateA = a.timestamp || a.created_at
        const dateB = b.timestamp || b.created_at
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })

      return allEvents
    } catch (error) {
      console.error('❌ Error getting complete timeline:', error)
      return []
    }
  },

  // Obtener timeline desde postulations (cuando la tabla exista)
  async getTimelineFromPostulations(candidateId: number) {
    try {
      const { data: postulations, error } = await supabase
        .from('postulations')
        .select(`
          *,
          applications (id, title, area, status)
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error getting timeline from postulations:', error)
        return []
      }

      const timelineEvents: any[] = []

      postulations?.forEach(postulation => {
        // Evento de postulación
        timelineEvents.push({
          id: `postulation-${postulation.id}`,
          type: 'application',
          title: `Se postuló a "${postulation.applications?.title}"`,
          description: 'Candidato registrado en esta postulación',
          stage: 'aplicación',
          application: postulation.applications?.title,
          applicationId: postulation.application_id,
          timestamp: postulation.applied_at,
          icon: '📝'
        })

        // Evento de etapa actual
        if (postulation.stage) {
          timelineEvents.push({
            id: `stage-${postulation.id}`,
            type: 'stage_change',
            title: `En etapa "${postulation.stage}"`,
            description: `En la postulación "${postulation.applications?.title}"`,
            stage: postulation.stage,
            application: postulation.applications?.title,
            applicationId: postulation.application_id,
            timestamp: postulation.updated_at,
            icon: this.getStageIcon(postulation.stage)
          })
        }
      })

      return timelineEvents
    } catch (error) {
      console.error('❌ Error getting timeline from postulations:', error)
      return []
    }
  },

  // Obtener icono según la etapa
  getStageIcon(stage: string) {
    const stageIcons = {
      'pre-entrevista': '📋',
      'primera': '👤',
      '1ª entrevista': '👤',
      'segunda': '👥',
      '2ª entrevista': '👥',
      'fit-cultural': '🤝',
      'fit cultural': '🤝',
      'seleccionado': '✅',
      'descartado': '❌',
      'stand-by': '⏸️'
    }
    return stageIcons[stage?.toLowerCase() as keyof typeof stageIcons] || '📍'
  }
}

// Servicio para gestión de usuarios
export const usersService = {
  // Obtener todos los usuarios (solo Admin RRHH)
  async getAllUsers() {
    try {
      console.log('👥 Obteniendo todos los usuarios...')
      
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('❌ Error de autenticación:', authError)
        throw new Error(`Error de autenticación: ${authError.message}`)
      }
      
      if (!user) {
        console.error('❌ No hay usuario autenticado')
        throw new Error('No hay usuario autenticado')
      }
      
      console.log('👤 Usuario autenticado:', user.email, 'ID:', user.id)
      
      // Intentar obtener usuarios
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error obteniendo usuarios:', error)
        console.error('📋 Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log(`✅ ${data?.length || 0} usuarios encontrados`)
      
      // Mostrar información de debugging
      if (data && data.length > 0) {
        console.log('📋 Usuarios encontrados:')
        data.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - ${user.role}`)
        })
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Error en getAllUsers:', error)
      throw error
    }
  },

  // Crear nuevo usuario usando API endpoint con service role
  async createUser(userData: {
    name: string
    email: string
    password: string
    role: 'Admin RRHH' | 'Entrevistador'
    area?: string
    position?: string
  }) {
    try {
      console.log('🆕 Creando nuevo usuario:', userData.email)

      // Verificar que el email no existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle()

      if (checkError) {
        console.error('❌ Error verificando email:', checkError)
        throw new Error(`Error verificando email: ${checkError.message}`)
      }

      if (existingUser) {
        throw new Error(`El email "${userData.email}" ya está registrado. Por favor usa un email diferente.`)
      }

      // Crear usuario usando el endpoint API con service role
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error creando usuario')
      }

      console.log('✅ Usuario creado exitosamente:', result.user)
      return result.user
    } catch (error) {
      console.error('❌ Error en createUser:', error)
      throw error
    }
  },

  // Actualizar usuario existente
  async updateUser(userId: string, updates: {
    name?: string
    email?: string
    role?: 'Admin RRHH' | 'Entrevistador'
    area?: string
    position?: string
    permissions?: string[]
  }) {
    try {
      console.log('📝 Actualizando usuario:', userId)
      console.log('📋 Actualizaciones:', updates)

      // Verificar que el usuario existe antes de actualizar
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Error obteniendo usuario a actualizar:', fetchError)
        throw new Error(`Usuario no encontrado: ${fetchError.message}`)
      }

      if (!existingUser) {
        throw new Error('Usuario no encontrado')
      }

      console.log('👤 Usuario encontrado:', existingUser.name, '(', existingUser.email, ')')

      // Solo actualizar permisos automáticamente si se cambia el rol Y no se proporcionan permisos específicos
      if (updates.role && !updates.permissions) {
        updates.permissions = this.getPermissionsByRole(updates.role)
        console.log('🔄 Permisos automáticos para rol', updates.role, ':', updates.permissions)
      }

      // Preparar datos de actualización
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Solo incluir campos que se van a actualizar
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.area !== undefined) updateData.area = updates.area
      if (updates.position !== undefined) updateData.position = updates.position
      if (updates.permissions !== undefined) updateData.permissions = updates.permissions

      console.log('📤 Datos a actualizar:', updateData)

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error actualizando usuario:', error)
        console.error('📋 Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Usuario actualizado exitosamente:', data)
      return data
    } catch (error) {
      console.error('❌ Error en updateUser:', error)
      throw error
    }
  },

  // Eliminar usuario (solo de tabla users, sin Supabase Auth)
  async deleteUser(userId: string) {
    try {
      console.log('🗑️ Eliminando usuario:', userId)

      // Verificar que el usuario existe
      const { data: userToDelete, error: fetchError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Error obteniendo usuario a eliminar:', fetchError)
        throw new Error(`Usuario no encontrado: ${fetchError.message}`)
      }

      if (!userToDelete) {
        throw new Error('Usuario no encontrado')
      }

      // Verificar que no se está eliminando el admin principal
      if (userToDelete.email === 'admin@talentopro.com') {
        throw new Error('No se puede eliminar al usuario administrador principal')
      }

      console.log('📋 Eliminando usuario:', userToDelete.name, '(', userToDelete.email, ')')

      // Eliminar de la tabla users
      const { error: dbError, count } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (dbError) {
        console.error('❌ Error eliminando usuario de DB:', dbError)
        throw new Error(`Error eliminando usuario: ${dbError.message}`)
      }

      // Verificar que realmente se eliminó
      if (count === 0) {
        console.error('❌ No se eliminó ningún usuario')
        throw new Error('No se pudo eliminar el usuario')
      }

      console.log('✅ Usuario eliminado exitosamente de la base de datos')
      console.log('⚠️ Nota: El usuario debe ser eliminado manualmente de Supabase Auth si es necesario')
      
      return true
    } catch (error) {
      console.error('❌ Error en deleteUser:', error)
      throw error
    }
  },

  // Obtener permisos por rol (configuración por defecto)
  getPermissionsByRole(role: 'Admin RRHH' | 'Entrevistador'): string[] {
    if (role === 'Admin RRHH') {
      return [
        'crear_postulaciones',
        'editar_postulaciones', 
        'eliminar_postulaciones',
        'crear_postulantes',
        'editar_postulantes',
        'eliminar_postulantes',
        'mover_etapas',
        'ver_todas_postulaciones',
        'gestionar_usuarios',
        'acceso_configuracion',
        'usar_ia'
      ]
    } else if (role === 'Entrevistador') {
      return [
        'crear_postulantes',
        'editar_postulantes',
        'crear_postulaciones',
        'editar_postulaciones',
        'mover_etapas',
        'ver_postulaciones_asignadas',
        'usar_ia'
      ]
    }
    return []
  },

  // Obtener todos los permisos disponibles
  getAllAvailablePermissions(): { category: string, permissions: { key: string, label: string, description: string }[] }[] {
    return [
      {
        category: 'Postulantes',
        permissions: [
          { key: 'crear_postulantes', label: 'Crear Postulantes', description: 'Agregar nuevos candidatos al sistema' },
          { key: 'editar_postulantes', label: 'Editar Postulantes', description: 'Modificar información de candidatos' },
          { key: 'eliminar_postulantes', label: 'Eliminar Postulantes', description: 'Eliminar candidatos del sistema' },
          { key: 'mover_etapas', label: 'Mover Etapas', description: 'Cambiar candidatos entre etapas del proceso' }
        ]
      },
      {
        category: 'Postulaciones',
        permissions: [
          { key: 'crear_postulaciones', label: 'Crear Postulaciones', description: 'Crear nuevas ofertas de trabajo' },
          { key: 'editar_postulaciones', label: 'Editar Postulaciones', description: 'Modificar ofertas de trabajo existentes' },
          { key: 'eliminar_postulaciones', label: 'Eliminar Postulaciones', description: 'Eliminar ofertas de trabajo' },
          { key: 'ver_todas_postulaciones', label: 'Ver Todas las Postulaciones', description: 'Acceso a todas las ofertas' },
          { key: 'ver_postulaciones_asignadas', label: 'Ver Postulaciones Asignadas', description: 'Solo ofertas asignadas al usuario' }
        ]
      },
      {
        category: 'Sistema',
        permissions: [
          { key: 'gestionar_usuarios', label: 'Gestionar Usuarios', description: 'Crear, editar y eliminar usuarios' },
          { key: 'acceso_configuracion', label: 'Acceso a Configuración', description: 'Acceso al panel de configuración' },
          { key: 'usar_ia', label: 'Usar IA', description: 'Acceso a funcionalidades de inteligencia artificial' }
        ]
      }
    ]
  },

  // Verificar si usuario tiene permiso específico
  hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes(permission)
  },

  // Obtener usuario por ID
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error obteniendo usuario:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ Error en getUserById:', error)
      throw error
    }
  }
}

// Servicio para duplicar candidatos
export const duplicateService = {
  // Obtener postulaciones de un candidato (desde tabla postulations si existe)
  async getCandidatePostulations(candidateId: number) {
    try {
      // Verificar si tabla postulations existe
      const postulationsExists = await this.checkPostulationsTableExists()
      
      if (postulationsExists) {
        console.log('📋 Obteniendo postulaciones desde tabla postulations')
        const { data, error } = await supabase
          .from('postulations')
          .select(`
            *,
            applications (id, title, area, status)
          `)
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ Error getting postulations:', error)
          return []
        }

        return data || []
      } else {
        console.log('📋 Tabla postulations no existe, usando candidates')
        return []
      }
    } catch (error) {
      console.error('❌ Get candidate postulations error:', error)
      return []
    }
  },

  // Verificar si tabla postulations existe
  async checkPostulationsTableExists() {
    try {
      const { data, error } = await supabase
        .from('postulations')
        .select('id')
        .limit(1)

      return !error
    } catch (error) {
      return false
    }
  },

  // Obtener aplicaciones activas (excluyendo la actual del candidato)
  async getActiveApplications(excludeApplicationId?: number) {
    try {
      console.log('🔍 Obteniendo aplicaciones activas...')
      
      let query = supabase
        .from('applications')
        .select('id, title, area, status, created_at')
        .eq('status', 'Activa') // Solo procesos activos (corregido: 'Activa' con mayúscula)
        .order('created_at', { ascending: false })

      // Excluir la aplicación actual del candidato
      if (excludeApplicationId) {
        query = query.neq('id', excludeApplicationId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error getting active applications:', error)
        throw error
      }

      console.log('✅ Aplicaciones activas obtenidas:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Get active applications error:', error)
      return []
    }
  },

  // Obtener usuarios para asignar como responsables
  async getAvailableUsers() {
    try {
      console.log('👥 Obteniendo usuarios disponibles...')
      
      const { data, error } = await supabase
        .from('users') // Corregido: usar tabla 'users' existente
        .select('id, email, name')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error getting users:', error)
        // Fallback: retornar usuarios mock si no existe la tabla
        return [
          { id: 'admin', email: 'admin@talentopro.com', name: 'Administrador' },
          { id: 'hr1', email: 'hr1@talentopro.com', name: 'HR Manager' },
          { id: 'hr2', email: 'hr2@talentopro.com', name: 'Recruiter' }
        ]
      }

      console.log('✅ Usuarios obtenidos:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Get users error:', error)
      // Fallback con usuarios mock
      return [
        { id: 'admin', email: 'admin@talentopro.com', name: 'Administrador' },
        { id: 'hr1', email: 'hr1@talentopro.com', name: 'HR Manager' },
        { id: 'hr2', email: 'hr2@talentopro.com', name: 'Recruiter' }
      ]
    }
  },

  // Vincular candidato existente a otra aplicación (NO crear nuevo candidato)
  async duplicateCandidate(candidateId: number, targetApplicationId: number, stage: string, assigneeId: string | null) {
    try {
      console.log('🔗 Vinculando candidato existente a nuevo proceso:', { candidateId, targetApplicationId, stage, assigneeId })

      // Verificar que el candidato existe
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('name')
        .eq('id', candidateId)
        .single()

      if (candidateError || !candidate) {
        console.error('❌ Error: candidato no encontrado:', candidateError)
        throw candidateError || new Error('Candidato no encontrado')
      }

      // Verificar que la aplicación existe
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('title')
        .eq('id', targetApplicationId)
        .single()

      if (appError || !application) {
        console.error('❌ Error: aplicación no encontrada:', appError)
        throw appError || new Error('Aplicación no encontrada')
      }

      // Verificar si tabla postulations existe
      const postulationsExists = await this.checkPostulationsTableExists()
      
      if (postulationsExists) {
        console.log('✅ Usando tabla postulations (vinculación real)')
        return this.linkCandidateWithPostulations(candidateId, targetApplicationId, stage, assigneeId, candidate, application)
      } else {
        console.log('⚠️ Tabla postulations no existe, usando método temporal')
        return this.linkCandidateTemporary(candidateId, targetApplicationId, stage, assigneeId, candidate, application)
      }
    } catch (error) {
      console.error('❌ Link candidate error:', error)
      throw error
    }
  },

  // Vinculación REAL usando tabla postulations
  async linkCandidateWithPostulations(candidateId: number, targetApplicationId: number, stage: string, assigneeId: string | null, candidate: any, application: any) {
    try {
      // Crear nueva postulación vinculando el candidato existente al nuevo proceso
      const { data, error } = await supabase
        .from('postulations')
        .insert({
          candidate_id: candidateId,
          application_id: targetApplicationId,
          stage: stage,
          status: 'active',
          assignee_id: assigneeId,
          score: 0.0,
          applied_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating postulation:', error)
        
        // Manejar error de duplicado
        if (error.code === '23505') { // UNIQUE constraint violation
          throw new Error(`El candidato ${candidate.name} ya está postulado a ${application.title}`)
        }
        
        throw error
      }

      console.log('✅ Candidato vinculado exitosamente (REAL):', data)
      console.log(`🎯 ${candidate.name} ahora está en ${application.title} con etapa ${stage}`)
      
      return data
    } catch (error) {
      console.error('❌ Link candidate with postulations error:', error)
      throw error
    }
  },

  // Vinculación TEMPORAL usando tabla candidates
  async linkCandidateTemporary(candidateId: number, targetApplicationId: number, stage: string, assigneeId: string | null, candidate: any, application: any) {
    try {
      // Obtener datos del candidato original
      const { data: originalCandidate, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single()

      if (fetchError || !originalCandidate) {
        throw fetchError || new Error('Candidato no encontrado')
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert({
          name: originalCandidate.name,
          email: originalCandidate.email,
          phone: originalCandidate.phone,
          position: originalCandidate.position,
          experience: originalCandidate.experience,
          location: originalCandidate.location,
          stage: stage,
          score: 0.0,
          status: 'pending',
          assignee_id: assigneeId,
          application_id: targetApplicationId,
          applied_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating candidate entry:', error)
        
        // Manejar error de duplicado
        if (error.code === '23505') { // UNIQUE constraint violation
          throw new Error(`Error creando entrada para ${candidate.name} en ${application.title}`)
        }
        
        throw error
      }

      console.log('✅ Candidato vinculado exitosamente (TEMPORAL):', data)
      console.log(`🎯 ${candidate.name} ahora está en ${application.title} con etapa ${stage}`)
      console.log('⚠️ NOTA: Ejecutar supabase/migration-postulations.sql para vinculación real')
      
      return data
    } catch (error) {
      console.error('❌ Link candidate temporary error:', error)
      throw error
    }
  }
}

export const candidatesService = {
  async getAllCandidates(): Promise<Candidate[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          users!candidates_assignee_id_fkey(name),
          applications!candidates_application_id_fkey(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get all candidates error:', error)
      return []
    }
  },

  async getCandidatesByApplication(applicationId: number): Promise<Candidate[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      console.log('🔍 Cargando candidatos para aplicación:', applicationId)
      
      // Verificar si tabla postulations existe
      const postulationsExists = await duplicateService.checkPostulationsTableExists()
      
      let candidates: any[] = []
      
      if (postulationsExists) {
        console.log('📋 Usando tabla postulations para obtener candidatos')
        
        // Obtener candidatos de la tabla postulations (vinculación real)
        const { data: postulationsData, error: postError } = await supabase
          .from('postulations')
          .select(`
            *,
            candidates!inner(*),
            applications!inner(*),
            users!postulations_assignee_id_fkey(name)
          `)
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false })

        if (postError) {
          console.error('Error fetching from postulations:', postError)
        } else {
          // Mapear datos de postulations a formato de candidatos
          const postulationsCandidates = (postulationsData || []).map((post: any) => {
            const assigneeName = post.users?.name || null
            
            return {
              id: post.candidates.id,
              name: post.candidates.name,
              email: post.candidates.email,
              phone: post.candidates.phone,
              position: post.candidates.position,
              experience: post.candidates.experience,
              location: post.candidates.location,
              stage: post.stage, // Etapa de la postulación específica
              score: post.score, // Score de la postulación específica
              status: post.status,
              assignee_id: post.assignee_id,
              assignee: assigneeName, // Nombre del responsable
              application_id: post.application_id,
              applied_at: post.applied_at,
              created_at: post.created_at,
              updated_at: post.updated_at,
              // Datos adicionales
              applications: post.applications,
              postulation_id: post.id // ID de la postulación para referencia
            }
          })
          
          candidates = postulationsCandidates
          console.log('📊 Candidatos desde postulations:', candidates.length)
        }
      }
      
      // También obtener candidatos del método tradicional (compatibilidad)
      const { data: traditionalCandidates, error: tradError } = await supabase
        .from('candidates')
        .select(`
          *,
          users!candidates_assignee_id_fkey(name),
          applications!candidates_application_id_fkey(title)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

      if (tradError) {
        console.error('Error fetching traditional candidates:', tradError)
      } else {
        const traditionalData = traditionalCandidates || []
        console.log('📊 Candidatos tradicionales:', traditionalData.length)
        
        // Si no hay candidatos de postulations, usar todos los candidatos tradicionales
        if (candidates.length === 0) {
          console.log('📋 No hay postulations, usando candidatos tradicionales')
          candidates = traditionalData.map(c => ({
            ...c,
            assignee: c.users?.name || null, // Mapear nombre del responsable
            assignee_id: c.assignee_id // Mantener el ID del responsable
          }))
        } else {
          // Combinar candidatos, evitando duplicados por email
          const existingEmails = new Set(candidates.map(c => c.email))
          const newCandidates = traditionalData
            .filter(c => !existingEmails.has(c.email))
            .map(c => ({
              ...c,
              assignee: c.users?.name || null, // Mapear nombre del responsable
              assignee_id: c.assignee_id // Mantener el ID del responsable
            }))
          
          candidates = [...candidates, ...newCandidates]
        }
      }
      
      console.log('📊 Total candidatos encontrados:', candidates.length)

      // Cargar evaluaciones para cada candidato y calcular puntaje promedio
      const candidatesWithEvaluations = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            // Obtener evaluaciones del candidato
            const { data: evaluations, error: evalError } = await supabase
              .from('candidate_evaluations')
              .select('score')
              .eq('candidate_id', candidate.id)

            if (evalError) {
              console.log('⚠️ Error cargando evaluaciones para candidato', candidate.id, ':', evalError)
              return {
                ...candidate,
                score: candidate.score || 0 // Usar score existente o 0
              }
            }

            // Calcular puntaje promedio
            const validScores = evaluations?.filter(e => e.score !== null && e.score !== undefined) || []
            const averageScore = validScores.length > 0 
              ? validScores.reduce((sum, evaluation) => sum + evaluation.score, 0) / validScores.length
              : candidate.score || 0

            // Redondear a 1 decimal
            const roundedScore = Math.round(averageScore * 10) / 10

            console.log(`📈 Candidato ${candidate.name}: ${validScores.length} evaluaciones, promedio: ${roundedScore.toFixed(1)}`)

            return {
              ...candidate,
              score: roundedScore
            }
          } catch (evalError) {
            console.log('⚠️ Error procesando evaluaciones para candidato', candidate.id, ':', evalError)
            return {
              ...candidate,
              score: candidate.score || 0
            }
          }
        })
      )

      console.log('✅ Candidatos procesados con evaluaciones:', candidatesWithEvaluations.length)
      return candidatesWithEvaluations
    } catch (error) {
      console.error('Get candidates error:', error)
      return []
    }
  },

  async getCandidateById(id: number): Promise<Candidate | null> {
    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          users!candidates_assignee_id_fkey(name),
          applications!candidates_application_id_fkey(title)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      if (!data) return null

      // Cargar evaluaciones del candidato y calcular puntaje promedio
      try {
        const { data: evaluations, error: evalError } = await supabase
          .from('candidate_evaluations')
          .select('score')
          .eq('candidate_id', id)

        if (evalError) {
          console.log('⚠️ Error cargando evaluaciones para candidato', id, ':', evalError)
          return {
            ...data,
            score: data.score || 0
          }
        }

        // Calcular puntaje promedio
        const validScores = evaluations?.filter(e => e.score !== null && e.score !== undefined) || []
        const averageScore = validScores.length > 0 
          ? validScores.reduce((sum, evaluation) => sum + evaluation.score, 0) / validScores.length
          : data.score || 0

        // Redondear a 1 decimal
        const roundedScore = Math.round(averageScore * 10) / 10

        console.log(`📈 Candidato ${data.name}: ${validScores.length} evaluaciones, promedio: ${roundedScore.toFixed(1)}`)

        return {
          ...data,
          score: roundedScore
        }
      } catch (evalError) {
        console.log('⚠️ Error procesando evaluaciones para candidato', id, ':', evalError)
        return {
          ...data,
          score: data.score || 0
        }
      }
    } catch (error) {
      console.error('Get candidate error:', error)
      return null
    }
  },

  async createGlobalCandidate(candidateData: {
    name: string
    email: string
    phone?: string
    position?: string
    experience?: string
    location?: string
    source?: string
    skills?: string[]
    cv_url?: string
    video_url?: string
    ai_analysis?: any
  }): Promise<any | null> {
    if (!isSupabaseConfigured()) {
      // Retornar datos mock para testing local
      return {
        id: Date.now(),
        ...candidateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    try {
      const { data, error } = await supabase
        .from('global_candidates')
        .insert(candidateData)
        .select()
        .single()

      if (error) {
        // Si la tabla no existe, crear candidato mock
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('⚠️ Tabla global_candidates no existe. Usando modo fallback.')
          return {
            id: Date.now(),
            ...candidateData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Create global candidate error:', error)
      // Fallback a datos mock
      return {
        id: Date.now(),
        ...candidateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },

  async findCandidateByEmail(email: string): Promise<any | null> {
    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('global_candidates')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Si la tabla no existe, retornar null silenciosamente
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('⚠️ Tabla global_candidates no existe. Ejecutar schema.sql en Supabase.')
          return null
        }
        throw error
      }
      return data || null
    } catch (error) {
      console.error('Find candidate by email error:', error)
      return null
    }
  },

  async createCandidateApplication(candidateId: number, applicationId: number, additionalData?: any): Promise<any | null> {
    if (!isSupabaseConfigured()) {
      return {
        id: Date.now(),
        candidate_id: candidateId,
        application_id: applicationId,
        stage: 'Pre-entrevista',
        score: null,
        status: 'pending',
        assignee_id: null,
        applied_at: new Date().toISOString(),
        ...additionalData
      }
    }

    try {
      const applicationData = {
        candidate_id: candidateId,
        application_id: applicationId,
        stage: 'Pre-entrevista',
        score: null,
        status: 'pending',
        assignee_id: null,
        applied_at: new Date().toISOString(),
        ...additionalData
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert(applicationData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create candidate application error:', error)
      return null
    }
  },

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate | null> {
    if (!isSupabaseConfigured()) {
      const newCandidate: Candidate = {
        ...candidateData,
        id: Date.now(), // Use timestamp as ID for local testing
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return newCandidate
    }

    try {
      console.log('🔍 Intentando crear candidato con datos:', candidateData)
      
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidateData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase al crear candidato:', error)
        console.error('❌ Código de error:', error.code)
        console.error('❌ Mensaje de error:', error.message)
        console.error('❌ Detalles:', error.details)
        throw error
      }
      
      console.log('✅ Candidato creado exitosamente:', data)
      return data
    } catch (error) {
      console.error('❌ Create candidate error:', error)
      console.error('❌ Tipo de error:', typeof error)
      console.error('❌ Error completo:', JSON.stringify(error, null, 2))
      return null
    }
  },

  async updateCandidate(id: number, updates: Partial<Candidate>, applicationId?: number): Promise<Candidate | null> {
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const hasValidCredentials = !!(supabaseUrl && supabaseAnonKey && 
      !supabaseUrl.includes('placeholder') && 
      !supabaseAnonKey.includes('placeholder'))
    
    if (!hasValidCredentials) {
      // For local testing, just return the updated data
      return {
        id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Candidate
    }

    try {
      // Obtener datos anteriores del candidato para detectar cambios de etapa
      let previousCandidate: { stage: string; name: string } | null = null
      let applicationTitle = ''
      
      if (updates.stage) {
        try {
          const { data: prevData } = await supabase
            .from('candidates')
            .select('stage, name')
            .eq('id', id)
            .single()
          previousCandidate = prevData
          
          // Obtener título de la aplicación si tenemos applicationId
          if (applicationId) {
            const { data: appData } = await supabase
              .from('applications')
              .select('title')
              .eq('id', applicationId)
              .single()
            applicationTitle = appData?.title || 'Proceso de reclutamiento'
          }
        } catch (prevError) {
          console.log('ℹ️ No se pudo obtener datos anteriores:', prevError)
        }
      }
      // Asegurar que no intentemos actualizar columnas que no existen
      const validUpdates = { ...updates }
      
      // Remove assignee property if it exists (not part of Candidate type)
      if ('assignee' in validUpdates) {
        delete (validUpdates as any).assignee
      }

      console.log('🔄 Actualizando candidato:', id, 'Application:', applicationId)
      
      // Verificar si tabla postulations existe y si debemos actualizar ahí
      const postulationsExists = await duplicateService.checkPostulationsTableExists()
      let postulationUpdated = false
      
      if (postulationsExists && applicationId) {
        console.log('📋 Verificando si candidato existe en tabla postulations')
        
        // Verificar si existe una postulación para este candidato y aplicación
        const { data: postulation, error: postulationError } = await supabase
          .from('postulations')
          .select('id')
          .eq('candidate_id', id)
          .eq('application_id', applicationId)
          .maybeSingle() // Usar maybeSingle en lugar de single para evitar error 406
        
        if (postulation) {
          console.log('🎯 Actualizando en tabla postulations:', postulation.id)
          
          // Preparar updates específicos para postulations
          const postulationUpdates: any = {}
          
          // Mapear campos de candidato a campos de postulación
          if (validUpdates.stage) postulationUpdates.stage = validUpdates.stage
          if (validUpdates.score !== undefined) postulationUpdates.score = validUpdates.score
          if (validUpdates.assignee_id) postulationUpdates.assignee_id = validUpdates.assignee_id
          
          postulationUpdates.updated_at = new Date().toISOString()
          
          const { error: postError } = await supabase
            .from('postulations')
            .update(postulationUpdates)
            .eq('id', postulation.id)
          
          if (!postError) {
            console.log('✅ Postulación actualizada exitosamente')
            postulationUpdated = true
          } else {
            console.error('❌ Error actualizando postulación:', postError)
          }
        } else {
          console.log('ℹ️ No existe postulación para este candidato/aplicación')
          console.log('💡 Las postulaciones se crean manualmente o mediante el flujo de duplicación')
        }
      }
      
      // Actualizar tabla candidates (para compatibilidad y datos base del candidato)
      console.log('📋 Actualizando tabla candidates con:', validUpdates)
      
      const { data, error } = await supabase
        .from('candidates')
        .update(validUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Update candidate error:', error)
        console.error('❌ Código de error:', error.code)
        console.error('❌ Mensaje de error:', error.message)
        console.error('❌ Detalles:', error.details)
        console.error('❌ Hint:', error.hint)
        throw error
      }
      
      console.log(`✅ Candidato actualizado - Candidates: ✓ ${postulationUpdated ? 'Postulations: ✓' : ''}`)
      
      // Enviar notificaciones por email si cambió la etapa (temporalmente deshabilitado)
      if (updates.stage && previousCandidate && updates.stage !== previousCandidate.stage) {
        try {
          console.log('📧 Notificaciones de cambio de etapa deshabilitadas temporalmente')
          // TODO: Rehabilitar notificaciones cuando se resuelva el error
        } catch (notificationError) {
          console.error('⚠️ Error en notificaciones (deshabilitadas):', notificationError)
        }
      }
      
      return data
    } catch (error) {
      console.error('❌ Update candidate error:', error)
      console.error('❌ Tipo de error:', typeof error)
      console.error('❌ Error completo:', JSON.stringify(error, null, 2))
      
      // Si hay un error, intentar retornar datos mock para que la UI no se rompa
      return {
        id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Candidate
    }
  },

  async getCandidateNotes(candidateId: number): Promise<CandidateNote[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('candidate_notes')
        .select(`
          *,
          users!candidate_notes_author_id_fkey(name)
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get candidate notes error:', error)
      return []
    }
  },

  async createCandidateNote(noteData: Omit<CandidateNote, 'id' | 'created_at'>): Promise<CandidateNote | null> {
    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      // Asegurar que los datos tengan la estructura correcta
      const validNoteData = {
        candidate_id: noteData.candidate_id,
        author_id: noteData.author_id,
        content: noteData.content,
        stage: noteData.stage || 'General', // Campo requerido
        score: noteData.score || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('candidate_notes')
        .insert(validNoteData)
        .select()
        .single()

      if (error) throw error

      // Registrar en timeline
      await this.logTimelineAction('candidate', noteData.candidate_id, 'note_created', 
        `Nota agregada en etapa ${noteData.stage}`, undefined, undefined, undefined, noteData.content)

      return data
    } catch (error) {
      console.error('Create candidate note error:', error)
      console.error('Note data that caused error:', noteData)
      return null
    }
  },

  // Eliminar candidato y todos sus duplicados
  async deleteCandidate(candidateId: number) {
    try {
      console.log('🗑️ Eliminando candidato:', candidateId)
      
      // Primero obtener información del candidato
      const { data: candidate, error: fetchError } = await supabase
        .from('candidates')
        .select('email, name')
        .eq('id', candidateId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching candidate:', fetchError)
        throw fetchError
      }

      if (!candidate) {
        throw new Error('Candidato no encontrado')
      }

      console.log(`🗑️ Eliminando TODOS los candidatos con email: ${candidate.email}`)

      // PRIMERO: Obtener todos los IDs de candidatos con este email (antes de eliminar)
      const { data: candidatesWithEmail } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', candidate.email)

      const candidateIds = candidatesWithEmail?.map(c => c.id) || []
      console.log(`📋 Candidatos a eliminar: ${candidateIds.join(', ')}`)

      // SEGUNDO: Eliminar postulaciones si existen
      try {
        const postulationsExists = await duplicateService.checkPostulationsTableExists()
        if (postulationsExists && candidateIds.length > 0) {
          console.log('🗑️ Eliminando postulaciones del candidato...')
          
          const { error: postError, count: postCount } = await supabase
            .from('postulations')
            .delete({ count: 'exact' })
            .in('candidate_id', candidateIds)

          if (!postError && postCount && postCount > 0) {
            console.log(`🗑️ Eliminadas ${postCount} postulaciones`)
          } else if (postError) {
            console.log('⚠️ Error eliminando postulaciones:', postError)
          } else {
            console.log('ℹ️ No hay postulaciones para eliminar')
          }
        }
      } catch (postError) {
        console.log('⚠️ Error verificando/eliminando postulaciones:', postError)
      }

      // TERCERO: Eliminar TODOS los candidatos con el mismo email
      const { error, count } = await supabase
        .from('candidates')
        .delete({ count: 'exact' })
        .eq('email', candidate.email)

      if (error) {
        console.error('❌ Error deleting candidates:', error)
        throw error
      }

      console.log(`✅ Eliminados ${count} candidato(s) con email ${candidate.email}`)

      return { deleted: count, email: candidate.email, name: candidate.name }
    } catch (error) {
      console.error('❌ Delete candidate error:', error)
      throw error
    }
  },

  // Función utilitaria para limpiar duplicados temporales
  async cleanupDuplicatedCandidates() {
    try {
      console.log('🧹 Limpiando candidatos duplicados...')
      
      // Buscar candidatos con el mismo email
      const { data: candidates, error } = await supabase
        .from('candidates')
        .select('id, email, name, created_at')
        .order('email, created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching candidates for cleanup:', error)
        return { cleaned: 0, errors: [error.message] }
      }

      if (!candidates || candidates.length === 0) {
        console.log('ℹ️ No hay candidatos para limpiar')
        return { cleaned: 0, errors: [] }
      }

      // Agrupar por email
      const candidatesByEmail = candidates.reduce((acc, candidate) => {
        if (!acc[candidate.email]) {
          acc[candidate.email] = []
        }
        acc[candidate.email].push(candidate)
        return acc
      }, {} as Record<string, any[]>)

      let totalCleaned = 0
      const errors: string[] = []

      // Para cada email con duplicados, mantener solo el más antiguo
      for (const [email, candidateGroup] of Object.entries(candidatesByEmail)) {
        if (candidateGroup.length > 1) {
          // Mantener el más antiguo (primero en la lista ordenada)
          const [keep, ...duplicates] = candidateGroup
          
          console.log(`🗑️ Email ${email}: manteniendo ID ${keep.id}, eliminando ${duplicates.length} duplicados`)

          // Eliminar los duplicados
          const duplicateIds = duplicates.map(d => d.id)
          const { error: deleteError, count } = await supabase
            .from('candidates')
            .delete({ count: 'exact' })
            .in('id', duplicateIds)

          if (deleteError) {
            errors.push(`Error eliminando duplicados de ${email}: ${deleteError.message}`)
          } else {
            totalCleaned += count || 0
            console.log(`✅ Eliminados ${count} duplicados de ${email}`)
          }
        }
      }

      console.log(`🧹 Limpieza completa: ${totalCleaned} candidatos duplicados eliminados`)
      return { cleaned: totalCleaned, errors }
    } catch (error: any) {
      console.error('❌ Cleanup duplicates error:', error)
      return { cleaned: 0, errors: [error.message] }
    }
  },

  async createCandidateEvaluation(evaluationData: {
    candidate_id: number;
    evaluator_id?: string | null;
    evaluation_type: string;
    score: number;
    feedback: string;
    stage: string;
  }): Promise<any> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, no se puede crear evaluación')
      return null
    }

    try {
      console.log('🎯 Creando evaluación con datos:', evaluationData)

      const { data, error } = await supabase
        .from('candidate_evaluations')
        .insert({
          candidate_id: evaluationData.candidate_id,
          evaluator_id: evaluationData.evaluator_id,
          evaluation_type: evaluationData.evaluation_type,
          score: evaluationData.score,
          feedback: evaluationData.feedback,
          stage: evaluationData.stage
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase al crear evaluación:', error)
        console.error('❌ Código:', error.code)
        console.error('❌ Mensaje:', error.message)
        console.error('❌ Detalles:', error.details)
        
        // Verificar si es un error de tabla no existente
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('❌ LA TABLA candidate_evaluations NO EXISTE!')
          console.error('🛠️ SOLUCIÓN: Ejecuta el script supabase/evaluations-only.sql en Supabase SQL Editor')
          console.error('📋 Pasos:')
          console.error('   1. Ve a tu dashboard de Supabase')
          console.error('   2. SQL Editor → Nueva consulta')
          console.error('   3. Copia y pega el contenido de supabase/evaluations-only.sql')
          console.error('   4. Ejecuta la consulta')
        }
        
        throw error
      }

      console.log('✅ Evaluación creada exitosamente:', data)

      // Registrar en timeline (solo si la función existe)
      try {
        await this.logTimelineAction('candidate', evaluationData.candidate_id, 'evaluation_created',
          `Evaluación ${evaluationData.evaluation_type} con puntaje ${evaluationData.score}/10 en etapa ${evaluationData.stage}`,
          evaluationData.evaluator_id || undefined, undefined, undefined, evaluationData.feedback)
      } catch (timelineError) {
        console.log('⚠️ No se pudo registrar en timeline (tabla puede no existir):', timelineError)
      }

      return data
    } catch (error) {
      console.error('❌ Create candidate evaluation error:', error)
      console.error('❌ Tipo de error:', typeof error)
      console.error('❌ Error completo:', JSON.stringify(error, null, 2))
      return null
    }
  },

  async getCandidateEvaluations(candidateId: number): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, retornando array vacío')
      return []
    }

    try {
      console.log('🔍 Buscando evaluaciones para candidato ID:', candidateId)
      
      // Obtener evaluaciones sin join con usuarios (simplificado)
      const { data, error } = await supabase
        .from('candidate_evaluations')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error getting evaluations:', error)
        throw error
      }

      console.log('📊 Evaluaciones encontradas:', data?.length || 0)

      // Agregar información de la aplicación y usuario mock
      const evaluationsWithApp = data?.map(evaluation => ({
        ...evaluation,
        applications: {
          id: 7, // ID de la aplicación "test"
          title: 'Postulación test'
        },
        users: {
          email: 'admin@talentopro.com',
          name: 'Administrador'
        }
      })) || []

      console.log('✅ Evaluaciones procesadas:', evaluationsWithApp.length)
      console.log('📋 Evaluaciones que se devuelven:', evaluationsWithApp)
      return evaluationsWithApp
    } catch (error) {
      console.error('❌ Get candidate evaluations error:', error)
      return []
    }
  },

  async createCandidateAttachment(attachmentData: {
    candidate_id: number;
    file_name: string;
    file_type: string;
    file_url: string;
    file_size: number;
    uploaded_by?: string;
  }): Promise<any> {
    if (!isSupabaseConfigured()) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('candidate_attachments')
        .insert(attachmentData)
        .select()
        .single()

      if (error) throw error

      // Registrar en timeline
      await this.logTimelineAction('candidate', attachmentData.candidate_id, 'attachment_uploaded',
        `Archivo ${attachmentData.file_name} subido`, attachmentData.uploaded_by, undefined, undefined, attachmentData.file_url)

      return data
    } catch (error) {
      console.error('Create candidate attachment error:', error)
      return null
    }
  },

  async getCandidateAttachments(candidateId: number): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('candidate_attachments')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get candidate attachments error:', error)
      return []
    }
  },

  async logTimelineAction(
    entityType: string,
    entityId: number,
    actionType: string,
    actionDescription: string,
    performedBy?: string,
    performedByEmail?: string,
    previousValue?: string,
    newValue?: string,
    metadata?: any
  ): Promise<void> {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      // Intentar usar la función RPC si existe
      await supabase.rpc('log_timeline_action', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_action_type: actionType,
        p_action_description: actionDescription,
        p_performed_by: performedBy,
        p_performed_by_email: performedByEmail,
        p_previous_value: previousValue,
        p_new_value: newValue,
        p_metadata: metadata
      })
    } catch (error: any) {
      // Si la función no existe, usar inserción directa como fallback
      if (error.message?.includes('function') || error.message?.includes('404')) {
        console.log('ℹ️ Función log_timeline_action no disponible, usando inserción directa')
        
        try {
          // Insertar directamente en candidate_timeline si es un candidato
          if (entityType === 'candidate') {
            await supabase
              .from('candidate_timeline')
              .insert({
                candidate_id: entityId,
                action_type: actionType,
                action_description: actionDescription,
                performed_by: performedBy,
                performed_by_email: performedByEmail,
                previous_value: previousValue,
                new_value: newValue,
                metadata: metadata || {},
                created_at: new Date().toISOString()
              })
          }
        } catch (insertError) {
          console.error('Log timeline action fallback error:', insertError)
        }
      } else {
        console.error('Log timeline action error:', error)
      }
    }
  },

  async getDetailedTimeline(entityType: string, entityId: number): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('detailed_timeline')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get detailed timeline error:', error)
      return []
    }
  },

  async uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      // Simular URL para testing local
      return `mock://${bucket}/${path}/${file.name}`
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        // Si el bucket no existe, retornar URL mock
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
          console.log('⚠️ Storage bucket no existe. Ejecutar schema.sql en Supabase.')
          return `mock://${bucket}/${path}/${file.name}`
        }
        throw error
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Upload file error:', error)
      // Fallback a URL mock
      return `mock://${bucket}/${path}/${file.name}`
    }
  },




}

// Analytics service
export const analyticsService = {
  async getApplicationStats(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('application_stats')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get application stats error:', error)
      return []
    }
  },

  async getUserStats(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get user stats error:', error)
      return []
    }
  }
}

// Dashboard Service para entrevistas asignadas
export const dashboardService = {
  /**
   * Obtiene todas las entrevistas asignadas a un usuario específico
   */
  async getAssignedInterviews(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, retornando datos mock')
      return []
    }

    try {
      console.log('📋 Obteniendo entrevistas asignadas para usuario:', userId)
      
      const interviews: any[] = []
      
      // Obtener candidatos de tabla candidates donde el usuario es el assignee
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          *,
          applications!candidates_application_id_fkey(
            id,
            title,
            area,
            status
          )
        `)
        .eq('assignee_id', userId)
        .not('stage', 'eq', 'seleccionado')
        .not('stage', 'eq', 'descartado')
        .order('updated_at', { ascending: false })
      
      if (!candidatesError && candidatesData) {
        candidatesData.forEach(candidate => {
          if (candidate.applications) {
            interviews.push({
              id: `candidate-${candidate.id}`,
              type: 'candidate',
              candidateId: candidate.id,
              candidateName: candidate.name,
              candidateEmail: candidate.email,
              candidatePhone: candidate.phone,
              position: candidate.position,
              stage: candidate.stage,
              score: candidate.score,
              applicationId: candidate.application_id,
              applicationTitle: candidate.applications.title,
              applicationArea: candidate.applications.area,
              applicationStatus: candidate.applications.status,
              assignedAt: candidate.updated_at,
              priority: this.getStagePriority(candidate.stage),
              stageDisplay: this.getStageDisplayName(candidate.stage)
            })
          }
        })
      }
      
      // Obtener candidatos de tabla postulations si existe
      try {
        const postulationsExists = await duplicateService.checkPostulationsTableExists()
        
        if (postulationsExists) {
          const { data: postulationsData, error: postulationsError } = await supabase
            .from('postulations')
            .select(`
              *,
              candidates!inner(*),
              applications!inner(*)
            `)
            .eq('assignee_id', userId)
            .not('stage', 'eq', 'seleccionado')
            .not('stage', 'eq', 'descartado')
            .order('updated_at', { ascending: false })
          
          if (!postulationsError && postulationsData) {
            postulationsData.forEach(postulation => {
              // Evitar duplicados por email
              const exists = interviews.some(interview => 
                interview.candidateEmail === postulation.candidates.email &&
                interview.applicationId === postulation.application_id
              )
              
              if (!exists) {
                interviews.push({
                  id: `postulation-${postulation.id}`,
                  type: 'postulation',
                  candidateId: postulation.candidates.id,
                  candidateName: postulation.candidates.name,
                  candidateEmail: postulation.candidates.email,
                  candidatePhone: postulation.candidates.phone,
                  position: postulation.candidates.position,
                  stage: postulation.stage,
                  score: postulation.score,
                  applicationId: postulation.application_id,
                  applicationTitle: postulation.applications.title,
                  applicationArea: postulation.applications.area,
                  applicationStatus: postulation.applications.status,
                  assignedAt: postulation.updated_at,
                  priority: this.getStagePriority(postulation.stage),
                  stageDisplay: this.getStageDisplayName(postulation.stage)
                })
              }
            })
          }
        }
      } catch (postError) {
        console.log('ℹ️ Tabla postulations no disponible:', postError)
      }
      
      // Ordenar por prioridad de etapa y fecha
      interviews.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
      })
      
      console.log(`📊 ${interviews.length} entrevistas asignadas encontradas`)
      return interviews
      
    } catch (error) {
      console.error('❌ Error obteniendo entrevistas asignadas:', error)
      return []
    }
  },

  /**
   * Obtiene la prioridad numérica de una etapa (menor = mayor prioridad)
   */
  getStagePriority(stage: string): number {
    const priorities: Record<string, number> = {
      'pre-entrevista': 1,
      'primera-entrevista': 2,
      'segunda-entrevista': 3,
      'fit-cultural': 4,
      'stand-by': 5,
      'seleccionado': 10,
      'descartado': 10
    }
    return priorities[stage] || 6
  },

  /**
   * Obtiene el nombre de visualización de una etapa
   */
  getStageDisplayName(stage: string): string {
    const stageNames: Record<string, string> = {
      'pre-entrevista': 'Pre-entrevista',
      'primera-entrevista': '1ª Entrevista',
      'segunda-entrevista': '2ª Entrevista',
      'fit-cultural': 'Fit Cultural',
      'stand-by': 'Stand By',
      'seleccionado': 'Seleccionado',
      'descartado': 'Descartado'
    }
    return stageNames[stage] || stage
  },

  /**
   * Obtiene estadísticas del dashboard para un usuario
   */
  async getDashboardStats(userId: string): Promise<{
    totalInterviews: number
    pendingInterviews: number
    todayInterviews: number
    byStage: Record<string, number>
  }> {
    try {
      const interviews = await this.getAssignedInterviews(userId)
      
      const stats = {
        totalInterviews: interviews.length,
        pendingInterviews: interviews.filter(i => 
          i.stage !== 'seleccionado' && i.stage !== 'descartado'
        ).length,
        todayInterviews: interviews.filter(i => {
          const assignedDate = new Date(i.assignedAt)
          const today = new Date()
          return assignedDate.toDateString() === today.toDateString()
        }).length,
        byStage: {} as Record<string, number>
      }
      
      // Contar por etapa
      interviews.forEach(interview => {
        const stage = interview.stageDisplay
        stats.byStage[stage] = (stats.byStage[stage] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del dashboard:', error)
      return {
        totalInterviews: 0,
        pendingInterviews: 0,
        todayInterviews: 0,
        byStage: {}
      }
    }
  }
}

// --- Stalled/Pending Reviews helpers ---
export const pendingReviewsService = {
  /** Detects stalled candidates (live, without persistence)
   * A candidate/postulation is stalled if:
   * - stage is not final (seleccionado/descartado)
   * - updated_at older than minDays
   * Returns enriched rows grouped from candidates and (if exists) postulations
   */
  async getStalledCandidates(options?: { minDays?: number; assigneeId?: string }): Promise<any[]> {
    const minDays = options?.minDays ?? Number(process.env.NEXT_PUBLIC_STALLED_DAYS ?? 7)
    const assigneeFilter = options?.assigneeId

    if (!isSupabaseConfigured()) return []

    const sinceDate = new Date(Date.now() - minDays * 24 * 60 * 60 * 1000).toISOString()

    const results: any[] = []

    try {
      // From candidates table - only include candidates from active applications
      let candQuery = supabase
        .from('candidates')
        .select(`*, applications!candidates_application_id_fkey(id,title,status), users!candidates_assignee_id_fkey(name,email)`) 
        .not('stage', 'in', '("seleccionado","descartado")')
        .lt('updated_at', sinceDate)
        .eq('applications.status', 'Activa') // Only include candidates from active applications

      if (assigneeFilter) candQuery = candQuery.eq('assignee_id', assigneeFilter)

      const { data: cands, error: cErr } = await candQuery
      if (!cErr && cands) {
        for (const c of cands) {
          results.push({
            source: 'candidates',
            candidate_id: c.id,
            candidate_name: c.name,
            candidate_email: c.email,
            application_id: c.application_id,
            application_title: c.applications?.title,
            assignee_id: c.assignee_id,
            assignee_name: c.users?.name,
            stage: c.stage,
            updated_at: c.updated_at,
            days_stalled: Math.floor((Date.now() - new Date(c.updated_at).getTime())/(1000*60*60*24))
          })
        }
      }

      // From postulations (if exists)
      try {
        const exists = await duplicateService.checkPostulationsTableExists()
        if (exists) {
          let postQuery = supabase
            .from('postulations')
            .select(`*, candidates!inner(name,email), applications!inner(id,title,status)`) 
            .not('stage', 'in', '("seleccionado","descartado")')
            .lt('updated_at', sinceDate)
            .eq('applications.status', 'Activa') // Only include postulations from active applications

          if (assigneeFilter) postQuery = postQuery.eq('assignee_id', assigneeFilter)

          const { data: posts, error: pErr } = await postQuery
          if (!pErr && posts) {
            for (const p of posts) {
              // Avoid duplicates with candidates set
              const dup = results.find(r => r.candidate_id === p.candidate_id && r.application_id === p.application_id)
              if (!dup) {
                results.push({
                  source: 'postulations',
                  candidate_id: p.candidate_id,
                  candidate_name: p.candidates?.name,
                  candidate_email: p.candidates?.email,
                  application_id: p.application_id,
                  application_title: p.applications?.title,
                  assignee_id: p.assignee_id,
                  assignee_name: undefined,
                  stage: p.stage,
                  updated_at: p.updated_at,
                  days_stalled: Math.floor((Date.now() - new Date(p.updated_at).getTime())/(1000*60*60*24))
                })
              }
            }
          }
        }
      } catch {}

      // Sort by days stalled desc
      results.sort((a, b) => b.days_stalled - a.days_stalled)
      return results
    } catch (error) {
      console.error('❌ Error obteniendo estancados:', error)
      return []
    }
  },

  async getPendingSummaryForUser(userId: string, options?: { minDays?: number }): Promise<{ count: number }> {
    const items = await this.getStalledCandidates({ minDays: options?.minDays, assigneeId: userId })
    return { count: items.length }
  }
}

// AI Processing Service para manejar cola de procesamiento de IA
export const aiProcessingService = {
  /**
   * Encola un archivo para procesamiento de IA
   */
  async enqueueFileProcessing(data: {
    candidateId: number
    attachmentId: number
    processingType: 'file_analysis' | 'transcription' | 'summary_generation' | 'candidate_creation'
    fileType: string
    fileUrl: string
    fileName: string
    priority?: number
    metadata?: any
  }): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return null
    }

    try {
      console.log('📋 Encolando archivo para procesamiento de IA:', data.fileName)
      
      const { data: result, error } = await supabase.rpc('enqueue_ai_processing', {
        p_candidate_id: data.candidateId,
        p_attachment_id: data.attachmentId,
        p_processing_type: data.processingType,
        p_file_type: data.fileType,
        p_file_url: data.fileUrl,
        p_file_name: data.fileName,
        p_priority: data.priority || 5,
        p_metadata: data.metadata || {}
      })

      if (error) {
        console.error('❌ Error encolando procesamiento:', error)
        return null
      }

      console.log('✅ Archivo encolado para procesamiento:', result)
      return result
    } catch (error) {
      console.error('❌ Error en enqueueFileProcessing:', error)
      return null
    }
  },

  /**
   * Obtiene el estado de procesamiento de IA de un candidato
   */
  async getCandidateAIStatus(candidateId: number): Promise<any> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('candidate_ai_status')
        .select('*')
        .eq('candidate_id', candidateId)
        .single()

      if (error) {
        console.error('❌ Error obteniendo estado de IA:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error en getCandidateAIStatus:', error)
      return null
    }
  },

  /**
   * Obtiene candidatos pendientes de procesamiento de IA
   */
  async getCandidatesPendingAI(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return []
    }

    try {
      const { data, error } = await supabase.rpc('get_candidates_pending_ai_processing')

      if (error) {
        console.error('❌ Error obteniendo candidatos pendientes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error en getCandidatesPendingAI:', error)
      return []
    }
  },

  /**
   * Actualiza el resumen de IA de un candidato
   */
  async updateCandidateAISummary(data: {
    candidateId: number
    summary: string
    confidenceScore: number
    skills?: string[]
    experienceYears?: number
    educationLevel?: string
    metadata?: any
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return false
    }

    try {
      console.log('📝 Actualizando resumen de IA para candidato:', data.candidateId)
      
      const { data: result, error } = await supabase.rpc('update_candidate_ai_summary', {
        p_candidate_id: data.candidateId,
        p_summary: data.summary,
        p_confidence_score: data.confidenceScore,
        p_skills: data.skills || [],
        p_experience_years: data.experienceYears,
        p_education_level: data.educationLevel,
        p_metadata: data.metadata || {}
      })

      if (error) {
        console.error('❌ Error actualizando resumen de IA:', error)
        return false
      }

      console.log('✅ Resumen de IA actualizado exitosamente')
      return true
    } catch (error) {
      console.error('❌ Error en updateCandidateAISummary:', error)
      return false
    }
  },

  /**
   * Guarda una transcripción de archivo
   */
  async saveFileTranscription(data: {
    attachmentId: string
    candidateId: number
    transcriptionText: string
    languageDetected?: string
    confidenceScore?: number
    durationSeconds?: number
    aiService?: string
    metadata?: any
  }): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return null
    }

    try {
      console.log('💬 Guardando transcripción para archivo:', data.attachmentId)
      
      const { data: result, error } = await supabase
        .from('file_transcriptions')
        .insert({
          attachment_id: data.attachmentId,
          candidate_id: data.candidateId,
          transcription_text: data.transcriptionText,
          language_detected: data.languageDetected,
          confidence_score: data.confidenceScore,
          duration_seconds: data.durationSeconds,
          ai_service: data.aiService,
          processing_metadata: data.metadata || {}
        })
        .select('id')
        .single()

      if (error) {
        console.error('❌ Error guardando transcripción:', error)
        return null
      }

      console.log('✅ Transcripción guardada exitosamente')
      return result.id
    } catch (error) {
      console.error('❌ Error en saveFileTranscription:', error)
      return null
    }
  },

  /**
   * Guarda un análisis de archivo
   */
  async saveFileAnalysis(data: {
    attachmentId: string
    candidateId: number
    analysisType: 'cv_parsing' | 'document_analysis' | 'image_analysis'
    extractedData: any
    structuredInfo?: any
    rawText?: string
    confidenceScore?: number
    aiService?: string
    metadata?: any
  }): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return null
    }

    try {
      console.log('🔍 Guardando análisis para archivo:', data.attachmentId)
      
      const { data: result, error } = await supabase
        .from('file_analyses')
        .insert({
          attachment_id: data.attachmentId,
          candidate_id: data.candidateId,
          analysis_type: data.analysisType,
          extracted_data: data.extractedData,
          structured_info: data.structuredInfo || {},
          raw_text: data.rawText,
          confidence_score: data.confidenceScore,
          ai_service: data.aiService,
          processing_metadata: data.metadata || {}
        })
        .select('id')
        .single()

      if (error) {
        console.error('❌ Error guardando análisis:', error)
        return null
      }

      console.log('✅ Análisis guardado exitosamente')
      return result.id
    } catch (error) {
      console.error('❌ Error en saveFileAnalysis:', error)
      return null
    }
  },

  /**
   * Obtiene la cola de procesamiento de IA
   */
  async getProcessingQueue(status?: string): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return []
    }

    try {
      let query = supabase
        .from('ai_processing_queue')
        .select(`
          *,
          candidates(name, email),
          candidate_attachments(filename, file_size)
        `)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error obteniendo cola de procesamiento:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error en getProcessingQueue:', error)
      return []
    }
  },

  /**
   * Marca una tarea como iniciada
   */
  async startProcessingTask(taskId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return false
    }

    try {
      const { data, error } = await supabase.rpc('start_ai_processing_task', {
        p_task_id: taskId
      })

      if (error) {
        console.error('❌ Error iniciando tarea:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('❌ Error en startProcessingTask:', error)
      return false
    }
  },

  /**
   * Completa una tarea de procesamiento
   */
  async completeProcessingTask(taskId: string, success: boolean, errorMessage?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado')
      return false
    }

    try {
      const { data, error } = await supabase.rpc('complete_ai_processing_task', {
        p_task_id: taskId,
        p_success: success,
        p_error_message: errorMessage
      })

      if (error) {
        console.error('❌ Error completando tarea:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('❌ Error en completeProcessingTask:', error)
      return false
    }
  }
}
