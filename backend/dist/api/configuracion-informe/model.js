"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionInforme = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const configuracionInformeSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    usuarioId: { type: String, required: true, index: true },
    contratoId: { type: String, required: true, index: true },
    nombre: { type: String, default: 'Configuración por defecto' },
    // Estructura de la plantilla - orden y visibilidad de secciones
    plantilla: {
        header: {
            visible: { type: Boolean, default: true },
            tituloPersonalizado: String,
            mostrarLogo: { type: Boolean, default: true }
        },
        secciones: [{
                id: String, // Identificador único de la sección
                tipo: String, // 'info-contrato', 'periodo', 'actividades', 'firmas', 'personalizado'
                titulo: String, // Título personalizado para la sección
                visible: { type: Boolean, default: true },
                orden: Number,
                columnas: { type: Number, default: 2 }, // Para grids
                campos: [{
                        id: String,
                        label: String,
                        visible: { type: Boolean, default: true },
                        orden: Number
                    }]
            }],
        footer: {
            visible: { type: Boolean, default: true },
            textoPersonalizado: String,
            mostrarFecha: { type: Boolean, default: true },
            mostrarLugar: { type: Boolean, default: true }
        }
    },
    // Estilos personalizados
    estilos: {
        fuente: { type: String, default: 'Arial' },
        colorPrimario: { type: String, default: '#3498db' },
        colorSecundario: { type: String, default: '#2c3e50' },
        margenes: {
            top: { type: Number, default: 40 },
            bottom: { type: Number, default: 40 },
            left: { type: Number, default: 40 },
            right: { type: Number, default: 40 }
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
exports.ConfiguracionInforme = mongoose_1.default.model('ConfiguracionInforme', configuracionInformeSchema);
