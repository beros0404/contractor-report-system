"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evidencia = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const evidenciaSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    actividadId: { type: String, required: true, index: true },
    contratoId: { type: String, required: true, index: true },
    usuarioId: { type: String, required: true, index: true },
    tipo: {
        type: String,
        enum: ['archivo', 'enlace', 'nota'],
        default: 'archivo'
    },
    nombre: { type: String },
    drive: {
        usado: { type: Boolean, default: false },
        carpetaId: String,
        carpetaNombre: String,
        url: String,
        archivoId: String
    },
    local: {
        usado: { type: Boolean, default: true },
        data: { type: Buffer },
        contentType: String,
        tamaño: Number
    },
    archivo: {
        nombre: String,
        tamaño: Number,
        tipo: String
    },
    enlace: {
        url: String,
        titulo: String,
        descripcion: String
    },
    nota: {
        contenido: String,
        titulo: String
    },
    fecha: { type: Date, default: Date.now },
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now }
});
evidenciaSchema.index({ id: 1 }, { unique: true });
evidenciaSchema.index({ usuarioId: 1, contratoId: 1, actividadId: 1 });
exports.Evidencia = mongoose_1.default.model('Evidencia', evidenciaSchema);
