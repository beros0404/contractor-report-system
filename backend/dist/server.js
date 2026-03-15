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
    'https://tu-frontend.vercel.app',
    process.env.FRONTEND_URL || ''
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Logging en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}
// Conectar a MongoDB
(0, connection_1.connectDB)();
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
app.get('/', (req, res) => {
    res.json({ message: 'API de Contractor Report System' });
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
