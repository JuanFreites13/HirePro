require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCandidates() {
  console.log('🔍 Debug de Candidatos y Aplicaciones')
  console.log('=============================================\n')

  try {
    // Obtener todas las aplicaciones
    console.log('📋 Aplicaciones:')
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .order('id')

    if (appsError) throw appsError

    applications.forEach(app => {
      console.log(`   ID: ${app.id} - ${app.title} (${app.status})`)
    })

    console.log('\n👥 Candidatos:')
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('id')

    if (candidatesError) throw candidatesError

    candidates.forEach(candidate => {
      console.log(`   ID: ${candidate.id} - ${candidate.name} - App ID: ${candidate.application_id} - Stage: ${candidate.stage}`)
    })

    console.log('\n🔗 Verificando asociaciones:')
    applications.forEach(app => {
      const appCandidates = candidates.filter(c => c.application_id === app.id)
      console.log(`   Aplicación ${app.id} (${app.title}): ${appCandidates.length} candidatos`)
      appCandidates.forEach(c => {
        console.log(`     - ${c.name} (${c.stage})`)
      })
    })

    // Verificar candidatos sin aplicación
    const orphanCandidates = candidates.filter(c => !c.application_id)
    if (orphanCandidates.length > 0) {
      console.log('\n⚠️  Candidatos sin aplicación:')
      orphanCandidates.forEach(c => {
        console.log(`   - ${c.name} (ID: ${c.id})`)
      })
    }

    // Verificar aplicaciones sin candidatos
    const emptyApplications = applications.filter(app => 
      !candidates.some(c => c.application_id === app.id)
    )
    if (emptyApplications.length > 0) {
      console.log('\n⚠️  Aplicaciones sin candidatos:')
      emptyApplications.forEach(app => {
        console.log(`   - ${app.title} (ID: ${app.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

debugCandidates()
