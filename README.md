# HirePro Backend

Backend API para el sistema HirePro de gestión de candidatos.

## 🚀 Deployment

### Variables de entorno requeridas:

```env
NODE_ENV=production
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=no-reply@agendapro-devops.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
OPENAI_API_KEY=your_openai_api_key
```

### Comandos:

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm start
```

## 🔗 Endpoints

- `GET /health` - Health check
- `GET /` - API info
- `POST /api/send-email` - Enviar emails

## 🌐 Frontend

El frontend está en: [JuanFreites13/HirePro](https://github.com/JuanFreites13/HirePro)