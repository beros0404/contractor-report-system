import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Evidencia } from '../api/evidencias/model'; 

dotenv.config();

const evidenciasIniciales = [
  {
    id: 'EV-001',
    actividadId: 'ACT-001',
    nombre: 'Evidencia reunión 1',
    url: '/uploads/evidencia1.pdf',
    fecha: new Date(),
    tipo: 'documento'
  },
  {
    id: 'EV-002',
    actividadId: 'ACT-001',
    nombre: 'Evidencia reunión 2',
    url: '/uploads/evidencia2.pdf',
    fecha: new Date(),
    tipo: 'documento'
  },
];

async function seedEvidencias() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado a MongoDB');

    await Evidencia.deleteMany({});
    console.log('🗑️  Colección de evidencias limpiada');

    await Evidencia.insertMany(evidenciasIniciales);
    console.log(`✅ ${evidenciasIniciales.length} evidencias insertadas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedEvidencias();