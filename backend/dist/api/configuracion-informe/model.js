"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionInforme = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConfiguracionInformeSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    usuarioId: { type: String, required: true },
    contratoId: { type: String, required: true },
    columnas: { type: Number, default: 2, enum: [1, 2] },
    campos: [{
            id: String,
            label: String,
            value: String,
            tipo: String,
            visible: Boolean,
            orden: Number,
            zona: String
        }],
    actividades: [{
            id: String,
            actividad: String,
            resumen: String,
            evidencias: String
        }],
    bloquesTexto: [{
            id: String,
            titulo: String,
            descripcion: String,
            zona: String
        }],
    firmas: [{
            titulo: String,
            campoRef: String,
            cargo: String
        }],
    lugarFecha: String,
    dependenciaContratante: String,
    seguridadSocial: {
        numeroPlantilla: String,
        administrador: String,
        otroAdministrador: String
    }
}, { timestamps: true });
exports.ConfiguracionInforme = mongoose_1.default.models.ConfiguracionInforme ||
    mongoose_1.default.model('ConfiguracionInforme', ConfiguracionInformeSchema);
