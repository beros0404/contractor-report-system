import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  contratoId: { type: String, required: true, index: true },
  usuarioId: { type: String, required: true, index: true },
  numero: { type: Number, required: true },
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['automatica', 'gestion_detectada', 'ia_sugerida'],
    default: 'automatica'
  },
  porcentajePeso: { type: Number, default: 0 },
  estado: { 
    type: String, 
    enum: ['activa', 'baja', 'sin_inicio', 'completada'],
    default: 'activa'
  },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

activitySchema.index({ usuarioId: 1, contratoId: 1 });

export const Activity = mongoose.model('Activity', activitySchema);