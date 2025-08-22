// Script para agregar una evaluación de prueba
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://cyxzlsshmteudtvinzrj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eHpsc3NobXRldWR0dmluenJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDQ2MDgsImV4cCI6MjA3MDc4MDYwOH0.ZnP0vDHGT4BVaupCxF0E4ws5bVWwgwqMnArDWYqpciJ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestEvaluation() {
  console.log('🧪 AGREGANDO EVALUACIÓN DE PRUEBA')
  console.log('==================================\n')

  try {
    // 1. Obtener candidatos disponibles
    console.log('1. 📋 Obteniendo candidatos...')
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .limit(5)
    
    if (candidatesError) {
      console.log('❌ Error al obtener candidatos:', candidatesError.message)
      return
    }
    
    if (!candidates || candidates.length === 0) {
      console.log('❌ No hay candidatos disponibles')
      return
    }
    
    console.log('✅ Candidatos encontrados:')
    candidates.forEach(candidate => {
      console.log(`   - ID: ${candidate.id}, Nombre: ${candidate.name}, Email: ${candidate.email}`)
    })
    console.log()

    // 2. Crear evaluación de prueba
    const testEvaluation = {
      candidate_id: candidates[0].id,
      evaluation_type: 'entrevista',
      score: 8,
      feedback: 'Excelente candidato con sólida experiencia técnica. Demostró habilidades avanzadas en programación y control industrial. Comunicación clara y capacidad de resolución de problemas. Recomendado para avanzar a la siguiente etapa. Fortalezas: Conocimiento técnico, experiencia práctica, capacidad de aprendizaje. Áreas de mejora: Podría beneficiarse de más experiencia en proyectos de gran escala.',
      stage: '1ª entrevista'
    }

    console.log('2. 🎯 Creando evaluación de prueba...')
    console.log('📝 Datos:', testEvaluation)
    console.log()

    const { data: createdEvaluation, error: createError } = await supabase
      .from('candidate_evaluations')
      .insert(testEvaluation)
      .select()
      .single()

    if (createError) {
      console.log('❌ ERROR AL CREAR EVALUACIÓN:')
      console.log('❌ Código:', createError.code)
      console.log('❌ Mensaje:', createError.message)
      console.log('❌ Detalles:', createError.details)
    } else {
      console.log('✅ EVALUACIÓN CREADA EXITOSAMENTE:')
      console.log('✅ ID:', createdEvaluation.id)
      console.log('✅ Candidato:', candidates[0].name)
      console.log('✅ Tipo:', createdEvaluation.evaluation_type)
      console.log('✅ Puntaje:', createdEvaluation.score)
      console.log('✅ Etapa:', createdEvaluation.stage)
      console.log('✅ Fecha:', new Date(createdEvaluation.created_at).toLocaleString())
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar script
addTestEvaluation()
  .then(() => {
    console.log('\n🎯 SCRIPT COMPLETADO')
    console.log('====================')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

