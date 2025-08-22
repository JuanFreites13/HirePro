# Configuración de Supabase para TalentoPro

Este documento te guía para configurar Supabase como base de datos para el proyecto TalentoPro, reemplazando los datos mock.

## 📋 Prerrequisitos

- Cuenta en [Supabase](https://supabase.com)
- Node.js y npm/pnpm instalados
- Proyecto TalentoPro corriendo localmente

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la **URL del proyecto** y la **API Key anónima**

### 2. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp supabase-config.example .env.local
   ```

2. Edita `.env.local` y agrega tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-api-key-anonima
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

### 3. Ejecutar Script de Inicialización

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `supabase/init.sql`
3. Ejecuta el script

### 4. Configurar Autenticación (Opcional)

Si quieres usar autenticación real de Supabase:

1. Ve a **Authentication > Settings** en tu dashboard
2. Configura los proveedores que necesites (Email, Google, etc.)
3. Configura las URLs de redirección:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

### 5. Configurar Storage (Opcional)

Para archivos adjuntos:

1. Ve a **Storage** en tu dashboard
2. Crea un bucket llamado `attachments`
3. Configura las políticas RLS según necesites

## 🔧 Estructura de la Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema con roles y permisos
- **applications**: Postulaciones de trabajo
- **candidates**: Candidatos para las postulaciones
- **candidate_notes**: Notas y evaluaciones de candidatos
- **candidate_attachments**: Archivos adjuntos de candidatos
- **candidate_timeline**: Timeline de etapas del candidato

### Usuario Administrador por Defecto

```
Email: admin@talentopro.com
Password: 123456
Rol: Admin RRHH
```

### Datos de Prueba Incluidos

- 4 usuarios con diferentes roles
- 3 postulaciones de ejemplo
- 3 candidatos con datos completos
- Notas y archivos adjuntos de ejemplo

## 🔐 Seguridad

### Row Level Security (RLS)

El script configura RLS en todas las tablas con las siguientes políticas:

- **Usuarios**: Solo pueden ver su propio perfil (Admin ve todos)
- **Postulaciones**: Solo ven las que son responsables (Admin ve todas)
- **Candidatos**: Solo ven los asignados (Admin ve todos)
- **Notas/Archivos**: Solo ven los de candidatos asignados (Admin ve todos)

### Permisos por Rol

#### Admin RRHH
- Crear y editar postulaciones
- Mover candidatos entre etapas
- Ver todas las postulaciones
- Gestionar usuarios
- Acceso a configuración
- Eliminar candidatos

#### Entrevistador
- Mover etapas de candidatos asignados
- Ver postulaciones asignadas
- Agregar notas y evaluaciones

## 🧪 Testing

### Credenciales de Prueba

```
Admin:
- Email: admin@talentopro.com
- Password: 123456

Entrevistador:
- Email: carlos@empresa.com
- Password: 123456

Entrevistador (solo lectura):
- Email: ana@empresa.com
- Password: 123456
```

### Verificar Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Inicia sesión con las credenciales de prueba
3. Verifica que los datos se cargan desde Supabase
4. Prueba crear, editar y eliminar registros

## 🔄 Fallback a Datos Mock

El sistema está diseñado para funcionar con **fallback automático**:

- Si Supabase no está configurado → Usa datos mock
- Si hay errores de conexión → Usa datos mock
- Si las variables de entorno faltan → Usa datos mock

Esto permite que el proyecto funcione inmediatamente sin configuración adicional.

## 📊 Analytics y Vistas

El script crea vistas para analytics:

- **application_stats**: Estadísticas por postulación
- **user_stats**: Estadísticas por usuario
- **get_candidate_full_data()**: Función para obtener datos completos de candidato

## 🚨 Troubleshooting

### Error: "Missing Supabase environment variables"

- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor después de cambiar variables de entorno

### Error: "Row Level Security policy violation"

- Verifica que el usuario tiene los permisos correctos
- Revisa las políticas RLS en el dashboard de Supabase

### Error: "Foreign key constraint violation"

- Asegúrate de que los datos de prueba se insertaron correctamente
- Verifica que los UUIDs coinciden entre tablas

### Los datos no se cargan

- Verifica la conexión a Supabase en la consola del navegador
- Revisa que las tablas existen y tienen datos
- Comprueba que las políticas RLS permiten acceso

## 📝 Notas Importantes

1. **Desarrollo vs Producción**: Usa diferentes proyectos de Supabase
2. **Backup**: Hacer backup regular de la base de datos
3. **Migraciones**: Usar el script SQL para migraciones futuras
4. **Performance**: Los índices están optimizados para consultas comunes
5. **Escalabilidad**: La estructura permite crecimiento futuro

## 🔗 Enlaces Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript)
- [Dashboard de Supabase](https://app.supabase.com)

---

¡Con esto ya tienes Supabase configurado y funcionando en tu proyecto TalentoPro! 🎉



