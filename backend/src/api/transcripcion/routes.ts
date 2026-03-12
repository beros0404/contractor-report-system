import { Router } from 'express';
import multer from 'multer';
import { AssemblyAI } from 'assemblyai';
import { Readable } from 'stream';

const router = Router();

// Configurar multer para manejar archivos en memoria con límite mayor
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio'));
    }
  }
});

// Inicializar cliente de AssemblyAI
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});

// POST /api/transcripcion - Transcribir audio
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

    // Convertir buffer a stream para enviar a AssemblyAI
    const audioStream = Readable.from(req.file.buffer);

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

  } catch (error: any) {
    console.error('❌ Error en transcripción:', error);
    
    // Mensaje de error más específico
    let errorMessage = 'Error al transcribir audio';
    if (error.message?.includes('ENAMETOOLONG')) {
      errorMessage = 'El archivo de audio es demasiado grande';
    } else if (error.message?.includes('fetch failed')) {
      errorMessage = 'Error de conexión con el servicio de transcripción';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message
    });
  }
});

export default router;