import { Router } from 'express';
import { Activity } from './model';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    console.log(`🔍 GET /api/activities/${id} - usuarioId:`, usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const actividad = await Activity.findOne({ 
      id: id,  
      usuarioId: usuarioId.toString()
    });
    
    if (!actividad) {
      console.log(`❌ Actividad no encontrada con id: ${id}`);
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    
    console.log("✅ Actividad encontrada:", actividad.titulo);
    res.json(actividad);
  } catch (error) {
    console.error('❌ Error obteniendo actividad:', error);
    res.status(500).json({ error: 'Error al obtener actividad' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    console.log('='.repeat(50));
    console.log(`🔍 PUT /api/activities/${id}`);
    console.log(`📌 usuarioId recibido:`, usuarioId);
    console.log(`📦 Body recibido:`, JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const actividadExistente = await Activity.findOne({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    console.log(`🔎 Búsqueda en MongoDB:`);
    console.log(`   - id: ${id}`);
    console.log(`   - usuarioId: ${usuarioId.toString()}`);
    console.log(`   - Encontrada:`, actividadExistente ? 'SÍ' : 'NO');
    
    if (!actividadExistente) {
      console.log(`❌ Actividad NO encontrada en la base de datos`);
      return res.status(404).json({ 
        error: 'Actividad no encontrada',
        buscado: { id, usuarioId: usuarioId.toString() }
      });
    }

    console.log(`✅ Actividad encontrada:`, {
      id: actividadExistente.id,
      titulo: actividadExistente.titulo,
      estado: actividadExistente.estado
    });

    const actividad = await Activity.findOneAndUpdate(
      { id: id, usuarioId: usuarioId.toString() },
      { 
        ...req.body, 
        actualizadoEn: new Date() 
      },
      { new: true }
    );
    
    console.log(`✅ Actividad actualizada correctamente`);
    console.log('='.repeat(50));
    
    res.json(actividad);
  } catch (error) {
    console.error('❌ Error actualizando actividad:', error);
    res.status(500).json({ error: 'Error al actualizar actividad' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    console.log(`🗑️ DELETE /api/activities/${id}`);
    console.log(`📌 usuarioId:`, usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }
    
    const actividad = await Activity.findOne({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    if (!actividad) {
      console.log(`❌ Actividad no encontrada con id: ${id}`);
      return res.status(404).json({ 
        error: 'Actividad no encontrada',
        message: `No se encontró la actividad con ID: ${id}`
      });
    }
    
    const resultado = await Activity.deleteOne({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'No se pudo eliminar la actividad' });
    }
    
    console.log(`✅ Actividad eliminada: ${actividad.titulo}`);
    
    const actividadesRestantes = await Activity.find({ 
      usuarioId: usuarioId.toString(),
      contratoId: actividad.contratoId
    }).sort({ numero: 1 });
    
    for (let i = 0; i < actividadesRestantes.length; i++) {
      if (actividadesRestantes[i].numero !== i + 1) {
        await Activity.updateOne(
          { id: actividadesRestantes[i].id },
          { numero: i + 1 }
        );
      }
    }
    
    res.json({ 
      message: 'Actividad eliminada correctamente',
      deletedId: id,
      actividadEliminada: actividad
    });
    
  } catch (error) {
    console.error('❌ Error eliminando actividad:', error);
    res.status(500).json({ 
      error: 'Error al eliminar actividad',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }

    const actividades = await Activity.find({ 
      usuarioId: usuarioId.toString(), 
      contratoId: contratoId.toString() 
    }).sort({ numero: 1 });
    
    res.json(actividades);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.body;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }

    const ultimaActividad = await Activity.findOne({ contratoId })
      .sort({ numero: -1 })
      .select('numero');

    const nuevoNumero = ultimaActividad ? ultimaActividad.numero + 1 : 1;

    const nuevaActividad = new Activity({
      ...req.body,
      numero: nuevoNumero,
      creadoEn: new Date(),
      actualizadoEn: new Date()
    });

    await nuevaActividad.save();
    res.status(201).json(nuevaActividad);
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
});

export default router;