import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurar cliente de Supabase 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * POST /api/ai-processing/enqueue-file
 * Encola un archivo para procesamiento de IA (llamado desde el cliente)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      candidateId,
      attachmentId,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      uploadedBy
    } = body

    // Validaciones básicas
    if (!candidateId || !attachmentId || !fileName || !fileUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros requeridos faltantes',
          required: ['candidateId', 'attachmentId', 'fileName', 'fileUrl']
        },
        { status: 400 }
      )
    }

    // Determinar tipo de procesamiento basado en la extensión del archivo
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    let processingType: 'file_analysis' | 'transcription' = 'file_analysis'
    let priority = 5

    // Archivos de audio/video -> transcripción
    const audioVideoExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'mp4', 'avi', 'mov', 'mkv', 'webm']
    if (audioVideoExtensions.includes(fileExtension)) {
      processingType = 'transcription'
      priority = 4
    }
    
    // CVs y documentos -> análisis con alta prioridad
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt']
    if (documentExtensions.includes(fileExtension)) {
      processingType = 'file_analysis'
      priority = 3
    }

    // Encolar usando la función SQL
    const { data: queueId, error } = await supabase.rpc('enqueue_ai_processing', {
      p_candidate_id: candidateId,
      p_attachment_id: attachmentId,
      p_processing_type: processingType,
      p_file_type: fileExtension,
      p_file_url: fileUrl,
      p_file_name: fileName,
      p_priority: priority,
      p_metadata: {
        fileSize: fileSize,
        fileType: fileType,
        uploadedBy: uploadedBy,
        uploadedAt: new Date().toISOString()
      }
    })

    if (error) {
      console.error('❌ Error encolando procesamiento:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error encolando archivo para procesamiento',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ Archivo encolado para procesamiento de IA:', queueId)

    return NextResponse.json({
      success: true,
      data: { queueId },
      message: 'Archivo encolado exitosamente para procesamiento de IA'
    })

  } catch (error) {
    console.error('❌ Error en enqueue-file:', error)
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
