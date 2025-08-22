# 🚀 HirePro Backend

Backend API para el sistema de gestión de talentos HirePro.

## 📋 Características

- ✅ **Envío de emails** con Resend
- ✅ **Creación de reuniones** con Google Meet
- ✅ **Análisis de candidatos** con IA
- ✅ **Gestión de candidatos y postulaciones**
- ✅ **API RESTful** con Express.js
- ✅ **CORS configurado** para frontend
- ✅ **Logging** con Morgan
- ✅ **Seguridad** con Helmet

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Google APIs** - Calendar y Meet
- **Resend** - Servicio de emails
- **Supabase** - Base de datos
- **OpenAI** - Análisis de IA

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/C4r0nt3fb/hirepro-backend.git
cd hirepro-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
# Editar .env con tus credenciales
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Ejecutar en producción
```bash
npm start
```

## 🔧 Variables de Entorno

Copia `env.example` a `.env` y configura:

```bash
# Server
NODE_ENV=development
PORT=3001

# Google API
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REFRESH_TOKEN=tu_refresh_token
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Email (Resend)
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=no-reply@agendapro-devops.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📡 Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Email
- `POST /api/email/send` - Enviar email
- `POST /api/email/interview` - Enviar email de entrevista

### Google Meet
- `POST /api/google-meet/create` - Crear reunión
- `DELETE /api/google-meet/delete/:eventId` - Eliminar reunión

### IA
- `POST /api/ai/analyze-candidate` - Analizar candidato

### Candidatos
- `GET /api/candidates` - Listar candidatos

### Postulaciones
- `GET /api/postulations` - Listar postulaciones

### Usuarios
- `GET /api/users` - Listar usuarios

## 🚀 Deploy en Render

### 1. Conectar repositorio
1. Ve a [Render.com](https://render.com)
2. Crea cuenta y conecta GitHub
3. Selecciona este repositorio

### 2. Configurar Web Service
- **Name:** `hirepro-backend`
- **Region:** Elige la más cercana
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan Type:** `Free`

### 3. Variables de entorno en Render
Agrega todas las variables del archivo `.env` en la sección "Environment Variables".

### 4. URLs de redirección
Actualiza las URLs de redirección en:
- **Google Cloud Console** - Agrega la URL de Render
- **Supabase** - Agrega la URL de Render

## 🔍 Monitoreo

- **Health Check:** `https://tu-dominio.onrender.com/health`
- **Logs:** Dashboard de Render → Tu servicio → Logs

## 🛠️ Desarrollo

### Scripts disponibles
```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm test           # Ejecutar tests (pendiente)
```

### Estructura del proyecto
```
├── routes/           # Rutas de la API
├── services/         # Servicios de negocio
├── lib/             # Utilidades y configuraciones
├── server.js        # Servidor principal
└── package.json     # Dependencias y scripts
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica las variables de entorno
3. Consulta la documentación de las APIs
4. Abre un issue en GitHub
# Test commit
