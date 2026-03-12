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

const allowedOrigins = [
  'http://localhost:3000',
  'https://tu-frontend.vercel.app', 
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Conectar a MongoDB
connectDB();

// Rutas
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

app.get('/', (req, res) => {
  res.json({ message: 'API de Contractor Report System' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});