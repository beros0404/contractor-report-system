import mongoose from 'mongoose';

const aporteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  contratoId: { type: String, required: true, index: true },
  usuarioId: { type: String, required: true, index: true },
  actividadId: { type: String, required: true, index: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['pendiente', 'completado', 'rechazado', 'borrador'],
    default: 'completado'
  },
  descripcion: String,
  evidenciaIds: [String],
  creadoEn: { type: Date, default: Date.now }
});

aporteSchema.index({ usuarioId: 1, contratoId: 1 });
aporteSchema.index({ actividadId: 1, usuarioId: 1 });

export const Aporte = mongoose.model('Aporte', aporteSchema);