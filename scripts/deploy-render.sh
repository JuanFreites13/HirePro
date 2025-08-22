#!/bin/bash

echo "🚀 Configurando deploy en Render..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en el directorio raíz del proyecto"
    exit 1
fi

# Verificar que el archivo server.js existe
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js no encontrado"
    exit 1
fi

echo "✅ Archivos de configuración verificados"

# Hacer commit de los cambios si hay alguno
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Haciendo commit de cambios..."
    git add .
    git commit -m "Update: Prepare for Render deployment"
    git push
    echo "✅ Cambios subidos a GitHub"
else
    echo "✅ No hay cambios pendientes"
fi

echo ""
echo "🎯 Próximos pasos para Render:"
echo ""
echo "1. Ve a https://render.com"
echo "2. Crea una cuenta y conecta tu GitHub"
echo "3. Haz clic en 'New' → 'Web Service'"
echo "4. Selecciona tu repositorio: C4r0nt3fb/HirePro"
echo "5. Configura el servicio:"
echo "   - Name: talentopro-backend"
echo "   - Region: Elige la más cercana"
echo "   - Branch: main"
echo "   - Root Directory: . (dejar vacío)"
echo "   - Runtime: Node"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Plan Type: Free"
echo ""
echo "6. En Environment Variables, agrega:"
echo "   NODE_ENV=production"
echo "   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key"
echo "   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key"
echo "   OPENAI_API_KEY=tu_openai_api_key"
echo "   GOOGLE_CLIENT_ID=tu_google_client_id"
echo "   GOOGLE_CLIENT_SECRET=tu_google_client_secret"
echo "   GOOGLE_REFRESH_TOKEN=tu_google_refresh_token"
echo "   GOOGLE_REDIRECT_URI=https://tu-dominio-render.onrender.com/auth/google/callback"
echo "   RESEND_API_KEY=tu_resend_api_key"
echo "   NEXT_PUBLIC_APP_URL=https://tu-dominio-render.onrender.com"
echo ""
echo "7. Haz clic en 'Create Web Service'"
echo ""
echo "8. Una vez desplegado, actualiza Google Cloud:"
echo "   - Ve a https://console.cloud.google.com"
echo "   - APIs & Services → Credentials"
echo "   - Edita tus credenciales OAuth 2.0"
echo "   - Agrega la URL de Render a 'Authorized redirect URIs'"
echo ""
echo "9. Actualiza Supabase:"
echo "   - Ve a tu dashboard de Supabase"
echo "   - Authentication → URL Configuration"
echo "   - Agrega la URL de Render"
echo ""
echo "🎉 ¡Listo! Tu backend estará funcionando en Render"
