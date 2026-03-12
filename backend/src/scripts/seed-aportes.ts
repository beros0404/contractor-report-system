import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Aporte } from '../api/aportes/model';

dotenv.config();

const aportesIniciales = [
  {
    id: 'AP-001',
    actividadId: 'ACT-001',
    monto: 9,
    fecha: new Date(),
    estado: 'completado',
    descripcion: 'Aportes para reuniones institucionales'
  },
  {
    id: 'AP-002',
    actividadId: 'ACT-002',
    monto: 7,
    fecha: new Date(),
    estado: 'completado',
    descripcion: 'Aportes para informes técnicos'
  },
  {
    id: 'AP-003',
    actividadId: 'ACT-003',
    monto: 3,
    fecha: new Date(),
    estado: 'completado',
    descripcion: 'Aportes para seguimiento de indicadores'
  },
  {
    id: 'AP-004',
    actividadId: 'ACT-004',
    monto: 1,
    fecha: new Date(),
    estado: 'completado',
    descripcion: 'Aportes para licitaciones'
  },
  {
    id: 'AP-005',
    actividadId: 'ACT-005',
    monto: 6,
    fecha: new Date(),
    estado: 'completado',
    descripcion: 'Aportes para documentación'
  }
];

async function seedAportes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado a MongoDB');

    await Aporte.deleteMany({});
    console.log('🗑️  Colección de aportes limpiada');

    await Aporte.insertMany(aportesIniciales);
    console.log(`✅ ${aportesIniciales.length} aportes insertados`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAportes();