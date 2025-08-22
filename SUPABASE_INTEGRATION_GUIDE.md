# 🔧 Integración Completa con Supabase - Guía Definitiva

## 📋 Requisitos según PRD

Basándome en el PRD, necesitas una integración completa con Supabase que incluya:

### ✅ **Integraciones Reales Requeridas**
- **Supabase:** Base de datos PostgreSQL con RLS
- **Autenticación:** Supabase Auth con roles reales
- **Storage:** Supabase Storage para archivos adjuntos
- **Email:** Resend para notificaciones automáticas

### ✅ **Sin Datos Mock**
- ❌ Eliminar todos los datos mock
- ✅ Usar solo datos reales de Supabase
- ✅ Autenticación real con Supabase Auth

## 🚀 Configuración Paso a Paso

### 1. **Crear Proyecto en Supabase**

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota el **URL** y **anon key** del proyecto

### 2. **Configurar Variables de Entorno**

Crea el archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-real-aqui

# Opcional: Service Role Key para operaciones del servidor
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

### 3. **Ejecutar Script de Base de Datos**

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y ejecuta el contenido de `supabase/init.sql`
3. Esto creará todas las tablas, índices, RLS y datos iniciales

### 4. **Configurar Storage**

1. Ve a **Storage** en tu proyecto de Supabase
2. Crea un bucket llamado `candidate-files`
3. Configura las políticas RLS para el bucket

### 5. **Configurar Autenticación**

1. Ve a **Authentication > Settings**
2. Configura los providers que necesites (Google, Email)
3. Configura las URLs de redirección

## 🗄️ Estructura de Base de Datos

### **Tablas Principales**
- `users` - Usuarios del sistema con roles y permisos
- `applications` - Postulaciones de trabajo
- `candidates` - Candidatos por postulación
- `candidate_notes` - Notas y evaluaciones
- `candidate_attachments` - Archivos adjuntos
- `candidate_timeline` - Historial de cambios

### **Relaciones**
- `applications.responsible_id` → `users.id`
- `candidates.assignee_id` → `users.id`
- `candidates.application_id` → `applications.id`
- `candidate_notes.candidate_id` → `candidates.id`
- `candidate_attachments.candidate_id` → `candidates.id`

### **Row Level Security (RLS)**
- Usuarios solo ven sus datos asignados
- Admins ven todos los datos
- Políticas por rol y asignación

## 🔐 Autenticación y Roles

### **Roles Implementados**
- **Admin RRHH:** Acceso completo
- **Entrevistador:** Solo candidatos asignados

### **Permisos por Rol**
```typescript
// Admin RRHH
[
  'crear_postulaciones',
  'mover_etapas',
  'ver_todas_postulaciones',
  'gestionar_usuarios',
  'acceso_configuracion',
  'eliminar_candidatos',
  'editar_postulaciones',
  'usar_ia'
]

// Entrevistador
[
  'mover_etapas',
  'ver_postulaciones_asignadas'
]
```

## 📁 Storage para Archivos

### **Bucket: candidate-files**
- **CVs:** `/candidates/{candidate_id}/cv/`
- **Pruebas técnicas:** `/candidates/{candidate_id}/technical/`
- **Videos:** `/candidates/{candidate_id}/videos/`
- **Documentos:** `/candidates/{candidate_id}/documents/`

### **Políticas RLS para Storage**
```sql
-- Usuarios pueden ver archivos de candidatos asignados
CREATE POLICY "Users can view files for assigned candidates" ON storage.objects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidates 
    WHERE candidates.id::text = (storage.foldername(name))[1]
    AND candidates.assignee_id::text = auth.uid()::text
  )
);

-- Admins pueden ver todos los archivos
CREATE POLICY "Admins can view all files" ON storage.objects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::text = auth.uid()::text 
    AND role = 'Admin RRHH'
  )
);
```

## 🔄 Flujos de Datos

### **1. Autenticación**
```typescript
// Login con Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Obtener perfil de usuario
const { data: userProfile } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

### **2. Crear Postulación**
```typescript
const { data, error } = await supabase
  .from('applications')
  .insert({
    title: 'Desarrollador Frontend',
    area: 'Tecnología',
    location: 'Santiago, Chile',
    type: 'Tiempo completo',
    status: 'Activa',
    responsible_id: user.id,
    description: 'Descripción del puesto'
  })
  .select()
  .single()
```

### **3. Crear Candidato**
```typescript
const { data, error } = await supabase
  .from('candidates')
  .insert({
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '+56 9 1234 5678',
    position: 'Desarrollador Frontend',
    stage: 'pre-entrevista',
    assignee_id: user.id,
    application_id: applicationId,
    experience: '3 años',
    location: 'Santiago, Chile'
  })
  .select()
  .single()
```

### **4. Subir Archivo**
```typescript
const { data, error } = await supabase.storage
  .from('candidate-files')
  .upload(`candidates/${candidateId}/cv/${fileName}`, file)
```

## 🧪 Datos de Prueba Incluidos

### **Usuarios por Defecto**
- `admin@talentopro.com` - Admin RRHH
- `maria@empresa.com` - Admin RRHH
- `carlos@empresa.com` - Entrevistador
- `ana@empresa.com` - Entrevistador

### **Postulaciones de Ejemplo**
- Desarrollador Frontend Senior
- Product Manager
- UX Designer

### **Candidatos de Ejemplo**
- María González (Frontend)
- Juan Pérez (Product Manager)
- Sofia Martínez (UX Designer)

## 🔍 Verificación de Configuración

### **1. Verificar Conexión**
```typescript
// En la consola del navegador
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Is Configured:', isSupabaseConfigured())
```

### **2. Probar Autenticación**
```typescript
// Login con usuario de prueba
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@talentopro.com',
  password: '123456'
})
```

### **3. Probar Consultas**
```typescript
// Obtener postulaciones
const { data, error } = await supabase
  .from('applications')
  .select('*')
```

## 🐛 Troubleshooting

### **Error: "Supabase not configured"**
- Verifica que `.env.local` existe
- Verifica que las variables no son placeholders
- Reinicia el servidor después de crear `.env.local`

### **Error: "RLS policy violation"**
- Verifica que el usuario está autenticado
- Verifica que el usuario tiene permisos
- Verifica las políticas RLS en Supabase

### **Error: "Table does not exist"**
- Ejecuta el script `supabase/init.sql`
- Verifica que las tablas se crearon correctamente

## 📝 Notas Importantes

### **Seguridad**
- ✅ RLS habilitado en todas las tablas
- ✅ Políticas por rol y asignación
- ✅ Autenticación requerida
- ✅ Validación de permisos

### **Performance**
- ✅ Índices en campos frecuentemente consultados
- ✅ Consultas optimizadas con joins
- ✅ Paginación implementada

### **Escalabilidad**
- ✅ Estructura normalizada
- ✅ Relaciones bien definidas
- ✅ Políticas escalables

## 🎯 Estado Final

Una vez configurado correctamente:

- ✅ **Sin datos mock** - Solo datos reales de Supabase
- ✅ **Autenticación real** - Supabase Auth con roles
- ✅ **Base de datos completa** - PostgreSQL con RLS
- ✅ **Storage funcional** - Para archivos adjuntos
- ✅ **Seguridad implementada** - Políticas RLS
- ✅ **Datos de prueba** - Para testing inmediato

La aplicación estará completamente integrada con Supabase y lista para producción.


