"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarResumenActividad = generarResumenActividad;
exports.generarResumenMultiple = generarResumenMultiple;
const openai_1 = __importDefault(require("openai"));
const useAzure = !!process.env.AZURE_OPENAI_ENDPOINT;
const openai = new openai_1.default({
    ...(useAzure ? {
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY || '' },
    } : {
        apiKey: process.env.OPENAI_API_KEY || '',
    })
});
async function generarResumenActividad(titulo, aportes) {
    try {
        if (!aportes || aportes.length === 0) {
            return "No se registraron aportes para esta actividad en el período.";
        }
        if (!process.env.OPENAI_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
            console.warn('⚠️ No hay API key configurada para OpenAI/Azure');
            return generarResumenLocal(titulo, aportes);
        }
        const textoAportes = aportes.map(ap => `- ${new Date(ap.fecha).toLocaleDateString('es-ES')}: ${ap.descripcion}`).join('\n');
        const prompt = `Como asistente de informes contractuales, genera un resumen ejecutivo CONCISO de máximo 3 oraciones para la siguiente actividad:

ACTIVIDAD: ${titulo}

APORTES REALIZADOS EN EL PERÍODO:
${textoAportes}

El resumen debe:
- Ser profesional y objetivo
- Destacar los logros principales
- Mantener un tono formal
- Máximo 3 oraciones
- En español`;
        const completion = await openai.chat.completions.create({
            ...(useAzure ? {
                model: '',
            } : {
                model: "gpt-3.5-turbo",
            }),
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente especializado en generar resúmenes ejecutivos para informes de gestión contractual. Tus resúmenes son concisos, profesionales y destacan los puntos clave."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });
        return completion.choices[0].message.content || "No se pudo generar el resumen automáticamente.";
    }
    catch (error) {
        console.error('Error generando resumen con OpenAI:', error);
        return generarResumenLocal(titulo, aportes);
    }
}
function generarResumenLocal(titulo, aportes) {
    if (!aportes || aportes.length === 0) {
        return "No se registraron aportes para esta actividad en el período.";
    }
    const cantidadAportes = aportes.length;
    const fechas = aportes.map(ap => new Date(ap.fecha).toLocaleDateString('es-ES'));
    const primeraFecha = fechas[0];
    const ultimaFecha = fechas[fechas.length - 1];
    if (cantidadAportes === 1) {
        return `Se realizó ${aportes[0].descripcion.toLowerCase()} el día ${primeraFecha}.`;
    }
    else {
        return `Se realizaron ${cantidadAportes} aportes durante el período del ${primeraFecha} al ${ultimaFecha}, incluyendo: ${aportes.map(ap => ap.descripcion.toLowerCase()).join(', ')}.`;
    }
}
async function generarResumenMultiple(actividades) {
    const actividadesConResumen = [];
    for (const actividad of actividades) {
        console.log(`🤖 Generando resumen para actividad: ${actividad.titulo}`);
        const resumen = await generarResumenActividad(actividad.titulo, actividad.aportes || []);
        actividadesConResumen.push({
            ...actividad,
            resumenAportes: resumen,
            resumenEditado: false
        });
    }
    return actividadesConResumen;
}
