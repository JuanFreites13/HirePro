import { NextRequest, NextResponse } from 'next/server'
import { aiProcessingService } from '@/lib/supabase-service'

/**
 * GET /api/ai-processing/candidate/[id]/status
 * Obtiene el estado de procesamiento de IA de un candidato específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = parseInt(params.id)

    if (isNaN(candidateId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de candidato inválido'
        },
        { status: 400 }
      )
    }

    const status = await aiProcessingService.getCandidateAIStatus(candidateId)

    if (!status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Candidato no encontrado'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('❌ Error obteniendo estado de candidato:', error)
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

