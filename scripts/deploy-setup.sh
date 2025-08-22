#!/bin/bash

echo "🚀 Configurando deploy de TalentoPro..."
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Verificando configuración actual..."

# Verificar si ya existe un remote
if git remote -v | grep -q "origin"; then
    print_warning "Ya existe un remote 'origin'. ¿Quieres sobrescribirlo? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        print_error "Operación cancelada."
        exit 1
    fi
fi

# Solicitar información del repositorio
echo ""
print_status "Configuración de GitHub:"
echo "1. Ve a https://github.com/new"
echo "2. Crea un nuevo repositorio llamado 'talentopro'"
echo "3. NO inicialices con README, .gitignore o licencia"
echo "4. Copia la URL del repositorio"
echo ""

read -p "Ingresa la URL del repositorio GitHub (ej: https://github.com/tu-usuario/talentopro.git): " repo_url

if [ -z "$repo_url" ]; then
    print_error "URL del repositorio es requerida."
    exit 1
fi

# Agregar remote y hacer push
print_status "Agregando remote origin..."
git remote add origin "$repo_url"

print_status "Haciendo push al repositorio..."
git push -u origin main

if [ $? -eq 0 ]; then
    print_success "✅ Repositorio configurado exitosamente!"
else
    print_error "❌ Error al hacer push. Verifica la URL y tus credenciales."
    exit 1
fi

echo ""
print_status "Configuración de variables de entorno para producción:"
echo ""

# Crear archivo de variables de entorno para producción
cat > .env.production << EOF
# Variables de entorno para producción
# Copia los valores de .env.local y ajusta según sea necesario

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/google/callback

# Resend
RESEND_API_KEY=your_resend_api_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
EOF

print_success "✅ Archivo .env.production creado"

echo ""
print_status "Próximos pasos para el deploy:"
echo ""
echo "1. 🌐 VERCEL (Frontend):"
echo "   - Ve a https://vercel.com"
echo "   - Conecta tu cuenta de GitHub"
echo "   - Importa el repositorio 'talentopro'"
echo "   - Configura las variables de entorno en Settings > Environment Variables"
echo "   - Deploy automático en cada push a main"
echo ""
echo "2. 🔧 RENDER (Backend - Opcional):"
echo "   - Ve a https://render.com"
echo "   - Crea un nuevo Web Service"
echo "   - Conecta con GitHub y selecciona el repositorio"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Configura las variables de entorno"
echo ""
echo "3. 📊 SUPABASE:"
echo "   - Verifica que tu proyecto de Supabase esté configurado"
echo "   - Actualiza las URLs de redirección en Authentication > URL Configuration"
echo "   - Agrega tu dominio de Vercel a las URLs permitidas"
echo ""
echo "4. 🔑 GOOGLE CLOUD:"
echo "   - Actualiza las URLs de redirección en Google Cloud Console"
echo "   - Agrega tu dominio de Vercel a las URLs autorizadas"
echo ""

print_success "🎉 Configuración completada! Tu proyecto está listo para deploy."
