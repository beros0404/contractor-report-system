import express from 'express';
import cors from 'cors';
import { connectDB } from './database/connection';

import activityRoutes from './api/activities/routes';
import contractRoutes from './api/contracts/routes';
import aportesRoutes from './api/aportes/routes';
import evidenciasRoutes from './api/evidencias/routes';
import configuracionRoutes from './api/configuracion/routes';
import informeRoutes from './api/informes/routes';
import transcripcionRoutes from './api/transcripcion/routes';
import googleAuthRoutes from './api/auth/google/routes';
import googleDriveRoutes from './api/auth/google/drive.routes';
import informePdfRoutes from './api/informes/pdf.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS para producción - MUY IMPORTANTE
const allowedOrigins = [
  'http://localhost:3000',
  'https://contractor-report-system.vercel.app',
  'https://contractor-report-system.onrender.com'
].filter(Boolean);

// Configuración detallada de CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como apps móviles, postman, o mismo servidor)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `La política CORS para este sitio no permite acceso desde el origen: ${origin}`;
      console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
      return callback(new Error(msg), false);
    }
    
    console.log(`✅ CORS permitido para origen: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para logging de peticiones
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - Origen: ${req.headers.origin || 'directo'}`);
  next();
});

app.use(express.json());

// Ruta de health check mejorada
app.get('/api/health', (req, res) => {
  console.log('✅ Health check llamado desde:', req.headers.origin || 'directo');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'connected',
    cors: {
      allowedOrigins,
      currentOrigin: req.headers.origin || 'directo'
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Contractor Report System',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      activities: '/api/activities',
      contracts: '/api/contracts',
      aportes: '/api/aportes',
      evidencias: '/api/evidencias',
      configuracion: '/api/configuracion',
      informes: '/api/informes',
      auth: '/api/auth/google'
    }
  });
});

// Conectar a MongoDB
connectDB().then(() => {
  console.log('✅ Conectado a MongoDB - DocumentosContratistas');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// Rutas de la API
app.use('/api/activities', activityRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/aportes', aportesRoutes);
app.use('/api/evidencias', evidenciasRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/informes', informeRoutes);
app.use('/api/transcripcion', transcripcionRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth/google/drive', googleDriveRoutes);
app.use('/api/informes', informePdfRoutes);

// Manejo de errores 404
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔓 CORS permitido para:`, allowedOrigins);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});