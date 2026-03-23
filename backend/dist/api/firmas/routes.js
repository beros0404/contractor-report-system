"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_1 = require("./model");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { usuarioId, tipo } = req.query;
        if (!usuarioId) {
            return res.status(400).json({ error: 'usuarioId requerido' });
        }
        const query = { usuarioId };
        if (tipo) {
            query.$or = [{ tipo: 'ambos' }, { tipo }];
        }
        const firmas = await model_1.Firma.find(query).sort({ ultimoUso: -1 });
        res.json(firmas);
    }
    catch (error) {
        console.error('Error obteniendo firmas:', error);
        res.status(500).json({ error: 'Error al obtener firmas' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { usuarioId, nombre, imagen, tipo } = req.body;
        if (!usuarioId || !nombre || !imagen) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        const nuevaFirma = new model_1.Firma({
            id: `FIR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            usuarioId,
            nombre,
            imagen,
            tipo: tipo || 'ambos'
        });
        await nuevaFirma.save();
        res.status(201).json(nuevaFirma);
    }
    catch (error) {
        console.error('Error guardando firma:', error);
        res.status(500).json({ error: 'Error al guardar firma' });
    }
});
router.put('/:id/usar', async (req, res) => {
    try {
        const { id } = req.params;
        const firma = await model_1.Firma.findOneAndUpdate({ id }, {
            $inc: { vecesUsada: 1 },
            ultimoUso: new Date()
        }, { new: true });
        res.json(firma);
    }
    catch (error) {
        console.error('Error actualizando uso de firma:', error);
        res.status(500).json({ error: 'Error al actualizar firma' });
    }
});
exports.default = router;
