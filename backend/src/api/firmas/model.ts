import mongoose from 'mongoose';

const firmaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  usuarioId: { type: String, required: true, index: true },
  nombre: { type: String, required: true },
  imagen: { type: String, required: true }, // base64 de la firma
  tipo: { type: String, enum: ['contratista', 'supervisor', 'ambos'], default: 'ambos' },
  vecesUsada: { type: Number, default: 0 },
  ultimoUso: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Firma = mongoose.model('Firma', firmaSchema);
