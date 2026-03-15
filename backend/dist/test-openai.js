"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_service_1 = require("./services/openai.service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testOpenAI() {
    console.log('🔍 Probando conexión con OpenAI/Azure...');
    console.log('📡 Usando:', process.env.AZURE_OPENAI_ENDPOINT ? 'Azure OpenAI' : 'OpenAI estándar');
    const aportesEjemplo = [
        {
            fecha: new Date().toISOString(),
            descripcion: "Reunión con equipo de desarrollo para definir alcance del proyecto"
        },
        {
            fecha: new Date().toISOString(),
            descripcion: "Elaboración de documentación técnica y manuales de usuario"
        },
        {
            fecha: new Date().toISOString(),
            descripcion: "Pruebas de integración con sistema legacy"
        }
    ];
    const resumen = await (0, openai_service_1.generarResumenActividad)("Desarrollo e implementación de módulo de reportes", aportesEjemplo);
    console.log('✅ Resumen generado:');
    console.log(resumen);
}
testOpenAI();
