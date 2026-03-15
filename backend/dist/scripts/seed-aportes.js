"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const model_1 = require("../api/aportes/model");
dotenv_1.default.config();
const aportesIniciales = [
    {
        id: 'AP-001',
        actividadId: 'ACT-001',
        monto: 9,
        fecha: new Date(),
        estado: 'completado',
        descripcion: 'Aportes para reuniones institucionales'
    },
    {
        id: 'AP-002',
        actividadId: 'ACT-002',
        monto: 7,
        fecha: new Date(),
        estado: 'completado',
        descripcion: 'Aportes para informes técnicos'
    },
    {
        id: 'AP-003',
        actividadId: 'ACT-003',
        monto: 3,
        fecha: new Date(),
        estado: 'completado',
        descripcion: 'Aportes para seguimiento de indicadores'
    },
    {
        id: 'AP-004',
        actividadId: 'ACT-004',
        monto: 1,
        fecha: new Date(),
        estado: 'completado',
        descripcion: 'Aportes para licitaciones'
    },
    {
        id: 'AP-005',
        actividadId: 'ACT-005',
        monto: 6,
        fecha: new Date(),
        estado: 'completado',
        descripcion: 'Aportes para documentación'
    }
];
async function seedAportes() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        await model_1.Aporte.deleteMany({});
        console.log('🗑️  Colección de aportes limpiada');
        await model_1.Aporte.insertMany(aportesIniciales);
        console.log(`✅ ${aportesIniciales.length} aportes insertados`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
seedAportes();
