import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configurar cliente de Supabase 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

/**
 * GET /api/ai-processing/next-task
 * Obtiene la siguiente tarea de la cola de procesamiento
 * Utilizado por el servicio Python para obtener trabajos
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener siguiente tarea usando la función SQL
    const { data, error } = await supabase.rpc('get_next_ai_processing_task')

    if (error) {
      console.error('❌ Error obteniendo siguiente tarea:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error obteniendo siguiente tarea',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Si no hay tareas pendientes
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No hay tareas pendientes'
      })
    }

    const task = data[0]

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        candidateId: task.candidate_id,
        attachmentId: task.attachment_id,
        processingType: task.processing_type,
        fileType: task.file_type,
        fileUrl: task.file_url,
        fileName: task.file_name,
        metadata: task.processing_metadata
      }
    })

  } catch (error) {
    console.error('❌ Error en next-task:', error)
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
 * POST /api/ai-processing/next-task
 * Marca una tarea como iniciada (para lockear la tarea)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'taskId es requerido'
        },
        { status: 400 }
      )
    }

    // Marcar tarea como iniciada
    const { data, error } = await supabase.rpc('start_ai_processing_task', {
      p_task_id: taskId
    })

    if (error) {
      console.error('❌ Error marcando tarea como iniciada:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error marcando tarea como iniciada',
          details: error.message
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tarea no encontrada o ya iniciada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tarea marcada como iniciada'
    })

  } catch (error) {
    console.error('❌ Error iniciando tarea:', error)
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
