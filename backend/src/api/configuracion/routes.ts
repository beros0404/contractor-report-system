import { Router } from 'express';
import { Configuracion } from './model';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    console.log('🔍 GET /api/configuracion - usuarioId:', usuarioId, 'contratoId:', contratoId);
    
    if (!usuarioId || !contratoId) {
      console.log('❌ Faltan parámetros requeridos');
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }

    let configuracion = await Configuracion.findOne({ 
      usuarioId: usuarioId.toString(), 
      contratoId: contratoId.toString() 
    });

    if (!configuracion) {
      console.log('⚙️ No se encontró configuración, creando una por defecto');
      
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1);

      const nuevaConfig = new Configuracion({
        usuarioId: usuarioId.toString(),
        contratoId: contratoId.toString(),
        reportes: {
          frecuencia: 'mensual',
          diaGeneracion: 30,
          periodoActualInicio: fechaInicio.toISOString().split('T')[0],
          periodoActualFin: fechaFin.toISOString().split('T')[0],
          plantillaSeleccionada: 'clasica'
        },
        notificaciones: {
          email: true,
          diasAnticipacion: 3
        },
        usuario: {
          nombre: '',
          email: '',
          notificaciones: true
        }
      });

      await nuevaConfig.save();
      configuracion = nuevaConfig;
      console.log('✅ Configuración por defecto creada con ID:', nuevaConfig._id);
    } else {
      console.log('✅ Configuración existente encontrada');
    }

    res.json(configuracion);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error detallado en getConfiguracion:', err);
    res.status(500).json({ 
      error: 'Error al obtener configuración', 
      details: err.message 
    });
  }
});

router.put('/:contratoId', async (req, res) => {
  try {
    const { contratoId } = req.params;
    const { usuarioId } = req.query;
    
    console.log('🔍 PUT /api/configuracion/:contratoId - contratoId:', contratoId, 'usuarioId:', usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const configuracion = await Configuracion.findOneAndUpdate(
      { contratoId: contratoId.toString(), usuarioId: usuarioId.toString() },
      { ...req.body },
      { new: true, upsert: true }
    );

    console.log('✅ Configuración actualizada');
    res.json(configuracion);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error actualizando configuración:', err);
    res.status(500).json({ 
      error: 'Error al actualizar configuración',
      details: err.message 
    });
  }
});

router.post('/:contratoId/reset', async (req, res) => {
  try {
    const { contratoId } = req.params;
    const { usuarioId } = req.query;
    
    console.log('🔍 POST /api/configuracion/:contratoId/reset - contratoId:', contratoId, 'usuarioId:', usuarioId);
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    const configuracionDefault = {
      usuarioId: usuarioId.toString(),
      contratoId: contratoId.toString(),
      reportes: {
        frecuencia: 'mensual',
        diaGeneracion: 30,
        periodoActualInicio: fechaInicio.toISOString().split('T')[0],
        periodoActualFin: fechaFin.toISOString().split('T')[0],
        plantillaSeleccionada: 'clasica'
      },
      notificaciones: {
        email: true,
        diasAnticipacion: 3
      },
      usuario: {
        nombre: '',
        email: '',
        notificaciones: true
      }
    };

    const configuracion = await Configuracion.findOneAndUpdate(
      { contratoId: contratoId.toString(), usuarioId: usuarioId.toString() },
      configuracionDefault,
      { new: true, upsert: true }
    );

    console.log('✅ Configuración reseteada');
    res.json(configuracion);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error reseteando configuración:', err);
    res.status(500).json({ 
      error: 'Error al resetear configuración',
      details: err.message 
    });
  }
});

export default router;