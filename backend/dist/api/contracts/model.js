"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contractSchema = new mongoose_1.default.Schema({
    numero: { type: String, required: true },
    entidad: { type: String, required: true },
    dependenciaContratante: { type: String, default: 'hola' },
    objeto: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    valor: { type: Number, required: true },
    contratistaNombre: { type: String, required: true },
    contratistaCedula: { type: String, required: true },
    contratistaProfesion: { type: String, default: '' },
    supervisorNombre: { type: String, required: true },
    supervisorCargo: { type: String, default: '' },
    numeroPlantillaSocial: { type: String, default: '' },
    administradorPlantilla: { type: String, default: '' },
    otroAdministradorPlantilla: { type: String, default: '' },
    lugarFirma: { type: String, default: 'Rionegro' },
    fechaFirma: { type: Date },
    usuarioId: { type: String, required: true, index: true },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'finalizado'],
        default: 'activo'
    },
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now }
}, {
    timestamps: true
});
contractSchema.index({ usuarioId: 1, estado: 1 });
exports.Contract = mongoose_1.default.model('Contract', contractSchema);
