# Configuración del Sistema de Análisis de IA

## 🎯 Funcionalidades Implementadas

### ✅ **Análisis de IA Completo**
- **Extracción de texto de PDFs y documentos Word**
- **Transcripción de videos de entrevista** (usando Whisper API)
- **Análisis completo de candidatos con ChatGPT**
- **Candidatos globales reutilizables**
- **Storage de archivos en Supabase**

### ✅ **Sistema de Candidatos Globales**
- Los candidatos se crean una vez y se pueden aplicar a múltiples postulaciones
- Información master almacenada en `global_candidates`
- Aplicaciones específicas en la tabla `candidates` existente
- Evita duplicación de datos

## 🔧 Configuración Requerida

### **1. Variables de Entorno (agregar a .env.local)**

```env
# OpenAI API Key (REQUERIDA para IA real)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase (YA CONFIGURADAS)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### **2. Base de Datos (ejecutar en Supabase SQL Editor)**

```sql
-- El archivo supabase/schema.sql contiene todo el SQL necesario
-- Crea:
-- - Tabla global_candidates
-- - Bucket de storage candidate-files
-- - Políticas de acceso
-- - Índices y triggers
```

### **3. Obtener API Key de OpenAI**

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API Key
3. Agrega créditos a tu cuenta ($5-10 USD es suficiente para empezar)
4. Agrega la key a tu `.env.local`

## 📋 Capacidades del Sistema

### **🤖 Análisis de IA**
- **PDFs**: Extrae texto completo usando `pdf-parse`
- **Word Documents**: Extrae texto de .docx usando `mammoth`
- **Videos**: Transcribe audio y analiza presentación
- **ChatGPT**: Analiza todo el contenido y extrae:
  - Información personal (nombre, email, teléfono)
  - Experiencia y habilidades
  - Fortalezas y áreas de mejora
  - Puntaje y recomendación
  - Etapa sugerida del proceso

### **📁 Storage de Archivos**
- CVs y videos se suben a Supabase Storage
- URLs públicas para acceso
- Organización por candidato y fecha

### **👥 Candidatos Globales**
- Un candidato puede aplicar a múltiples postulaciones
- Información master se mantiene actualizada
- Histórico de aplicaciones por candidato

## 🎮 Cómo Usar

### **1. Con API Key de OpenAI (Recomendado)**
1. Configurar OPENAI_API_KEY en .env.local
2. Ejecutar el SQL schema en Supabase
3. El sistema procesará archivos reales y usará IA real

### **2. Sin API Key (Modo Simulación)**
- El sistema usa datos simulados inteligentes
- Analiza la descripción textual proporcionada
- Genera datos realistas basados en palabras clave
- Ideal para desarrollo y testing

## 💰 Costos Estimados

### **OpenAI API**
- **Análisis de CV**: ~$0.01-0.03 por candidato
- **Transcripción de video**: ~$0.006 por minuto de audio
- **Análisis completo**: ~$0.05-0.10 por candidato con archivos

### **Supabase Storage**
- **Gratis**: Hasta 1GB
- **Después**: $0.021 per GB/mes

## ⚡ Flujo del Sistema

1. **Usuario sube CV/video** → Archivos se procesan y suben a Storage
2. **IA analiza contenido** → ChatGPT extrae información estructurada
3. **Verifica candidato existente** → Busca por email en global_candidates
4. **Crea/actualiza candidato global** → Información master actualizada
5. **Crea aplicación específica** → Relación con postulación particular
6. **Muestra resultado** → Datos extraídos listos para revisión

## 🔍 Estructura de Datos

### **global_candidates**
```sql
id, name, email, phone, position, experience, location, 
source, skills[], cv_url, video_url, ai_analysis{}, 
created_at, updated_at
```

### **candidates (tabla existente)**
```sql
... campos existentes ...
candidate_id → referencia a global_candidates.id
```

¡El sistema está listo para usar! Solo necesitas la API Key de OpenAI para funcionalidad completa.

