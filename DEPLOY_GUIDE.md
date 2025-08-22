# 🚀 Guía Completa de Deploy - TalentoPro

Esta guía te llevará paso a paso para hacer el deploy completo de TalentoPro en GitHub, Vercel y Render.

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub
- ✅ Cuenta de Vercel (gratuita)
- ✅ Cuenta de Render (gratuita)
- ✅ Cuenta de Supabase
- ✅ Cuenta de OpenAI
- ✅ Cuenta de Google Cloud Platform
- ✅ Cuenta de Resend

## 🔄 Paso 1: Preparar el Proyecto

### 1.1 Verificar configuración local

```bash
# Asegúrate de estar en el directorio del proyecto
cd TalentoPro

# Verificar que el proyecto funciona localmente
npm run dev
```

### 1.2 Verificar variables de entorno

Asegúrate de que tu archivo `.env.local` tenga todas las variables necesarias:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_key

# Google Calendar
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REFRESH_TOKEN=tu_refresh_token
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Resend
RESEND_API_KEY=tu_resend_key
```

## 🌐 Paso 2: GitHub

### 2.1 Crear repositorio

1. Ve a [GitHub](https://github.com)
2. Haz clic en "New repository"
3. Nombre: `talentopro`
4. Descripción: "Sistema de gestión de candidatos con IA"
5. **IMPORTANTE:** NO marques "Add a README file"
6. Haz clic en "Create repository"

### 2.2 Subir código

```bash
# Ejecutar el script de configuración
./scripts/deploy-setup.sh

# O manualmente:
git remote add origin https://github.com/TU_USUARIO/talentopro.git
git push -u origin main
```

## 🚀 Paso 3: Vercel (Frontend)

### 3.1 Conectar con GitHub

1. Ve a [Vercel](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Importa el repositorio `talentopro`
5. Haz clic en "Import"

### 3.2 Configurar variables de entorno

En Vercel, ve a **Settings > Environment Variables** y agrega:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_key

# Google Calendar
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REFRESH_TOKEN=tu_refresh_token
GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/auth/google/callback

# Resend
RESEND_API_KEY=tu_resend_key

# Application
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NODE_ENV=production
```

### 3.3 Configurar build

En **Settings > General**:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 3.4 Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build
3. Tu aplicación estará disponible en `https://tu-dominio.vercel.app`

## 🔧 Paso 4: Render (Backend - Opcional)

**Nota:** Si usas Vercel, no necesitas Render ya que Next.js incluye el backend.

### 4.1 Crear servicio

1. Ve a [Render](https://render.com)
2. Inicia sesión con GitHub
3. Haz clic en "New +" > "Web Service"
4. Conecta tu repositorio `talentopro`

### 4.2 Configurar servicio

- **Name:** `talentopro-backend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free

### 4.3 Variables de entorno

Agrega las mismas variables que en Vercel.

## 📊 Paso 5: Configurar Supabase

### 5.1 URLs de redirección

En tu proyecto de Supabase, ve a **Authentication > URL Configuration**:

```
# Agregar estas URLs:
https://tu-dominio.vercel.app/auth/callback
https://tu-dominio.vercel.app/dashboard
```

### 5.2 Verificar RLS

Asegúrate de que las políticas RLS estén configuradas correctamente:

```sql
-- Ejemplo de política para candidatos
CREATE POLICY "Users can view their own candidates" ON candidates
FOR ALL USING (auth.uid() = created_by);
```

## 🔑 Paso 6: Configurar Google Cloud

### 6.1 URLs autorizadas

En Google Cloud Console, ve a **APIs & Services > Credentials**:

1. Edita tu OAuth 2.0 Client ID
2. En "Authorized redirect URIs" agrega:
   ```
   https://tu-dominio.vercel.app/auth/google/callback
   ```

### 6.2 Verificar APIs

Asegúrate de que estas APIs estén habilitadas:
- Google Calendar API
- Google Drive API (si usas archivos)

## 📧 Paso 7: Configurar Resend

### 7.1 Dominio de email

1. Ve a [Resend](https://resend.com)
2. Agrega tu dominio de email
3. Configura los registros DNS
4. Verifica el dominio

### 7.2 API Key

Asegúrate de que tu API key esté configurada en las variables de entorno.

## 🧪 Paso 8: Probar el Deploy

### 8.1 Verificar funcionalidades

1. **Autenticación:** Registro e inicio de sesión
2. **Dashboard:** Carga de datos
3. **Candidatos:** Crear, editar, eliminar
4. **IA:** Análisis de candidatos
5. **Email:** Envío de emails
6. **Calendario:** Agendamiento de entrevistas

### 8.2 Logs y debugging

- **Vercel:** Function Logs en el dashboard
- **Supabase:** Logs en SQL Editor
- **Google Cloud:** Cloud Console > Logging

## 🔄 Paso 9: Deploy Automático

### 9.1 Configurar GitHub Actions (Opcional)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 9.2 Deploy manual

```bash
# Para hacer deploy manual
git add .
git commit -m "Update for production"
git push origin main
```

## 🚨 Solución de Problemas

### Error común: Variables de entorno

```bash
# Verificar variables en Vercel
vercel env ls

# Agregar variable
vercel env add VARIABLE_NAME
```

### Error común: Build falla

```bash
# Verificar build localmente
npm run build

# Verificar TypeScript
npm run type-check
```

### Error común: CORS

En Supabase, agrega tu dominio a las URLs permitidas:

```sql
-- En Authentication > Settings
-- Site URL: https://tu-dominio.vercel.app
```

## 📈 Monitoreo

### 9.1 Métricas importantes

- **Performance:** Vercel Analytics
- **Errors:** Vercel Function Logs
- **Database:** Supabase Dashboard
- **API Usage:** OpenAI, Google Cloud

### 9.2 Alertas

Configura alertas para:
- Build failures
- API rate limits
- Database errors
- High response times

## 🎉 ¡Listo!

Tu aplicación TalentoPro está ahora desplegada y funcionando en producción.

### URLs importantes:
- **Frontend:** `https://tu-dominio.vercel.app`
- **Backend:** `https://tu-dominio.vercel.app/api/*`
- **Supabase:** Tu proyecto de Supabase
- **Documentación:** README.md en GitHub

### Próximos pasos:
1. Configurar dominio personalizado
2. Implementar monitoreo
3. Configurar backups
4. Optimizar performance

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo de desarrollo.
