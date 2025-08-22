# 🔧 Configuración de Supabase - Instrucciones

## ❌ Problema Actual

Las variables de entorno de Supabase están usando valores placeholder:
- `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`

Por eso no se pueden crear postulaciones ni candidatos.

## ✅ Solución

### Opción 1: Configurar Supabase Real (Recomendado)

#### 1. Crear cuenta en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

#### 2. Obtener credenciales
1. En tu proyecto de Supabase, ve a **Settings > API**
2. Copia la **URL** y **anon public key**

#### 3. Crear archivo .env.local
```bash
# En la raíz del proyecto, crea el archivo .env.local
touch .env.local
```

#### 4. Agregar credenciales reales
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-real-aqui

# Opcional: Service Role Key para operaciones del servidor
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

#### 5. Reiniciar el servidor
```bash
npm run dev
```

### Opción 2: Usar Modo Local (Sin Supabase)

Si no quieres configurar Supabase ahora, el código ya está preparado para funcionar en modo local:

1. **No necesitas hacer nada** - el código detectará automáticamente que Supabase no está configurado
2. **Los datos no persistirán** entre recargas de página
3. **Funciona perfectamente** para testing y desarrollo

## 🔍 Verificar Configuración

### 1. Revisar Debug Info
Ve a la página de debug y verifica:
- ✅ Supabase URL: Configurada
- ✅ Supabase Anon Key: Configurada
- ✅ Supabase Client: Disponible

### 2. Probar Creación
1. Intenta crear una nueva postulación
2. Intenta crear un nuevo candidato
3. Verifica que aparezcan en las listas

## 🚀 Flujos de Prueba

### Crear Postulación
1. Dashboard → "Nueva Postulación"
2. Llenar formulario
3. Crear → Debería redirigir a `/postulations/[id]`

### Crear Candidato
1. Postulación → "Agregar Candidato"
2. Llenar formulario
3. Crear → Debería redirigir a `/candidates/[id]`

### Ver Pipeline
1. Postulación → Vista "Pipeline"
2. Debería mostrar candidatos en etapas

## 🐛 Troubleshooting

### Error: "Supabase not configured"
- ✅ Normal si no tienes Supabase configurado
- ✅ El modo local funcionará automáticamente

### Error: "Environment variables not found"
- ❌ Verifica que el archivo `.env.local` existe
- ❌ Verifica que las variables están escritas correctamente
- ❌ Reinicia el servidor después de crear `.env.local`

### Error: "Placeholder values detected"
- ❌ Las credenciales son placeholders
- ❌ Reemplaza con credenciales reales de Supabase

### Los datos no persisten
- ✅ Normal en modo local
- ✅ Configura Supabase real para persistencia

## 📝 Notas Importantes

### Modo Local (Sin Supabase)
- ✅ Funciona perfectamente para desarrollo
- ✅ No requiere configuración adicional
- ❌ Los datos se pierden al recargar
- ❌ No hay sincronización entre usuarios

### Modo Supabase Real
- ✅ Datos persistentes
- ✅ Sincronización en tiempo real
- ✅ Autenticación real
- ❌ Requiere configuración inicial

## 🎯 Recomendación

Para **desarrollo y testing**: Usa el modo local (no hagas nada)
Para **producción**: Configura Supabase real siguiendo las instrucciones arriba
