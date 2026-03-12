import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  contratoId: { type: String, required: true, unique: true },
  reportes: {
    frecuencia: { 
      type: String, 
      enum: ['semanal', 'quincenal', 'mensual'],
      default: 'mensual'
    },
    diaGeneracion: { type: Number, default: 30 },
    periodoActualInicio: { type: String, default: '' },
    periodoActualFin: { type: String, default: '' },
    plantillaSeleccionada: { 
      type: String, 
      enum: ['clasica', 'moderna', 'compacta'],
      default: 'clasica'
    }
  },
  notificaciones: {
    email: { type: Boolean, default: true },
    diasAnticipacion: { type: Number, default: 3 }
  },
  usuario: {
    nombre: { type: String, default: '' },
    email: { type: String, default: '' },
    notificaciones: { type: Boolean, default: true }
  }
}, {
  timestamps: { 
    createdAt: 'creadoEn', 
    updatedAt: 'actualizadoEn' 
  }
});

// Solo mantener índices necesarios
configuracionSchema.index({ usuarioId: 1, contratoId: 1 });

export const Configuracion = mongoose.model('Configuracion', configuracionSchema);