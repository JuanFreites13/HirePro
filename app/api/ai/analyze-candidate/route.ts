import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  console.log('🤖 API AI: Analyze candidate endpoint called')
  
  try {
    const formData = await request.formData()
    
    const videoFile = formData.get('videoFile') as File | null
    const cvFile = formData.get('cvFile') as File | null
    const description = formData.get('description') as string | null

    console.log('📋 Datos recibidos:')
    console.log('📝 Descripción:', description || 'No proporcionada')
    console.log('📄 CV File:', cvFile ? `${cvFile.name} (${cvFile.type}, ${cvFile.size} bytes)` : 'No proporcionado')

    // Validar que al menos hay una fuente de datos
    if (!cvFile && !description) {
      console.log('❌ Validación fallida: No hay datos para analizar')
      return NextResponse.json(
        { error: 'Se requiere al menos un CV o descripción' },
        { status: 400 }
      )
    }

    console.log('🔍 Iniciando análisis con IA...')
    
    // Analizar con IA
    const analysis = await aiService.analyzeCandidate({
      videoFile: videoFile || undefined,
      cvFile: cvFile || undefined,
      description: description || undefined
    })

    console.log('✅ Análisis completado exitosamente')
    console.log('📊 Resultado:', {
      name: analysis.name,
      email: analysis.email,
      position: analysis.position,
      skills: analysis.skills.length,
      score: analysis.score
    })

    return NextResponse.json({
      success: true,
      data: analysis
    })

  } catch (error) {
    console.error('❌ Error en análisis de IA:', error)
    console.error('📋 Detalles del error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'
    })
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// Configurar límites para archivos grandes
export const config = {
  api: {
    bodyParser: false,
  },
}
