import { Router } from 'express';
import { ConfiguracionInforme } from './model';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId requeridos' });
    }

    let config = await ConfiguracionInforme.findOne({ 
      usuarioId: usuarioId.toString(),
      contratoId: contratoId.toString() 
    });

    if (!config) {
      config = new ConfiguracionInforme({
        id: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        usuarioId,
        contratoId,
        plantilla: {
          header: { visible: true, tituloPersonalizado: 'INFORME DE EJECUCIÓN' },
          secciones: [
            {
              id: `sec-${Date.now()}-1`,
              tipo: 'info-contrato',
              titulo: 'Información del Contrato',
              visible: true,
              orden: 1,
              columnas: 2,
              campos: [
                { id: 'contratista', label: 'Nombre del Contratista', visible: true, orden: 1 },
                { id: 'numero', label: 'Número de Contrato', visible: true, orden: 2 },
                { id: 'fechaInicio', label: 'Fecha de Inicio', visible: true, orden: 3 },
                { id: 'fechaFin', label: 'Fecha de Fin', visible: true, orden: 4 },
                { id: 'objeto', label: 'Objeto', visible: true, orden: 5 },
                { id: 'valor', label: 'Valor', visible: true, orden: 6 },
                { id: 'supervisor', label: 'Supervisor', visible: true, orden: 7 }
              ]
            },
            {
              id: `sec-${Date.now()}-2`,
              tipo: 'periodo',
              titulo: 'Período Ejecutado',
              visible: true,
              orden: 2
            },
            {
              id: `sec-${Date.now()}-3`,
              tipo: 'actividades',
              titulo: 'Ejecución de Actividades',
              visible: true,
              orden: 3
            },
            {
              id: `sec-${Date.now()}-4`,
              tipo: 'firmas',
              titulo: 'Firmas',
              visible: true,
              orden: 4
            }
          ],
          footer: {
            visible: true,
            mostrarFecha: true,
            mostrarLugar: true
          }
        }
      });
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await ConfiguracionInforme.findOneAndUpdate(
      { id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(config);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

export default router;