import { supabase } from './supabase'

// Tipos para archivos
export interface FileUpload {
  file: File
  candidateId: number
  type: 'document' | 'avatar'
}

export interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  created_at: string
}

// Configuración de buckets
const BUCKETS = {
  FILES: 'candidate-files',
  AVATARS: 'candidate-avatars'
} as const

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
} as const

// Límites de tamaño (en bytes)
const FILE_SIZE_LIMITS = {
  documents: 10 * 1024 * 1024, // 10MB
  images: 5 * 1024 * 1024 // 5MB
} as const

export const storageService = {
  /**
   * Subir archivo para un candidato
   */
  async uploadFile({ file, candidateId, type }: FileUpload): Promise<StoredFile | null> {
    if (!supabase) {
      console.error('Supabase no está configurado')
      return null
    }

    try {
      // Validar tipo de archivo
      const allowedTypes = type === 'avatar' ? ALLOWED_FILE_TYPES.images : ALLOWED_FILE_TYPES.documents
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.type}`)
      }

      // Validar tamaño
      const sizeLimit = type === 'avatar' ? FILE_SIZE_LIMITS.images : FILE_SIZE_LIMITS.documents
      if (file.size > sizeLimit) {
        throw new Error(`Archivo demasiado grande. Máximo: ${sizeLimit / (1024 * 1024)}MB`)
      }

      // Determinar bucket
      const bucket = type === 'avatar' ? BUCKETS.AVATARS : BUCKETS.FILES

      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop()
      const fileName = `${candidateId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Obtener URL del archivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      // Guardar referencia en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from('candidate_attachments')
        .insert({
          candidate_id: candidateId,
          name: file.name,
          type: file.type,
          file_path: fileName
        })
        .select()
        .single()

      if (dbError) {
        // Si falla la base de datos, eliminar el archivo subido
        await supabase.storage.from(bucket).remove([fileName])
        throw dbError
      }

              return {
          id: dbData.id.toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: urlData.publicUrl,
          created_at: dbData.created_at
        }

    } catch (error) {
      console.error('Error subiendo archivo:', error)
      return null
    }
  },

  /**
   * Obtener archivos de un candidato
   */
  async getCandidateFiles(candidateId: number): Promise<StoredFile[]> {
    if (!supabase) {
      console.error('Supabase no está configurado')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('candidate_attachments')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(file => ({
        id: file.id.toString(),
        name: file.name,
        type: file.type,
        size: 0, // No tenemos el tamaño en la BD
        url: this.getFileUrl(file.file_path, file.type.includes('image')),
        created_at: file.created_at
      }))

    } catch (error) {
      console.error('Error obteniendo archivos:', error)
      return []
    }
  },

  /**
   * Eliminar archivo
   */
  async deleteFile(fileId: number): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase no está configurado')
      return false
    }

    try {
      // Obtener información del archivo
      const { data: fileData, error: fetchError } = await supabase
        .from('candidate_attachments')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Determinar bucket
      const bucket = fileData.type.includes('image') ? BUCKETS.AVATARS : BUCKETS.FILES

      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([fileData.file_path])

      if (storageError) throw storageError

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('candidate_attachments')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      return true

    } catch (error) {
      console.error('Error eliminando archivo:', error)
      return false
    }
  },

  /**
   * Obtener URL del archivo
   */
  getFileUrl(filePath: string, isImage: boolean = false): string {
    if (!supabase) return ''

    const bucket = isImage ? BUCKETS.AVATARS : BUCKETS.FILES
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  },

  /**
   * Obtener URL firmada para archivos privados
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    if (!supabase) return null

    try {
      const { data, error } = await supabase.storage
        .from(BUCKETS.FILES)
        .createSignedUrl(filePath, expiresIn)

      if (error) throw error
      return data.signedUrl

    } catch (error) {
      console.error('Error obteniendo URL firmada:', error)
      return null
    }
  },

  /**
   * Validar archivo antes de subir
   */
  validateFile(file: File, type: 'document' | 'avatar'): { valid: boolean; error?: string } {
    // Validar tipo
    const allowedTypes = type === 'avatar' ? ALLOWED_FILE_TYPES.images : ALLOWED_FILE_TYPES.documents
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      }
    }

    // Validar tamaño
    const sizeLimit = type === 'avatar' ? FILE_SIZE_LIMITS.images : FILE_SIZE_LIMITS.documents
    if (file.size > sizeLimit) {
      return {
        valid: false,
        error: `Archivo demasiado grande. Máximo: ${sizeLimit / (1024 * 1024)}MB`
      }
    }

    return { valid: true }
  },

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
