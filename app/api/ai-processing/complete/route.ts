import { NextRequest, NextResponse } from 'next/server'
import { aiProcessingService } from '@/lib/supabase-service'

/**
 * POST /api/ai-processing/complete
 * Marca una tarea como completada y guarda los resultados
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      taskId,
      success,
      errorMessage,
      results
    } = body

    // Validaciones básicas
    if (!taskId || success === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros requeridos faltantes',
          required: ['taskId', 'success']
        },
        { status: 400 }
      )
    }

    // Marcar tarea como completada
    const completed = await aiProcessingService.completeProcessingTask(
      taskId, 
      success, 
      errorMessage
    )

    if (!completed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error marcando tarea como completada'
        },
        { status: 500 }
      )
    }

    // Si fue exitoso y hay resultados, procesarlos
    if (success && results) {
      await processResults(results)
    }

    return NextResponse.json({
      success: true,
      message: success ? 'Tarea completada exitosamente' : 'Tarea marcada como fallida'
    })

  } catch (error) {
    console.error('❌ Error completando tarea:', error)
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
 * Procesa los resultados según el tipo de procesamiento
 */
async function processResults(results: any) {
  try {
    const { type, data } = results

    switch (type) {
      case 'transcription':
        await aiProcessingService.saveFileTranscription({
          attachmentId: data.attachmentId,
          candidateId: data.candidateId,
          transcriptionText: data.transcriptionText,
          languageDetected: data.languageDetected,
          confidenceScore: data.confidenceScore,
          durationSeconds: data.durationSeconds,
          aiService: data.aiService,
          metadata: data.metadata
        })
        break

      case 'file_analysis':
        await aiProcessingService.saveFileAnalysis({
          attachmentId: data.attachmentId,
          candidateId: data.candidateId,
          analysisType: data.analysisType,
          extractedData: data.extractedData,
          structuredInfo: data.structuredInfo,
          rawText: data.rawText,
          confidenceScore: data.confidenceScore,
          aiService: data.aiService,
          metadata: data.metadata
        })
        break

      case 'summary_generation':
        await aiProcessingService.updateCandidateAISummary({
          candidateId: data.candidateId,
          summary: data.summary,
          confidenceScore: data.confidenceScore,
          skills: data.skills,
          experienceYears: data.experienceYears,
          educationLevel: data.educationLevel,
          metadata: data.metadata
        })
        break

      default:
        console.warn('⚠️ Tipo de resultado desconocido:', type)
    }

  } catch (error) {
    console.error('❌ Error procesando resultados:', error)
    // No relanzar error para no fallar la API
  }
}

