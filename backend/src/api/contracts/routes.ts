import { Router } from 'express';
import { Contract } from './model';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    console.log('🔍 GET /api/contracts - usuarioId recibido:', usuarioId);
    
    if (!usuarioId) {
      console.log('❌ usuarioId no proporcionado');
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }
    
    const contratos = await Contract.find({ usuarioId }).sort({ creadoEn: -1 });
    console.log(`✅ Contratos encontrados: ${contratos.length}`);
    console.log('📦 IDs de contratos:', contratos.map(c => ({ id: c._id, numero: c.numero })));
    
    res.json(contratos);
  } catch (error) {
    console.error('❌ Error obteniendo contratos:', error);
    res.status(500).json({ error: 'Error al obtener contratos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 GET /api/contracts/:id - id:', req.params.id);
    
    const contrato = await Contract.findById(req.params.id);
    if (!contrato) {
      console.log('❌ Contrato no encontrado');
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log('✅ Contrato encontrado:', contrato.numero);
    res.json(contrato);
  } catch (error) {
    console.error('❌ Error obteniendo contrato:', error);
    res.status(500).json({ error: 'Error al obtener contrato' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { usuarioId } = req.body;
    
    console.log('🔍 POST /api/contracts - usuarioId recibido:', usuarioId);
    
    if (!usuarioId) {
      console.log('❌ usuarioId no proporcionado');
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }
    
    const nuevoContrato = new Contract({
      ...req.body,
      creadoEn: new Date(),
      actualizadoEn: new Date()
    });
    
    await nuevoContrato.save();
    console.log('✅ Contrato creado:', nuevoContrato._id);
    
    res.status(201).json(nuevoContrato);
  } catch (error) {
    console.error('❌ Error creando contrato:', error);
    res.status(500).json({ error: 'Error al crear contrato' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('🔍 PUT /api/contracts/:id - id:', req.params.id);
    
    const contrato = await Contract.findByIdAndUpdate(
      req.params.id,
      { ...req.body, actualizadoEn: new Date() },
      { new: true }
    );
    
    if (!contrato) {
      console.log('❌ Contrato no encontrado');
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log('✅ Contrato actualizado:', contrato.numero);
    res.json(contrato);
  } catch (error) {
    console.error('❌ Error actualizando contrato:', error);
    res.status(500).json({ error: 'Error al actualizar contrato' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    console.log('🔍 DELETE /api/contracts/:id - id:', req.params.id);
    
    const contrato = await Contract.findByIdAndDelete(req.params.id);
    
    if (!contrato) {
      console.log('❌ Contrato no encontrado');
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    console.log('✅ Contrato eliminado:', contrato.numero);
    res.json({ message: 'Contrato eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando contrato:', error);
    res.status(500).json({ error: 'Error al eliminar contrato' });
  }
});

export default router;