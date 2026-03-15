"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const activitySchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    contratoId: { type: String, required: true, index: true },
    usuarioId: { type: String, required: true, index: true },
    numero: { type: Number, required: true },
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipo: {
        type: String,
        enum: ['automatica', 'gestion_detectada', 'ia_sugerida'],
        default: 'automatica'
    },
    porcentajePeso: { type: Number, default: 0 },
    estado: {
        type: String,
        enum: ['activa', 'baja', 'sin_inicio', 'completada'],
        default: 'activa'
    },
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now }
});
activitySchema.index({ usuarioId: 1, contratoId: 1 });
exports.Activity = mongoose_1.default.model('Activity', activitySchema);
