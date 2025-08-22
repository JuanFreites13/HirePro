# 🚀 Guía de Deploy en Render

## 📋 Prerrequisitos

1. **Cuenta en Render:** [https://render.com](https://render.com)
2. **Repositorio en GitHub:** Ya configurado
3. **Variables de entorno:** Preparadas

## 🔧 Pasos para el Deploy

### 1. Crear cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en "Get Started"
3. Conecta tu cuenta de GitHub
4. Autoriza el acceso a tu repositorio

### 2. Crear Web Service

1. En el dashboard de Render, haz clic en **"New"** → **"Web Service"**
2. Selecciona tu repositorio: `C4r0nt3fb/HirePro`
3. Configura el servicio:

   **Configuración básica:**
   - **Name:** `talentopro-backend`
   - **Region:** Elige la más cercana (ej: US East)
   - **Branch:** `main`
   - **Root Directory:** `.` (dejar vacío)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`

### 3. Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega todas estas variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
OPENAI_API_KEY=tu_openai_api_key
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REFRESH_TOKEN=tu_google_refresh_token
GOOGLE_REDIRECT_URI=https://tu-dominio-render.onrender.com/auth/google/callback
RESEND_API_KEY=tu_resend_api_key
NEXT_PUBLIC_APP_URL=https://tu-dominio-render.onrender.com
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu-dominio-render.onrender.com` con la URL que Render te asigne
- Usa los mismos valores que tienes en Vercel, excepto las URLs que deben apuntar a Render

### 4. Crear el Servicio

1. Haz clic en **"Create Web Service"**
2. Render comenzará el deploy automáticamente
3. Monitorea los logs para ver el progreso

### 5. Obtener la URL del Servicio

Una vez completado el deploy, Render te proporcionará una URL como:
`https://talentopro-backend.onrender.com`

## 🔄 Actualizar Configuraciones Externas

### Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Navega a **APIs & Services** → **Credentials**
3. Edita tus credenciales de OAuth 2.0
4. En **"Authorized redirect URIs"**, agrega:
   ```
   https://tu-dominio-render.onrender.com/auth/google/callback
   ```

### Supabase

1. Ve a tu dashboard de Supabase
2. Navega a **Authentication** → **URL Configuration**
3. En **"Site URL"**, agrega:
   ```
   https://tu-dominio-render.onrender.com
   ```
4. En **"Redirect URLs"**, agrega:
   ```
   https://tu-dominio-render.onrender.com/auth/callback
   ```

## 🧪 Probar el Deploy

Una vez desplegado, puedes probar las APIs:

```bash
# Probar la API de análisis de IA
curl -X POST https://tu-dominio-render.onrender.com/api/ai/analyze-candidate \
  -F "description=Juan Pérez es un desarrollador frontend con 3 años de experiencia"

# Probar la API de envío de emails
curl -X POST https://tu-dominio-render.onrender.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","content":"Hello"}'
```

## 🔍 Monitoreo y Logs

- **Logs en tiempo real:** En el dashboard de Render, ve a tu servicio y haz clic en "Logs"
- **Métricas:** Render proporciona métricas básicas de uso
- **Health checks:** Render verifica automáticamente que tu servicio esté funcionando

## 🚨 Solución de Problemas

### Error: "Build failed"
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build para errores específicos

### Error: "Service failed to start"
- Verifica que el comando `npm start` funcione localmente
- Revisa que todas las variables de entorno estén configuradas

### Error: "API not responding"
- Verifica que las URLs de Google Cloud y Supabase estén actualizadas
- Revisa los logs del servicio para errores específicos

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica la configuración de variables de entorno
3. Prueba las APIs localmente primero
4. Consulta la documentación de Render: [https://render.com/docs](https://render.com/docs)
