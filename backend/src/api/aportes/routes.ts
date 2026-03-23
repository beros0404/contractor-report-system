import { Router } from 'express';
import { Aporte } from './model';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    console.log('🔍 GET /api/aportes - usuarioId:', usuarioId, 'contratoId:', contratoId);
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }

    const aportes = await Aporte.find({ 
      usuarioId: usuarioId.toString(),
      contratoId: contratoId.toString() 
    }).sort({ fecha: -1 });
    
    console.log(`✅ ${aportes.length} aportes encontrados`);
    res.json(aportes);
  } catch (error) {
    console.error('❌ Error obteniendo aportes:', error);
    res.status(500).json({ error: 'Error al obtener aportes' });
  }
});

router.get('/actividad/:actividadId', async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { usuarioId } = req.query;
    
    console.log(`🔍 GET /api/aportes/actividad/${actividadId} - usuarioId:`, usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const aportes = await Aporte.find({ 
      actividadId: actividadId,
      usuarioId: usuarioId.toString()
    }).sort({ fecha: -1 });
    
    console.log(`✅ ${aportes.length} aportes encontrados`);
    res.json(aportes);
  } catch (error) {
    console.error('❌ Error obteniendo aportes:', error);
    res.status(500).json({ error: 'Error al obtener aportes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { usuarioId, contratoId, actividadId } = req.body;
    
    console.log('🔍 POST /api/aportes - body:', req.body);
    
    if (!usuarioId || !contratoId || !actividadId) {
      return res.status(400).json({ error: 'usuarioId, contratoId y actividadId son requeridos' });
    }

    const nuevoAporte = new Aporte({
      ...req.body,
      id: req.body.id || `AP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      usuarioId,
      contratoId, 
      creadoEn: new Date()
    });

    await nuevoAporte.save();
    console.log('✅ Aporte creado:', nuevoAporte.id, 'para contrato:', contratoId);
    
    res.status(201).json(nuevoAporte);
  } catch (error) {
    console.error('❌ Error creando aporte:', error);
    res.status(500).json({ error: 'Error al crear aporte' });
  }
});

export default router;