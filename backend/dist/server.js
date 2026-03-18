"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./database/connection");
const routes_1 = __importDefault(require("./api/activities/routes"));
const routes_2 = __importDefault(require("./api/contracts/routes"));
const routes_3 = __importDefault(require("./api/aportes/routes"));
const routes_4 = __importDefault(require("./api/evidencias/routes"));
const routes_5 = __importDefault(require("./api/configuracion/routes"));
const routes_6 = __importDefault(require("./api/informes/routes"));
const routes_7 = __importDefault(require("./api/transcripcion/routes"));
const routes_8 = __importDefault(require("./api/auth/google/routes"));
const drive_routes_1 = __importDefault(require("./api/auth/google/drive.routes"));
const pdf_routes_1 = __importDefault(require("./api/informes/pdf.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
    'http://localhost:3000',
    'https://contractor-report-system.vercel.app',
    'https://contractor-report-system.onrender.com'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: ['https://contractor-report-system.vercel.app', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url} - Origen: ${req.headers.origin || 'directo'}`);
    next();
});
app.use(express_1.default.json());
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
(0, connection_1.connectDB)().then(() => {
    console.log('✅ Conectado a MongoDB - DocumentosContratistas');
}).catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
});
// Rutas de la API
app.use('/api/activities', routes_1.default);
app.use('/api/contracts', routes_2.default);
app.use('/api/aportes', routes_3.default);
app.use('/api/evidencias', routes_4.default);
app.use('/api/configuracion', routes_5.default);
app.use('/api/informes', routes_6.default);
app.use('/api/transcripcion', routes_7.default);
app.use('/api/auth/google', routes_8.default);
app.use('/api/auth/google/drive', drive_routes_1.default);
app.use('/api/informes', pdf_routes_1.default);
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
