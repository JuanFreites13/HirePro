import { NextRequest, NextResponse } from 'next/server'
import { aiProcessingService } from '@/lib/supabase-service'

/**
 * GET /api/ai-processing/queue
 * Obtiene la cola de procesamiento de IA
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const queue = await aiProcessingService.getProcessingQueue(status || undefined)
    
    return NextResponse.json({
      success: true,
      data: queue,
      count: queue.length
    })
  } catch (error) {
    console.error('❌ Error obteniendo cola de procesamiento:', error)
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

/**
 * POST /api/ai-processing/queue
 * Encola un nuevo archivo para procesamiento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      candidateId,
      attachmentId,
      processingType,
      fileType,
      fileUrl,
      fileName,
      priority,
      metadata
    } = body

    // Validaciones básicas
    if (!candidateId || !attachmentId || !processingType || !fileUrl || !fileName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros requeridos faltantes',
          required: ['candidateId', 'attachmentId', 'processingType', 'fileUrl', 'fileName']
        },
        { status: 400 }
      )
    }

    const validProcessingTypes = ['file_analysis', 'transcription', 'summary_generation', 'candidate_creation']
    if (!validProcessingTypes.includes(processingType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo de procesamiento inválido',
          validTypes: validProcessingTypes
        },
        { status: 400 }
      )
    }

    const queueId = await aiProcessingService.enqueueFileProcessing({
      candidateId,
      attachmentId,
      processingType,
      fileType: fileType || 'unknown',
      fileUrl,
      fileName,
      priority: priority || 5,
      metadata: metadata || {}
    })

    if (!queueId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error encolando archivo para procesamiento'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { queueId },
      message: 'Archivo encolado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error encolando archivo:', error)
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

