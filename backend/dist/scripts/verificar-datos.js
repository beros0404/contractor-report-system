"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const model_1 = require("../api/aportes/model");
dotenv_1.default.config();
async function verificarDatos() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        // Verificar aportes por usuario
        const usuarioId = 'e475df86-bf65-48fc-89a3-a299d009f0c7'; // Reemplaza con tu usuarioId
        const aportes = await model_1.Aporte.find({ usuarioId });
        console.log(`\n📊 Total aportes para usuario ${usuarioId}: ${aportes.length}`);
        // Agrupar por contrato
        const porContrato = {};
        aportes.forEach(ap => {
            porContrato[ap.contratoId] = (porContrato[ap.contratoId] || 0) + 1;
        });
        console.log('\n📦 Aportes por contrato:');
        Object.entries(porContrato).forEach(([contratoId, count]) => {
            console.log(`   - Contrato ${contratoId}: ${count} aportes`);
        });
        // Verificar si hay aportes sin contratoId
        const sinContrato = await model_1.Aporte.find({ contratoId: { $exists: false } });
        if (sinContrato.length > 0) {
            console.log(`\n⚠️ Hay ${sinContrato.length} aportes sin contratoId`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
verificarDatos();
