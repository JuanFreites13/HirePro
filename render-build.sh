#!/bin/bash
echo "🔧 Preparando backend para Render..."

# Verificar si los archivos existen
if [ ! -f "backend-package.json" ]; then
    echo "❌ Error: backend-package.json no encontrado"
    exit 1
fi

if [ ! -f "backend-server.js" ]; then
    echo "❌ Error: backend-server.js no encontrado"
    exit 1
fi

# Copiar archivos del backend
echo "📦 Copiando package.json del backend..."
cp backend-package.json package.json

echo "🚀 Copiando servidor del backend..."
cp backend-server.js server.js

echo "📥 Instalando dependencias..."
npm install

echo "✅ Build completado!"
