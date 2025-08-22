#!/usr/bin/env node

/**
 * Script de diagnóstico para el procesamiento de CVs
 * Identifica exactamente dónde está fallando el análisis
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

console.log('🔍 DIAGNÓSTICO COMPLETO DE PROCESAMIENTO DE CVs')
console.log('=' .repeat(60))

async function testPDFParsing() {
  console.log('\n1️⃣ Probando extracción de texto de PDF...')
  
  try {
    // Verificar si pdf-parse está disponible
    console.log('📚 Verificando pdf-parse...')
    const pdfParse = await import('pdf-parse')
    console.log('✅ pdf-parse disponible')
    
    // Crear un PDF de prueba simple
    const testPDFContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj  
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
trailer<</Size 5/Root 1 0 R>>
startxref
300
%%EOF`

    const buffer = Buffer.from(testPDFContent, 'utf8')
    console.log('📄 PDF de prueba creado:', buffer.length, 'bytes')
    
    try {
      const result = await pdfParse.default(buffer)
      console.log('✅ PDF parseado exitosamente')
      console.log('   - Páginas:', result.numpages)
      console.log('   - Texto extraído:', result.text?.length || 0, 'caracteres')
      console.log('   - Contenido:', result.text?.substring(0, 100) || 'Sin texto')
      return true
    } catch (parseError) {
      console.error('❌ Error parseando PDF:', parseError.message)
      return false
    }
  } catch (importError) {
    console.error('❌ Error importando pdf-parse:', importError.message)
    return false
  }
}

async function testAIService() {
  console.log('\n2️⃣ Probando servicio de IA...')
  
  try {
    // Importar el servicio de IA
    console.log('📚 Importando AI Service...')
    const { aiService } = await import('../lib/ai-service.js')
    console.log('✅ AI Service importado')
    
    // Crear un archivo de prueba
    const testContent = `
MARÍA RODRÍGUEZ GONZÁLEZ
Email: maria.rodriguez@email.com
Teléfono: +56 9 8765 4321
Ubicación: Santiago, Chile

EXPERIENCIA
Desarrolladora Senior - TechCorp (2022-Actual)
• Liderazgo de equipo de 4 desarrolladores
• Implementación de microservicios
• Reducción de tiempo de carga en 40%

EDUCACIÓN
Ingeniería en Informática - Universidad de Chile (2017-2021)

HABILIDADES
Idiomas: Español (Nativo), Inglés (Avanzado)
Técnicas: React, Node.js, TypeScript, MongoDB
`
    
    const blob = new Blob([testContent], { type: 'text/plain' })
    const file = new File([blob], 'test-cv.txt', { type: 'text/plain' })
    
    console.log('📄 Archivo de prueba creado:', file.name, file.size, 'bytes')
    
    // Probar extracción de texto
    console.log('🔍 Probando extracción de texto...')
    const extractedText = await aiService.extractTextFromCV(file)
    console.log('✅ Texto extraído:', extractedText?.length || 0, 'caracteres')
    console.log('📝 Contenido:', extractedText?.substring(0, 200) || 'Sin contenido')
    
    return extractedText && extractedText.length > 10
  } catch (error) {
    console.error('❌ Error en AI Service:', error.message)
    console.error('📋 Stack:', error.stack)
    return false
  }
}

async function testAPIEndpoint() {
  console.log('\n3️⃣ Probando endpoint de API...')
  
  try {
    // Crear datos de prueba
    const testData = `
JUAN PABLO FREITES BELLO
Email: juanpablofreitesbello@gmail.com  
Teléfono: +56 9 3026 8324
Ubicación: Puente Alto, Santiago, Chile

PERFIL PROFESIONAL
Estudiante de Ingeniería en Automatización y Robótica con experiencia en mantenimiento industrial, 
soporte técnico y desarrollo de sistemas de control.

EDUCACIÓN
• Ingeniería en Automatización y Robótica - Universidad Tecnológica Metropolitana (UTEM)
• Técnico en Electrónica - Instituto Profesional AIEP

EXPERIENCIA LABORAL
Demarka S.A. - Técnico en Mantenimiento (2022-2023)
• Mantenimiento preventivo y correctivo de equipos industriales
• Implementación de mejoras en sistemas de automatización

HABILIDADES TÉCNICAS
• Programación: C, Python, Ladder
• Control Industrial: Arduino, Raspberry Pi, PIC
• Software: AutoCAD, SolidWorks, MATLAB
• Idiomas: Español (Nativo), Inglés (Intermedio)
`
    
    const formData = new FormData()
    formData.append('description', testData)
    
    console.log('📤 Enviando datos al endpoint...')
    const response = await fetch('http://localhost:3000/api/ai/analyze-candidate', {
      method: 'POST',
      body: formData
    })
    
    console.log('📊 Respuesta:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Análisis completado')
      console.log('📋 Resultado:')
      console.log('   - Nombre:', data.data.name)
      console.log('   - Email:', data.data.email)
      console.log('   - Posición:', data.data.position)
      console.log('   - Educación:', data.data.education?.length || 0, 'registros')
      console.log('   - Experiencia:', data.data.work_experience?.length || 0, 'registros')
      
      // Verificar si los datos están siendo extraídos correctamente
      const hasRealData = data.data.name !== 'No especificado' && 
                         data.data.email !== 'No especificado' &&
                         data.data.education?.length > 0
      
      if (hasRealData) {
        console.log('✅ Datos extraídos correctamente')
        return true
      } else {
        console.log('⚠️ Datos no extraídos - usando valores por defecto')
        return false
      }
    } else {
      const errorData = await response.json()
      console.error('❌ Error del servidor:', errorData)
      return false
    }
  } catch (error) {
    console.error('❌ Error en API:', error.message)
    return false
  }
}

async function testFileUpload() {
  console.log('\n4️⃣ Probando subida de archivo real...')
  
  try {
    // Crear un archivo PDF real con contenido
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj  
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 200>>stream
BT
/F1 12 Tf
72 720 Td
(CARLOS MARTINEZ) Tj
0 -20 Td
(Email: carlos.martinez@email.com) Tj
0 -20 Td
(Telefono: +56 9 1234 5678) Tj
0 -20 Td
(Ubicacion: Santiago, Chile) Tj
0 -40 Td
(EXPERIENCIA:) Tj
0 -20 Td
(Desarrollador Senior - TechCorp (2020-2023)) Tj
0 -20 Td
(EDUCACION:) Tj
0 -20 Td
(Ingenieria Informatica - Universidad de Chile) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
trailer<</Size 5/Root 1 0 R>>
startxref
400
%%EOF`

    const buffer = Buffer.from(pdfContent, 'utf8')
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const file = new File([blob], 'test-cv.pdf', { type: 'application/pdf' })
    
    console.log('📄 Archivo PDF creado:', file.name, file.size, 'bytes')
    
    const formData = new FormData()
    formData.append('cvFile', file)
    
    console.log('📤 Enviando archivo PDF...')
    const response = await fetch('http://localhost:3000/api/ai/analyze-candidate', {
      method: 'POST',
      body: formData
    })
    
    console.log('📊 Respuesta:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Análisis de PDF completado')
      console.log('📋 Resultado:')
      console.log('   - Nombre:', data.data.name)
      console.log('   - Email:', data.data.email)
      console.log('   - Posición:', data.data.position)
      
      const hasExtractedData = data.data.name !== 'No especificado' && 
                              data.data.email !== 'No especificado'
      
      if (hasExtractedData) {
        console.log('✅ Datos extraídos del PDF correctamente')
        return true
      } else {
        console.log('⚠️ No se extrajeron datos del PDF')
        return false
      }
    } else {
      const errorData = await response.json()
      console.error('❌ Error del servidor:', errorData)
      return false
    }
  } catch (error) {
    console.error('❌ Error en subida de archivo:', error.message)
    return false
  }
}

async function checkEnvironment() {
  console.log('\n5️⃣ Verificando entorno...')
  
  const checks = {
    nodeVersion: process.version,
    openaiKey: !!process.env.OPENAI_API_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    port: process.env.PORT || 3000
  }
  
  console.log('📋 Estado del entorno:')
  Object.entries(checks).forEach(([key, value]) => {
    const status = value ? '✅' : '❌'
    console.log(`   ${status} ${key}: ${value || 'No configurado'}`)
  })
  
  return Object.values(checks).every(v => v)
}

async function runDiagnostics() {
  console.log('🚀 Ejecutando diagnóstico completo...\n')
  
  const results = []
  
  // Verificar entorno
  const envOk = await checkEnvironment()
  results.push({ name: 'Entorno', success: envOk })
  
  // Probar parsing de PDF
  const pdfOk = await testPDFParsing()
  results.push({ name: 'PDF Parsing', success: pdfOk })
  
  // Probar servicio de IA
  const aiOk = await testAIService()
  results.push({ name: 'AI Service', success: aiOk })
  
  // Probar endpoint de API
  const apiOk = await testAPIEndpoint()
  results.push({ name: 'API Endpoint', success: apiOk })
  
  // Probar subida de archivo
  const fileOk = await testFileUpload()
  results.push({ name: 'File Upload', success: fileOk })
  
  console.log('\n' + '='.repeat(60))
  console.log('🔬 RESUMEN DEL DIAGNÓSTICO:')
  console.log('='.repeat(60))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n🎯 Resultado: ${passed}/${total} pruebas pasaron`)
  
  if (passed === total) {
    console.log('\n🎉 ¡SISTEMA FUNCIONANDO CORRECTAMENTE!')
    console.log('✅ Todos los componentes están operativos')
    console.log('💡 El problema puede estar en la interfaz de usuario')
  } else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:')
    
    if (!results[0].success) {
      console.log('❌ Problema: Variables de entorno no configuradas')
      console.log('💡 Solución: Verificar .env.local')
    }
    
    if (!results[1].success) {
      console.log('❌ Problema: PDF parsing no funciona')
      console.log('💡 Solución: Reinstalar pdf-parse: npm install pdf-parse')
    }
    
    if (!results[2].success) {
      console.log('❌ Problema: AI Service no funciona')
      console.log('💡 Solución: Verificar importaciones y dependencias')
    }
    
    if (!results[3].success) {
      console.log('❌ Problema: API endpoint no responde')
      console.log('💡 Solución: Verificar que el servidor esté corriendo')
    }
    
    if (!results[4].success) {
      console.log('❌ Problema: Subida de archivos no funciona')
      console.log('💡 Solución: Verificar permisos y configuración')
    }
  }
  
  return passed === total
}

// Ejecutar diagnóstico
runDiagnostics()
  .then(success => {
    console.log('\n📋 INSTRUCCIONES PARA VERIFICACIÓN MANUAL:')
    console.log('1. Abre http://localhost:3000 en tu navegador')
    console.log('2. Ve a "Nuevo Postulante" → "Análisis con IA"')
    console.log('3. Sube un CV real o usa descripción de texto')
    console.log('4. Verifica que los datos se extraigan correctamente')
    console.log('5. Revisa la consola del navegador para errores')
    
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })

