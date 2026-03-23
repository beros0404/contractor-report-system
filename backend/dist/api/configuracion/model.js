"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuracion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const configuracionSchema = new mongoose_1.default.Schema({
    usuarioId: { type: String, required: true },
    contratoId: { type: String, required: true, unique: true },
    reportes: {
        frecuencia: {
            type: String,
            enum: ['semanal', 'quincenal', 'mensual'],
            default: 'mensual'
        },
        diaGeneracion: { type: Number, default: 30 },
        periodoActualInicio: { type: String, default: '' },
        periodoActualFin: { type: String, default: '' },
        plantillaSeleccionada: {
            type: String,
            enum: ['clasica', 'moderna', 'compacta'],
            default: 'clasica'
        }
    },
    notificaciones: {
        email: { type: Boolean, default: true },
        diasAnticipacion: { type: Number, default: 3 }
    },
    usuario: {
        nombre: { type: String, default: '' },
        email: { type: String, default: '' },
        notificaciones: { type: Boolean, default: true }
    }
}, {
    timestamps: {
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    }
});
configuracionSchema.index({ usuarioId: 1, contratoId: 1 });
exports.Configuracion = mongoose_1.default.model('Configuracion', configuracionSchema);
