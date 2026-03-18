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
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;

// Configuración de CORS actualizada
const allowedOrigins = [
    'http://localhost:3000',
    'https://contractor-report-system.vercel.app',
    process.env.FRONTEND_URL || 'https://contractor-report-system.vercel.app'
].filter(Boolean);

app.use((0, cors_1.default)({
    origin: function(origin, callback) {
        // Permitir peticiones sin origen (como apps móviles o postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para manejar preflight requests
app.options('*', (0, cors_1.default)());

app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));

// Configuración de sesiones (necesario para Google OAuth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60 // = 14 días
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 días
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
} else {
    // Logging básico en producción
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Conectar a MongoDB
console.log('🔄 Intentando conectar a MongoDB...');
console.log('URI existe:', !!process.env.MONGODB_URI);

(0, connection_1.connectDB)().then(() => {
  console.log('✅ Conexión a MongoDB exitosa');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  process.exit(1);
});
(async () => {
    try {
        await (0, connection_1.connectDB)();
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
})();

// Rutas
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

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Contractor Report System',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            activities: '/api/activities',
            contracts: '/api/contracts',
            auth: '/api/auth/google'
        }
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend permitido: ${allowedOrigins.join(', ')}`);
});