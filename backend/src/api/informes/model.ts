import mongoose from 'mongoose';

const informeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  contratoId: { type: String, required: true, index: true },
  usuarioId: { type: String, required: true, index: true },
  tipo: { 
    type: String, 
    enum: ['mensual', 'parcial-80', 'parcial-90'],
    required: true 
  },
  periodo: {
    mes: { type: Number, required: true }, // 1-12
    año: { type: Number, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    fechaLimite: { type: Date, required: true } 
  },
  estado: { 
    type: String, 
    enum: ['borrador', 'finalizado', 'enviado'],
    default: 'borrador'
  },
  contenido: {
    contrato: {
      numero: String,
      entidad: String,
      objeto: String,
      fechaInicio: Date,
      fechaFin: Date,
      valor: Number,
      contratistaNombre: String,
      contratistaCedula: String,
      contratistaProfesion: String,
      supervisorNombre: String,
      supervisorCargo: String,
      lugarFirma: { type: String, default: 'Rionegro' } // ✅ Agregar lugarFirma
    },
    actividades: [{
      actividadId: String,
      titulo: String,
      descripcion: String,
      resumenAportes: String, 
      aportes: [{
        fecha: Date,
        descripcion: String,
        evidenciaIds: [String]
      }],
      evidencias: [{
        id: String,
        nombre: String,
        tipo: String,
        url: String,
        archivo: {
          nombre: String,
          tamaño: Number,
          url: String,
          driveFileId: String
        }
      }]
    }],
    firmas: {
      contratista: {
        nombre: String,
        cedula: String,
        fecha: Date,
        firmaDigital: String,
        firmaGuardadaId: String
      },
      supervisor: {
        nombre: String,
        cargo: String,
        fecha: Date,
        firmaDigital: String,
        firmaGuardadaId: String
      }
    }
  },
  fechas: {
    generacion: { type: Date, default: Date.now },
    finalizacion: Date,
    envio: Date
  },
  metadata: {
    version: { type: Number, default: 1 },
    observaciones: String
  }
}, {
  timestamps: { 
    createdAt: 'creadoEn', 
    updatedAt: 'actualizadoEn' 
  }
});

informeSchema.index({ contratoId: 1, 'periodo.año': -1, 'periodo.mes': -1 });
informeSchema.index({ usuarioId: 1, estado: 1 });

export const Informe = mongoose.model('Informe', informeSchema);