"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aporte = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const aporteSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    contratoId: { type: String, required: true, index: true },
    usuarioId: { type: String, required: true, index: true },
    actividadId: { type: String, required: true, index: true },
    monto: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    estado: {
        type: String,
        enum: ['pendiente', 'completado', 'rechazado', 'borrador'],
        default: 'completado'
    },
    descripcion: String,
    evidenciaIds: [String],
    creadoEn: { type: Date, default: Date.now }
});
// Índices compuestos para búsquedas eficientes
aporteSchema.index({ usuarioId: 1, contratoId: 1 });
aporteSchema.index({ actividadId: 1, usuarioId: 1 });
exports.Aporte = mongoose_1.default.model('Aporte', aporteSchema);
