"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Firma = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const firmaSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    usuarioId: { type: String, required: true, index: true },
    nombre: { type: String, required: true },
    imagen: { type: String, required: true }, // base64 de la firma
    tipo: { type: String, enum: ['contratista', 'supervisor', 'ambos'], default: 'ambos' },
    vecesUsada: { type: Number, default: 0 },
    ultimoUso: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
exports.Firma = mongoose_1.default.model('Firma', firmaSchema);
