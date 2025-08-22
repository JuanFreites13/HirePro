require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// CORS configurado para permitir el frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://hire-pro.vercel.app',
    'https://hire-pro-agendapro.vercel.app'
  ],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('combined'));

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HirePro Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'HirePro Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      email: '/api/send-email'
    }
  });
});

// Ruta para enviar emails (compatible con el frontend)
app.post('/api/send-email', async (req, res) => {
  try {
    const { 
      to, 
      subject, 
      message, 
      selectedPostulation, 
      createMeeting, 
      meetingDate, 
      meetingTime 
    } = req.body;

    // Validar campos requeridos
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: to, subject, message'
      });
    }

    console.log('📧 Solicitud de envío de email:', {
      to,
      subject,
      createMeeting,
      meetingDate,
      meetingTime
    });

    // Aquí iría la lógica real de envío de email
    // Por ahora simulamos el éxito
    const result = {
      success: true,
      message: 'Email enviado exitosamente',
      data: {
        to,
        subject,
        meetingCreated: createMeeting || false
      }
    };

    if (createMeeting && meetingDate && meetingTime) {
      result.data.meetingDetails = {
        date: meetingDate,
        time: meetingTime,
        link: 'https://meet.google.com/generated-link'
      };
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no capturado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 HirePro Backend funcionando en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
