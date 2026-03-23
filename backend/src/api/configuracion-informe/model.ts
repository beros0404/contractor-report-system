import mongoose from 'mongoose';

const ConfiguracionInformeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  usuarioId: { type: String, required: true },
  contratoId: { type: String, required: true },
  columnas: { type: Number, default: 2, enum: [1, 2] },
  campos: [{
    id: String,
    label: String,
    value: String,
    tipo: String,
    visible: Boolean,
    orden: Number,
    zona: String
  }],
  actividades: [{
    id: String,
    actividad: String,
    resumen: String,
    evidencias: String
  }],
  bloquesTexto: [{
    id: String,
    titulo: String,
    descripcion: String,
    zona: String
  }],
  firmas: [{
    titulo: String,
    campoRef: String,
    cargo: String
  }],
  lugarFecha: String,
  dependenciaContratante: String,
  seguridadSocial: {
    numeroPlantilla: String,
    administrador: String,
    otroAdministrador: String
  }
}, { timestamps: true });

export const ConfiguracionInforme = mongoose.models.ConfiguracionInforme || 
  mongoose.model('ConfiguracionInforme', ConfiguracionInformeSchema);