// backend/src/api/configuracion-informe/routes.ts
import { Router } from 'express';
import { ConfiguracionInforme } from './model';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET - Obtener configuración por usuario y contrato
router.get('/', async (req, res) => {
  try {
    const { usuarioId, contratoId } = req.query;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }
    
    const config = await ConfiguracionInforme.findOne({ 
      usuarioId: usuarioId.toString(), 
      contratoId: contratoId.toString() 
    });
    
    res.json(config || null);
    
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// GET - Obtener configuración por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    const config = await ConfiguracionInforme.findOne({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json(config);
    
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// POST - Crear nueva configuración
router.post('/', async (req, res) => {
  try {
    const { 
      usuarioId, 
      contratoId, 
      columnas, 
      campos, 
      actividades, 
      bloquesTexto, 
      firmas, 
      lugarFecha, 
      dependenciaContratante, 
      seguridadSocial 
    } = req.body;
    
    if (!usuarioId || !contratoId) {
      return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
    }
    
    // Verificar si ya existe una configuración para este contrato
    const existingConfig = await ConfiguracionInforme.findOne({ 
      usuarioId: usuarioId.toString(), 
      contratoId: contratoId.toString() 
    });
    
    if (existingConfig) {
      return res.status(409).json({ error: 'Ya existe una configuración para este contrato' });
    }
    
    const nuevaConfig = new ConfiguracionInforme({
      id: `cfg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      usuarioId: usuarioId.toString(),
      contratoId: contratoId.toString(),
      columnas: columnas || 2,
      campos: campos || [],
      actividades: actividades || [],
      bloquesTexto: bloquesTexto || [],
      firmas: firmas || [],
      lugarFecha: lugarFecha || '',
      dependenciaContratante: dependenciaContratante || '',
      seguridadSocial: seguridadSocial || { numeroPlantilla: '', administrador: '', otroAdministrador: '' }
    });
    
    await nuevaConfig.save();
    
    res.status(201).json(nuevaConfig);
    
  } catch (error) {
    console.error('❌ Error creando configuración:', error);
    res.status(500).json({ error: 'Error al crear configuración' });
  }
});

// PUT - Actualizar configuración
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      usuarioId, 
      contratoId, 
      columnas, 
      campos, 
      actividades, 
      bloquesTexto, 
      firmas, 
      lugarFecha, 
      dependenciaContratante, 
      seguridadSocial 
    } = req.body;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    // Buscar la configuración
    const config = await ConfiguracionInforme.findOne({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    // Actualizar campos
    if (columnas !== undefined) config.columnas = columnas;
    if (campos) config.campos = campos;
    if (actividades) config.actividades = actividades;
    if (bloquesTexto) config.bloquesTexto = bloquesTexto;
    if (firmas) config.firmas = firmas;
    if (lugarFecha !== undefined) config.lugarFecha = lugarFecha;
    if (dependenciaContratante !== undefined) config.dependenciaContratante = dependenciaContratante;
    if (seguridadSocial) config.seguridadSocial = seguridadSocial;
    if (contratoId) config.contratoId = contratoId;
    
    await config.save();
    
    res.json(config);
    
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// DELETE - Eliminar configuración
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId requerido' });
    }
    
    const config = await ConfiguracionInforme.findOneAndDelete({ 
      id: id, 
      usuarioId: usuarioId.toString() 
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Error eliminando configuración:', error);
    res.status(500).json({ error: 'Error al eliminar configuración' });
  }
});

export default router;