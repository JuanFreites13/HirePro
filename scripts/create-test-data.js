const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestData() {
  try {
    console.log('🧪 Creando datos de prueba...')

    // 0. Obtener un usuario existente para asignar como responsable
    console.log('👤 Buscando usuario responsable...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('❌ No se encontraron usuarios. Crea un usuario primero.')
      return
    }

    const responsibleId = users[0].id
    console.log('✅ Usuario responsable encontrado:', responsibleId)

    // 1. Crear aplicación de prueba
    console.log('📝 Creando aplicación de prueba...')
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        title: 'Desarrollador Full Stack',
        description: 'Buscamos un desarrollador Full Stack con experiencia en React y Node.js',
        area: 'Tecnología',
        location: 'Santiago, Chile',
        type: 'Tiempo completo',
        status: 'Activa',
        responsible_id: responsibleId
      })
      .select()
      .single()

    if (appError) {
      console.error('❌ Error creando aplicación:', appError)
      return
    }

    console.log('✅ Aplicación creada:', application.title)

    // 2. Crear candidatos de prueba
    console.log('👥 Creando candidatos de prueba...')
    const candidates = [
      {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+56912345678',
        position: 'Desarrollador Full Stack',
        experience: '3 años',
        location: 'Santiago, Chile',
        stage: 'pre-entrevista',
        score: 8,
        status: 'pending',
        application_id: application.id,
        assignee_id: responsibleId
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+56987654321',
        position: 'Desarrollador Frontend',
        experience: '2 años',
        location: 'Valparaíso, Chile',
        stage: 'primera',
        score: 7,
        status: 'scheduled',
        application_id: application.id,
        assignee_id: responsibleId
      },
      {
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '+56911223344',
        position: 'Desarrollador Backend',
        experience: '4 años',
        location: 'Concepción, Chile',
        stage: 'segunda',
        score: 9,
        status: 'scheduled',
        application_id: application.id,
        assignee_id: responsibleId
      }
    ]

    const { data: createdCandidates, error: candidatesError } = await supabase
      .from('candidates')
      .insert(candidates)
      .select()

    if (candidatesError) {
      console.error('❌ Error creando candidatos:', candidatesError)
      return
    }

    console.log(`✅ ${createdCandidates.length} candidatos creados`)

    // 3. Crear postulaciones en la tabla postulations (si existe)
    try {
      console.log('📋 Creando postulaciones...')
      const postulations = createdCandidates.map(candidate => ({
        candidate_id: candidate.id,
        application_id: application.id,
        stage: candidate.stage,
        score: candidate.score,
        assignee_id: responsibleId,
        status: 'active'
      }))

      const { data: createdPostulations, error: postulationsError } = await supabase
        .from('postulations')
        .insert(postulations)
        .select()

      if (postulationsError) {
        console.log('⚠️ Tabla postulations no disponible o error:', postulationsError.message)
      } else {
        console.log(`✅ ${createdPostulations.length} postulaciones creadas`)
      }
    } catch (error) {
      console.log('⚠️ Tabla postulations no disponible')
    }

    console.log('\n🎉 Datos de prueba creados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`• Aplicación: ${application.title}`)
    console.log(`• Candidatos: ${createdCandidates.length}`)
    console.log(`• IDs de candidatos: ${createdCandidates.map(c => c.id).join(', ')}`)
    
    console.log('\n🧪 Para probar Google Meet:')
    console.log('1. Ve a http://localhost:3000/candidates')
    console.log('2. Haz clic en cualquier candidato')
    console.log('3. Haz clic en ⋮ → "Enviar email"')
    console.log('4. Marca "Crear reunión de Google Meet"')
    console.log('5. Completa fecha y hora')
    console.log('6. Haz clic en "Enviar Email"')

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

createTestData()
