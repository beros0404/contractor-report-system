import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  entidad: { type: String, required: true },
  objeto: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  valor: { type: Number, required: true },
  contratistaNombre: { type: String, required: true },
  contratistaCedula: { type: String, required: true },
  contratistaProfesion: { type: String },
  supervisorNombre: { type: String, required: true },
  supervisorCargo: { type: String },
  lugarFirma: { type: String, default: 'Rionegro' },
  usuarioId: { type: String, required: true, index: true },
  estado: { 
    type: String, 
    enum: ['activo', 'inactivo', 'finalizado'],
    default: 'activo'
  },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

contractSchema.index({ usuarioId: 1, estado: 1 });

export const Contract = mongoose.model('Contract', contractSchema);