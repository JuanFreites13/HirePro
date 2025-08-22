# 🗄️ Supabase Storage - Configuración Completa

## ✅ Lo que se ha configurado

### 📦 Dependencias
- ✅ `react-dropzone` instalado para drag & drop
- ✅ Servicios de storage configurados

### 🔧 Archivos de Configuración
- ✅ `lib/storage-service.ts` - Servicio completo para manejo de archivos
- ✅ `supabase/setup-storage.sql` - Script SQL para políticas RLS
- ✅ `scripts/setup-storage.js` - Script para crear buckets
- ✅ `scripts/test-storage.js` - Script para probar funcionalidad

### 🗂️ Componentes UI
- ✅ `components/file-upload.tsx` - Componente de subida con drag & drop
- ✅ `components/file-list.tsx` - Componente para listar y gestionar archivos
- ✅ `components/candidate-files-section.tsx` - Componente completo integrado

### 🪣 Buckets de Storage
- ✅ `candidate-files` - Para documentos privados (10MB máximo)
- ✅ `candidate-avatars` - Para imágenes públicas (5MB máximo)

## 🚀 Configuración Rápida

### 1. Configurar Storage (Ya hecho)
```bash
npm run setup-storage
```

### 2. Ejecutar Políticas RLS
1. Ve a tu **dashboard de Supabase**
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `supabase/setup-storage.sql`
4. Ejecuta el script

### 3. Probar Funcionalidad
```bash
npm run test-storage
```

## 📋 Características Implementadas

### 🔐 Seguridad
- **Políticas RLS**: Solo usuarios asignados pueden acceder a archivos
- **Validación de tipos**: Solo archivos permitidos
- **Límites de tamaño**: 10MB para documentos, 5MB para imágenes
- **URLs firmadas**: Para archivos privados

### 📁 Tipos de Archivo Soportados
- **Documentos**: PDF, DOC, DOCX, TXT, ZIP
- **Imágenes**: JPG, PNG, GIF, WebP

### 🎯 Funcionalidades
- **Drag & Drop**: Subida intuitiva de archivos
- **Progreso visual**: Barra de progreso durante subida
- **Validación en tiempo real**: Verificación de tipo y tamaño
- **Gestión completa**: Ver, descargar, eliminar archivos
- **Organización**: Archivos organizados por candidato

## 🔧 Uso en la Aplicación

### Componente Básico
```tsx
import { FileUpload } from '@/components/file-upload'

<FileUpload
  candidateId={1}
  type="document"
  onUploadComplete={(file) => console.log('Archivo subido:', file)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

### Componente Completo
```tsx
import { CandidateFilesSection } from '@/components/candidate-files-section'

<CandidateFilesSection
  candidateId={1}
  candidateName="Juan Pérez"
/>
```

### Servicio Directo
```tsx
import { storageService } from '@/lib/storage-service'

// Subir archivo
const result = await storageService.uploadFile({
  file: selectedFile,
  candidateId: 1,
  type: 'document',
  description: 'CV del candidato'
})

// Obtener archivos
const files = await storageService.getCandidateFiles(1)

// Eliminar archivo
const success = await storageService.deleteFile(fileId)
```

## 🗂️ Estructura de Archivos

### En Supabase Storage
```
candidate-files/
├── 1/                    # ID del candidato
│   ├── 1234567890-abc.pdf
│   └── 1234567891-def.docx
└── 2/
    └── 1234567892-ghi.zip

candidate-avatars/
├── 1/
│   └── 1234567893-jkl.jpg
└── 2/
    └── 1234567894-mno.png
```

### En Base de Datos
```sql
candidate_attachments
├── id (SERIAL)
├── candidate_id (INTEGER)
├── name (VARCHAR)
├── type (VARCHAR)
├── file_path (VARCHAR)
├── description (TEXT)
└── created_at (TIMESTAMP)
```

## 🔍 Troubleshooting

### Error: "Bucket not found"
```bash
npm run setup-storage
```

### Error: "Permission denied"
Ejecuta el script SQL de políticas RLS en Supabase

### Error: "File too large"
Verifica los límites de tamaño (10MB documentos, 5MB imágenes)

### Error: "Invalid file type"
Verifica que el tipo de archivo esté en la lista de permitidos

## 📊 Monitoreo

### Verificar Buckets
```bash
npm run test-storage
```

### Verificar Datos
```bash
npm run test-app-data
```

### Debug en Navegador
El componente `DebugInfo` muestra información de configuración

## 🎯 Próximos Pasos

1. **Integrar en la UI**: Agregar el componente a las páginas de candidatos
2. **Configurar políticas RLS**: Ejecutar el script SQL en Supabase
3. **Probar funcionalidad**: Subir archivos desde la aplicación
4. **Personalizar UI**: Ajustar estilos según necesidades

## 📝 Notas Importantes

- Los archivos se organizan por ID de candidato
- Los avatares son públicos para visualización
- Los documentos son privados con acceso controlado
- Las URLs firmadas se generan automáticamente para archivos privados
- El sistema incluye fallback a datos mock si Supabase no está configurado

---

**¡El sistema de archivos está completamente configurado y listo para usar!** 🎉



