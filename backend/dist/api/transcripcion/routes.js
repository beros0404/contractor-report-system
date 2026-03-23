"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const assemblyai_1 = require("assemblyai");
const stream_1 = require("stream");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de audio'));
        }
    }
});
const client = new assemblyai_1.AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});
router.post('/', upload.single('audio'), async (req, res) => {
    try {
        console.log('🔍 POST /api/transcripcion - Iniciando transcripción');
        if (!req.file) {
            console.log('❌ No se recibió archivo');
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        if (!process.env.ASSEMBLYAI_API_KEY) {
            console.log('❌ API Key no configurada');
            return res.status(500).json({ error: 'API Key de AssemblyAI no configurada' });
        }
        console.log(`📊 Archivo recibido: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
        const audioStream = stream_1.Readable.from(req.file.buffer);
        console.log('📡 Enviando a AssemblyAI...');
        const transcript = await client.transcripts.transcribe({
            audio: audioStream,
            language_code: 'es',
            punctuate: true,
            format_text: true
        });
        console.log('📡 Respuesta de AssemblyAI:', transcript);
        if (transcript.status === 'error') {
            console.error('❌ Error en transcripción:', transcript.error);
            return res.status(500).json({ error: 'Error en la transcripción' });
        }
        console.log('✅ Transcripción completada:', transcript.text?.substring(0, 100) + '...');
        res.json({
            texto: transcript.text,
            confidence: transcript.confidence,
            id: transcript.id
        });
    }
    catch (error) {
        console.error('❌ Error en transcripción:', error);
        let errorMessage = 'Error al transcribir audio';
        if (error.message?.includes('ENAMETOOLONG')) {
            errorMessage = 'El archivo de audio es demasiado grande';
        }
        else if (error.message?.includes('fetch failed')) {
            errorMessage = 'Error de conexión con el servicio de transcripción';
        }
        res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
});
exports.default = router;
