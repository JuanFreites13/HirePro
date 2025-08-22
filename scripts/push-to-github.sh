#!/bin/bash

echo "🚀 Subiendo TalentoPro a GitHub..."
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "Verificando estado de Git..."

# Verificar si hay cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    print_status "Hay cambios pendientes. Agregando archivos..."
    git add .
    git commit -m "Update: Preparando para deploy en producción"
fi

print_status "Configuración de autenticación GitHub:"
echo ""
echo "Para hacer push a GitHub, necesitas un Personal Access Token."
echo ""
echo "1. Ve a: https://github.com/settings/tokens"
echo "2. Haz clic en 'Generate new token (classic)'"
echo "3. Selecciona los scopes: repo, workflow"
echo "4. Copia el token generado"
echo ""

read -p "¿Ya tienes tu Personal Access Token? (y/n): " has_token

if [[ "$has_token" =~ ^[Yy]$ ]]; then
    print_status "Intentando push con autenticación..."
    
    # Intentar push (Git pedirá credenciales)
    if git push -u origin main; then
        print_success "✅ Código subido exitosamente a GitHub!"
        print_success "🌐 Repositorio: https://github.com/C4r0nt3fb/HirePro"
    else
        print_error "❌ Error al hacer push. Verifica tu token y credenciales."
        echo ""
        print_warning "Alternativas:"
        echo "1. Usar GitHub CLI: brew install gh && gh auth login"
        echo "2. Configurar SSH keys"
        echo "3. Usar el token en la URL: https://TOKEN@github.com/C4r0nt3fb/HirePro.git"
    fi
else
    print_warning "Por favor, crea tu Personal Access Token primero."
    echo ""
    print_status "Pasos detallados:"
    echo "1. Ve a https://github.com/settings/tokens"
    echo "2. Haz clic en 'Generate new token (classic)'"
    echo "3. Dale un nombre como 'TalentoPro Deploy'"
    echo "4. Selecciona scopes: repo, workflow"
    echo "5. Haz clic en 'Generate token'"
    echo "6. Copia el token (no lo pierdas!)"
    echo ""
    print_status "Luego ejecuta este script nuevamente."
fi

echo ""
print_status "Próximos pasos después del push exitoso:"
echo "1. 🌐 Vercel: https://vercel.com - Importar repositorio"
echo "2. 🔧 Configurar variables de entorno en Vercel"
echo "3. 📊 Configurar Supabase URLs de redirección"
echo "4. 🔑 Configurar Google Cloud URLs autorizadas"
echo ""
print_success "¡Tu proyecto estará listo para deploy!"
