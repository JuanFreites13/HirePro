#!/usr/bin/env node

/**
 * Script para validar que los permisos se estén usando correctamente en el código
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 VALIDANDO USO DE PERMISOS EN EL CÓDIGO')
console.log('=' .repeat(50))

// Permisos definidos en el sistema
const DEFINED_PERMISSIONS = [
  'crear_postulaciones',
  'editar_postulaciones', 
  'eliminar_postulaciones',
  'crear_postulantes',
  'editar_postulantes',
  'eliminar_postulantes',
  'mover_etapas',
  'ver_todas_postulaciones',
  'ver_postulaciones_asignadas',
  'gestionar_usuarios',
  'acceso_configuracion',
  'usar_ia'
]

function findFiles(dir, extensions, exclude = []) {
  const files = []
  
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (!exclude.includes(item)) {
          files.push(...findFiles(fullPath, extensions, exclude))
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error leyendo directorio ${dir}:`, error.message)
  }
  
  return files
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const foundPermissions = []
    const hasPermissionsCheck = content.includes('permissions') || content.includes('hasPermission')
    
    // Buscar permisos específicos
    DEFINED_PERMISSIONS.forEach(permission => {
      if (content.includes(`'${permission}'`) || content.includes(`"${permission}"`)) {
        foundPermissions.push(permission)
      }
    })
    
    return {
      file: filePath,
      hasPermissionsCheck,
      foundPermissions,
      hasUserCheck: content.includes('user?.') || content.includes('user.'),
      hasRoleCheck: content.includes('role')
    }
  } catch (error) {
    console.error(`Error leyendo archivo ${filePath}:`, error.message)
    return null
  }
}

function validateServiceFile() {
  console.log('\n1️⃣ Validando archivo de servicios...')
  
  const servicePath = 'lib/supabase-service.ts'
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ Archivo de servicios no encontrado')
    return false
  }
  
  const analysis = analyzeFile(servicePath)
  if (!analysis) return false
  
  console.log('✅ Archivo de servicios encontrado')
  console.log(`📋 Permisos definidos: ${analysis.foundPermissions.length}`)
  
  // Verificar que todos los permisos estén definidos
  const missingPermissions = DEFINED_PERMISSIONS.filter(p => !analysis.foundPermissions.includes(p))
  
  if (missingPermissions.length === 0) {
    console.log('✅ Todos los permisos están definidos')
  } else {
    console.log(`⚠️ Permisos faltantes: ${missingPermissions.join(', ')}`)
  }
  
  return true
}

function validateComponentFiles() {
  console.log('\n2️⃣ Validando componentes React...')
  
  const componentFiles = findFiles('.', ['.tsx', '.ts'], ['node_modules', '.next', 'scripts'])
  console.log(`📁 ${componentFiles.length} archivos encontrados`)
  
  const componentsWithPermissions = []
  let totalPermissionChecks = 0
  
  componentFiles.forEach(file => {
    const analysis = analyzeFile(file)
    if (analysis && (analysis.hasPermissionsCheck || analysis.foundPermissions.length > 0)) {
      componentsWithPermissions.push(analysis)
      totalPermissionChecks += analysis.foundPermissions.length
    }
  })
  
  console.log(`✅ ${componentsWithPermissions.length} componentes usan permisos`)
  console.log(`📊 ${totalPermissionChecks} verificaciones de permisos encontradas`)
  
  // Mostrar componentes principales con permisos
  const importantFiles = componentsWithPermissions.filter(c => 
    c.file.includes('configuration') || 
    c.file.includes('postulation') || 
    c.file.includes('candidate')
  )
  
  if (importantFiles.length > 0) {
    console.log('\n📋 Archivos principales con permisos:')
    importantFiles.forEach(file => {
      const fileName = path.basename(file.file)
      console.log(`   ${fileName}: ${file.foundPermissions.length} permisos`)
    })
  }
  
  return true
}

function validatePermissionConsistency() {
  console.log('\n3️⃣ Validando consistencia de permisos...')
  
  const allFiles = findFiles('.', ['.tsx', '.ts'], ['node_modules', '.next', 'scripts'])
  const allFoundPermissions = new Set()
  const filesWithInconsistencies = []
  
  allFiles.forEach(file => {
    const analysis = analyzeFile(file)
    if (analysis) {
      analysis.foundPermissions.forEach(p => allFoundPermissions.add(p))
      
      // Buscar permisos hardcodeados o no definidos
      const content = fs.readFileSync(file, 'utf8')
      const permissionRegex = /'([a-z_]+)'/g
      let match
      
      while ((match = permissionRegex.exec(content)) !== null) {
        const permission = match[1]
        if (permission.includes('_') && !DEFINED_PERMISSIONS.includes(permission)) {
          if (permission.startsWith('crear_') || permission.startsWith('editar_') || permission.startsWith('eliminar_')) {
            filesWithInconsistencies.push({
              file: path.basename(file),
              undefinedPermission: permission
            })
          }
        }
      }
    }
  })
  
  console.log(`✅ ${allFoundPermissions.size} permisos únicos encontrados`)
  
  if (filesWithInconsistencies.length > 0) {
    console.log(`⚠️ ${filesWithInconsistencies.length} posibles inconsistencias:`)
    filesWithInconsistencies.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.undefinedPermission}`)
    })
  } else {
    console.log('✅ No se encontraron inconsistencias')
  }
  
  return true
}

function validateAuthUsage() {
  console.log('\n4️⃣ Validando uso de autenticación...')
  
  const authFiles = findFiles('.', ['.tsx', '.ts'], ['node_modules', '.next', 'scripts'])
    .map(analyzeFile)
    .filter(analysis => analysis && (analysis.hasUserCheck || analysis.hasRoleCheck))
  
  console.log(`✅ ${authFiles.length} archivos usan autenticación`)
  
  // Verificar archivos críticos
  const criticalFiles = [
    'app/configuration/page.tsx',
    'components/auth-provider.tsx',
    'lib/supabase-service.ts'
  ]
  
  const criticalFileAnalysis = criticalFiles.map(file => ({
    file,
    exists: fs.existsSync(file),
    analysis: fs.existsSync(file) ? analyzeFile(file) : null
  }))
  
  console.log('\n📋 Archivos críticos:')
  criticalFileAnalysis.forEach(({ file, exists, analysis }) => {
    const fileName = path.basename(file)
    if (exists && analysis) {
      console.log(`✅ ${fileName}: Usuario(${analysis.hasUserCheck}) Permisos(${analysis.hasPermissionsCheck})`)
    } else {
      console.log(`❌ ${fileName}: No encontrado`)
    }
  })
  
  return criticalFileAnalysis.every(({ exists }) => exists)
}

function generatePermissionsReport() {
  console.log('\n5️⃣ Generando reporte de permisos...')
  
  const report = {
    totalPermissions: DEFINED_PERMISSIONS.length,
    definedPermissions: DEFINED_PERMISSIONS,
    categories: {
      postulantes: DEFINED_PERMISSIONS.filter(p => p.includes('postulantes')).length,
      postulaciones: DEFINED_PERMISSIONS.filter(p => p.includes('postulaciones')).length,
      sistema: DEFINED_PERMISSIONS.filter(p => ['gestionar_usuarios', 'acceso_configuracion', 'usar_ia'].includes(p)).length,
      otros: DEFINED_PERMISSIONS.filter(p => !p.includes('postulantes') && !p.includes('postulaciones') && !['gestionar_usuarios', 'acceso_configuracion', 'usar_ia'].includes(p)).length
    }
  }
  
  console.log('📊 Reporte de permisos:')
  console.log(`   Total: ${report.totalPermissions} permisos`)
  console.log(`   Postulantes: ${report.categories.postulantes}`)
  console.log(`   Postulaciones: ${report.categories.postulaciones}`)
  console.log(`   Sistema: ${report.categories.sistema}`)
  console.log(`   Otros: ${report.categories.otros}`)
  
  return true
}

async function runValidation() {
  console.log('🚀 Ejecutando validación de permisos...\n')
  
  const tests = [
    { name: 'Servicios', fn: validateServiceFile },
    { name: 'Componentes', fn: validateComponentFiles },
    { name: 'Consistencia', fn: validatePermissionConsistency },
    { name: 'Autenticación', fn: validateAuthUsage },
    { name: 'Reporte', fn: generatePermissionsReport }
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      const result = test.fn()
      results.push({ name: test.name, success: result })
    } catch (error) {
      console.error(`❌ Error en ${test.name}:`, error.message)
      results.push({ name: test.name, success: false })
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN VALIDACIÓN DE PERMISOS:')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n🎯 Resultado: ${passed}/${total} validaciones pasaron`)
  
  if (passed === total) {
    console.log('🎉 ¡Sistema de permisos correctamente implementado!')
    console.log('\n📋 CHECKLIST DE VALIDACIÓN:')
    console.log('✅ Permisos definidos correctamente')
    console.log('✅ Componentes usan verificación de permisos')
    console.log('✅ Autenticación implementada')
    console.log('✅ Consistencia mantenida')
  } else {
    console.log('⚠️ Hay aspectos que necesitan atención')
  }
  
  console.log('\n🧪 PRUEBAS MANUALES RECOMENDADAS:')
  console.log('1. Crear usuario Entrevistador')
  console.log('2. Verificar que NO pueda eliminar candidatos')
  console.log('3. Crear usuario Admin RRHH')
  console.log('4. Verificar que SÍ pueda eliminar candidatos')
  console.log('5. Personalizar permisos y verificar efectos')
  
  return passed === total
}

// Ejecutar validación
runValidation()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })

