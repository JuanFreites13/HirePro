// Configuración de URLs de la API
const config = {
  // URL del backend (Render)
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hirepro-backend-otkb.onrender.com',
  
  // URL del frontend (Vercel)
  FRONTEND_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://hire-pro-agendapro.vercel.app',
  
  // URLs de las APIs
  API: {
    EMAIL: '/api/email',
    GOOGLE_MEET: '/api/google-meet',
    AI: '/api/ai',
    CANDIDATES: '/api/candidates',
    POSTULATIONS: '/api/postulations',
    USERS: '/api/users',
    HEALTH: '/health'
  }
};

// Función para obtener la URL completa de una API
export const getApiUrl = (endpoint) => {
  return `${config.BACKEND_URL}${endpoint}`;
};

// Función para obtener la URL del frontend
export const getFrontendUrl = () => {
  return config.FRONTEND_URL;
};

export default config;
