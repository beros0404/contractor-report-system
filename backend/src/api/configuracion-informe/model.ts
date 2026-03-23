import mongoose from 'mongoose';

const configuracionInformeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  usuarioId: { type: String, required: true, index: true },
  contratoId: { type: String, required: true, index: true },
  nombre: { type: String, default: 'Configuración por defecto' },
  
  plantilla: {
    header: {
      visible: { type: Boolean, default: true },
      tituloPersonalizado: String,
      mostrarLogo: { type: Boolean, default: true }
    },
    secciones: [{
      id: String,           
      tipo: String,         
      titulo: String,       
      visible: { type: Boolean, default: true },
      orden: Number,
      columnas: { type: Number, default: 2 }, 
      campos: [{            
        id: String,
        label: String,
        visible: { type: Boolean, default: true },
        orden: Number
      }]
    }],
    footer: {
      visible: { type: Boolean, default: true },
      textoPersonalizado: String,
      mostrarFecha: { type: Boolean, default: true },
      mostrarLugar: { type: Boolean, default: true }
    }
  },
  
  estilos: {
    fuente: { type: String, default: 'Arial' },
    colorPrimario: { type: String, default: '#3498db' },
    colorSecundario: { type: String, default: '#2c3e50' },
    margenes: {
      top: { type: Number, default: 40 },
      bottom: { type: Number, default: 40 },
      left: { type: Number, default: 40 },
      right: { type: Number, default: 40 }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ConfiguracionInforme = mongoose.model('ConfiguracionInforme', configuracionInformeSchema);