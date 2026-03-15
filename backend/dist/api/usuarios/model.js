"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const usuarioSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    nombre: { type: String },
    supabaseId: { type: String, required: true, unique: true },
    // Tokens de Google Calendar
    googleTokens: {
        access_token: { type: String },
        refresh_token: { type: String },
        scope: { type: String },
        token_type: { type: String },
        expiry_date: { type: Number },
        fecha_conexion: { type: Date }
    },
    preferencias: {
        notificaciones: { type: Boolean, default: true },
        calendarioConectado: { type: Boolean, default: false }
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});
exports.Usuario = mongoose_1.default.model('Usuario', usuarioSchema);
