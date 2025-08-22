# 🤖 API de Integración para Servicio de IA en Python

Esta documentación describe la API REST que permite al servicio Python integrarse con TalentoPro para procesar archivos y generar resúmenes de candidatos usando IA.

## 📋 Tabla de Contenidos

- [Flujo General](#flujo-general)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Tipos de Datos](#tipos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Manejo de Errores](#manejo-de-errores)

## 🔄 Flujo General

1. **Subida de Archivo**: Usuario sube archivo en TalentoPro
2. **Encolado Automático**: Sistema encola archivo para procesamiento de IA
3. **Obtención de Tarea**: Servicio Python consulta siguiente tarea
4. **Procesamiento**: Python procesa archivo (transcripción/análisis)
5. **Envío de Resultados**: Python envía resultados procesados
6. **Actualización**: Sistema actualiza resumen del candidato

## 🔐 Autenticación

Los endpoints de la API utilizan las siguientes claves:

```bash
# Variables de entorno necesarias
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Para acceso completo
```

## 🛠️ Endpoints

### 1. Obtener Cola de Procesamiento

**GET** `/api/ai-processing/queue`

Obtiene todos los items en la cola de procesamiento.

**Query Parameters:**
- `status` (opcional): Filtrar por estado (`pending`, `processing`, `completed`, `failed`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "candidate_id": 123,
      "processing_type": "file_analysis",
      "file_type": "pdf",
      "file_url": "https://...",
      "file_name": "cv.pdf",
      "status": "pending",
      "priority": 3,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 2. Obtener Siguiente Tarea

**GET** `/api/ai-processing/next-task`

Obtiene la siguiente tarea de mayor prioridad para procesar.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "candidateId": 123,
    "attachmentId": "attachment-uuid",
    "processingType": "file_analysis",
    "fileType": "pdf",
    "fileUrl": "https://storage.url/file.pdf",
    "fileName": "candidate-cv.pdf",
    "metadata": {
      "fileSize": 1024000,
      "uploadedBy": "user-id",
      "uploadedAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

Si no hay tareas:
```json
{
  "success": true,
  "data": null,
  "message": "No hay tareas pendientes"
}
```

### 3. Marcar Tarea como Iniciada

**POST** `/api/ai-processing/next-task`

Marca una tarea como "en procesamiento" para evitar que otro proceso la tome.

**Request Body:**
```json
{
  "taskId": "task-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tarea marcada como iniciada"
}
```

### 4. Completar Tarea

**POST** `/api/ai-processing/complete`

Marca una tarea como completada y envía los resultados del procesamiento.

**Request Body:**
```json
{
  "taskId": "task-uuid",
  "success": true,
  "errorMessage": null,
  "results": {
    "type": "file_analysis",
    "data": {
      "attachmentId": "attachment-uuid",
      "candidateId": 123,
      "analysisType": "cv_parsing",
      "extractedData": {
        "name": "Juan Pérez",
        "email": "juan@email.com",
        "skills": ["JavaScript", "Python", "React"],
        "experience": [
          {
            "company": "Tech Corp",
            "position": "Developer",
            "years": 2
          }
        ]
      },
      "structuredInfo": {
        "totalExperience": 5,
        "mainSkills": ["JavaScript", "Python"],
        "educationLevel": "University"
      },
      "rawText": "Texto extraído completo...",
      "confidenceScore": 0.95,
      "aiService": "openai-gpt4",
      "metadata": {
        "processingTime": 15.2,
        "tokensUsed": 1500
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tarea completada exitosamente"
}
```

### 5. Obtener Estado de Candidato

**GET** `/api/ai-processing/candidate/{id}/status`

Obtiene el estado de procesamiento de IA de un candidato específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "candidate_id": 123,
    "name": "Juan Pérez",
    "ai_processing_status": "completed",
    "ai_summary": "Desarrollador con 5 años de experiencia...",
    "ai_confidence_score": 0.95,
    "ai_skills_extracted": ["JavaScript", "Python", "React"],
    "total_files": 3,
    "pending_tasks": 0,
    "ai_summaries_count": 1
  }
}
```

## 📄 Tipos de Datos

### Tipos de Procesamiento

- `file_analysis`: Análisis de documentos (CVs, PDFs)
- `transcription`: Transcripción de audio/video
- `summary_generation`: Generación de resúmenes
- `candidate_creation`: Creación de candidatos vía IA

### Tipos de Análisis

- `cv_parsing`: Análisis de CV
- `document_analysis`: Análisis general de documentos
- `image_analysis`: Análisis de imágenes

### Estados de Tarea

- `pending`: Pendiente de procesamiento
- `processing`: En procesamiento
- `completed`: Completada exitosamente
- `failed`: Falló el procesamiento
- `retrying`: Reintentando después de fallo

## 💻 Ejemplos de Uso

### Ejemplo Python: Obtener y Procesar Tarea

```python
import requests
import json

API_BASE = "http://localhost:3000/api/ai-processing"

def get_next_task():
    """Obtiene la siguiente tarea para procesar"""
    response = requests.get(f"{API_BASE}/next-task")
    if response.ok:
        data = response.json()
        return data.get('data')
    return None

def start_task(task_id):
    """Marca tarea como iniciada"""
    response = requests.post(f"{API_BASE}/next-task", 
                           json={"taskId": task_id})
    return response.ok

def complete_task(task_id, results):
    """Completa tarea con resultados"""
    payload = {
        "taskId": task_id,
        "success": True,
        "results": results
    }
    response = requests.post(f"{API_BASE}/complete", json=payload)
    return response.ok

# Flujo principal
def process_files():
    while True:
        # Obtener siguiente tarea
        task = get_next_task()
        if not task:
            print("No hay tareas pendientes")
            break
            
        print(f"Procesando: {task['fileName']}")
        
        # Marcar como iniciada
        if not start_task(task['id']):
            continue
            
        # Procesar archivo según tipo
        if task['processingType'] == 'file_analysis':
            results = analyze_document(task['fileUrl'])
        elif task['processingType'] == 'transcription':
            results = transcribe_audio(task['fileUrl'])
            
        # Completar tarea
        complete_task(task['id'], results)
        print(f"Completado: {task['fileName']}")

def analyze_document(file_url):
    """Analiza documento y extrae información"""
    # Tu lógica de análisis con ChatGPT aquí
    return {
        "type": "file_analysis",
        "data": {
            "analysisType": "cv_parsing",
            "extractedData": {
                # Datos extraídos
            },
            "confidenceScore": 0.95,
            "aiService": "openai-gpt4"
        }
    }

def transcribe_audio(file_url):
    """Transcribe archivo de audio"""
    # Tu lógica de transcripción aquí
    return {
        "type": "transcription", 
        "data": {
            "transcriptionText": "Texto transcrito...",
            "languageDetected": "es",
            "confidenceScore": 0.92,
            "aiService": "whisper"
        }
    }
```

### Ejemplo: Generación de Resumen de Candidato

```python
def generate_candidate_summary(candidate_id, all_file_data):
    """Genera resumen completo del candidato"""
    
    # Combinar todos los datos extraídos
    combined_data = combine_file_analyses(all_file_data)
    
    # Generar resumen con ChatGPT
    summary = generate_ai_summary(combined_data)
    
    # Enviar resumen actualizado
    results = {
        "type": "summary_generation",
        "data": {
            "candidateId": candidate_id,
            "summary": summary,
            "confidenceScore": 0.90,
            "skills": extract_skills(combined_data),
            "experienceYears": calculate_experience(combined_data),
            "educationLevel": extract_education(combined_data),
            "metadata": {
                "sourcesCount": len(all_file_data),
                "generatedAt": datetime.utcnow().isoformat()
            }
        }
    }
    
    return results
```

## ❌ Manejo de Errores

### Errores Comunes

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Parámetros requeridos faltantes",
  "required": ["candidateId", "attachmentId"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Tarea no encontrada o ya iniciada"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Detalles específicos del error"
}
```

### Reintentos y Manejo de Fallos

```python
def complete_task_with_error(task_id, error_message):
    """Marca tarea como fallida"""
    payload = {
        "taskId": task_id,
        "success": False,
        "errorMessage": error_message
    }
    response = requests.post(f"{API_BASE}/complete", json=payload)
    return response.ok

# Ejemplo de manejo robusto
def process_task_safely(task):
    try:
        # Procesar archivo
        results = process_file(task)
        return complete_task(task['id'], results)
    except Exception as e:
        error_msg = f"Error procesando {task['fileName']}: {str(e)}"
        print(error_msg)
        return complete_task_with_error(task['id'], error_msg)
```

## 🔧 Configuración del Servicio Python

### Variables de Entorno Recomendadas

```bash
# TalentoPro API
TALENTOPRO_API_BASE=http://localhost:3000/api/ai-processing
TALENTOPRO_API_KEY=your_api_key  # Si se implementa autenticación

# OpenAI/ChatGPT
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4

# Whisper/Transcripción
WHISPER_API_KEY=your_whisper_key

# Configuración de procesamiento
MAX_CONCURRENT_TASKS=3
RETRY_ATTEMPTS=3
PROCESSING_TIMEOUT=300  # 5 minutos

# Logging
LOG_LEVEL=INFO
LOG_FILE=ai_processing.log
```

### Estructura Recomendada del Servicio

```
ai_service/
├── main.py              # Punto de entrada
├── processors/
│   ├── document_analyzer.py
│   ├── audio_transcriber.py
│   └── summary_generator.py
├── api/
│   └── talentopro_client.py
├── utils/
│   ├── file_downloader.py
│   └── error_handler.py
└── config.py
```

## 🚀 Deployment y Monitoreo

### Health Check

```python
def health_check():
    """Verifica conectividad con TalentoPro"""
    try:
        response = requests.get(f"{API_BASE}/queue?status=pending")
        return response.ok
    except:
        return False
```

### Métricas Recomendadas

- Tareas procesadas por minuto
- Tiempo promedio de procesamiento
- Tasa de errores por tipo de archivo
- Uso de tokens de IA
- Tiempo de respuesta de API

¡Esta API está diseñada para ser robusta, escalable y fácil de integrar con tu servicio Python de IA! 🚀

