"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const model_1 = require("../api/evidencias/model"); // Asumiendo que tienes el modelo
dotenv_1.default.config();
const evidenciasIniciales = [
    {
        id: 'EV-001',
        actividadId: 'ACT-001',
        nombre: 'Evidencia reunión 1',
        url: '/uploads/evidencia1.pdf',
        fecha: new Date(),
        tipo: 'documento'
    },
    {
        id: 'EV-002',
        actividadId: 'ACT-001',
        nombre: 'Evidencia reunión 2',
        url: '/uploads/evidencia2.pdf',
        fecha: new Date(),
        tipo: 'documento'
    },
    // ... más evidencias según los datos de la imagen
];
async function seedEvidencias() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        await model_1.Evidencia.deleteMany({});
        console.log('🗑️  Colección de evidencias limpiada');
        await model_1.Evidencia.insertMany(evidenciasIniciales);
        console.log(`✅ ${evidenciasIniciales.length} evidencias insertadas`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
seedEvidencias();
