"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_1 = require("./model");
const openai_service_1 = require("../../services/openai.service");
const router = (0, express_1.Router)();
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId } = req.query;
        const informe = await model_1.Informe.findOne({
            id: id,
            usuarioId: usuarioId?.toString()
        });
        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }
        res.json(informe);
    }
    catch (error) {
        console.error('Error obteniendo informe:', error);
        res.status(500).json({ error: 'Error al obtener informe' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId } = req.query;
        console.log(`🔍 PUT /api/informes/${id} - usuarioId:`, usuarioId);
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId es requerido' });
        }
        const informe = await model_1.Informe.findOneAndUpdate({ id: id, usuarioId: usuarioId.toString() }, { ...req.body, actualizadoEn: new Date() }, { new: true });
        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }
        console.log('✅ Informe actualizado:', informe.id);
        res.json(informe);
    }
    catch (error) {
        console.error('❌ Error actualizando informe:', error);
        res.status(500).json({ error: 'Error al actualizar informe' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId } = req.query;
        console.log(`🔍 DELETE /api/informes/${id} - usuarioId:`, usuarioId);
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId es requerido' });
        }
        const informe = await model_1.Informe.findOneAndDelete({
            id: id,
            usuarioId: usuarioId.toString()
        });
        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }
        console.log('✅ Informe eliminado:', id);
        res.json({ message: 'Informe eliminado correctamente' });
    }
    catch (error) {
        console.error('❌ Error eliminando informe:', error);
        res.status(500).json({ error: 'Error al eliminar informe' });
    }
});
router.get('/', async (req, res) => {
    try {
        const { usuarioId, contratoId } = req.query;
        if (!usuarioId || !contratoId) {
            return res.status(400).json({ error: 'usuarioId y contratoId son requeridos' });
        }
        const informes = await model_1.Informe.find({
            usuarioId: usuarioId.toString(),
            contratoId: contratoId.toString()
        }).sort({ 'periodo.año': -1, 'periodo.mes': -1 });
        res.json(informes);
    }
    catch (error) {
        console.error('Error obteniendo informes:', error);
        res.status(500).json({ error: 'Error al obtener informes' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { usuarioId, contratoId, tipo, año, mes, contrato, actividades } = req.body;
        if (!usuarioId || !contratoId || !tipo || !año || !mes || !contrato) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        console.log('🤖 Generando resúmenes con IA...');
        // Generar resúmenes con OpenAI
        const actividadesConResumen = await (0, openai_service_1.generarResumenMultiple)(actividades);
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0);
        const fechaLimite = new Date(fechaFin);
        fechaLimite.setDate(fechaFin.getDate() + 5);
        const nuevoInforme = new model_1.Informe({
            id: `INF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            contratoId,
            usuarioId,
            tipo,
            periodo: {
                mes,
                año,
                fechaInicio,
                fechaFin,
                fechaLimite
            },
            estado: 'borrador',
            contenido: {
                contrato,
                actividades: actividadesConResumen,
                firmas: {
                    contratista: {
                        nombre: contrato.contratistaNombre,
                        cedula: contrato.contratistaCedula,
                        fecha: null
                    },
                    supervisor: {
                        nombre: contrato.supervisorNombre,
                        cargo: contrato.supervisorCargo,
                        fecha: null
                    }
                }
            },
            fechas: {
                generacion: new Date()
            }
        });
        await nuevoInforme.save();
        console.log('✅ Informe creado con resúmenes IA');
        res.status(201).json(nuevoInforme);
    }
    catch (error) {
        console.error('❌ Error creando informe:', error);
        res.status(500).json({ error: 'Error al crear informe' });
    }
});
router.put('/:id/finalizar', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId } = req.query;
        const informe = await model_1.Informe.findOneAndUpdate({ id: id, usuarioId: usuarioId?.toString() }, {
            estado: 'finalizado',
            'fechas.finalizacion': new Date()
        }, { new: true });
        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }
        res.json(informe);
    }
    catch (error) {
        console.error('Error finalizando informe:', error);
        res.status(500).json({ error: 'Error al finalizar informe' });
    }
});
router.put('/:id/enviar', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId } = req.query;
        const informe = await model_1.Informe.findOneAndUpdate({ id: id, usuarioId: usuarioId?.toString() }, {
            estado: 'enviado',
            'fechas.envio': new Date()
        }, { new: true });
        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }
        res.json(informe);
    }
    catch (error) {
        console.error('Error enviando informe:', error);
        res.status(500).json({ error: 'Error al enviar informe' });
    }
});
exports.default = router;
