import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Activity } from '../api/activities/model';

dotenv.config();

const actividadesIniciales = [
  {
    id: 'ACT-001',
    titulo: '01. Coordinación de reuniones con grupos de interés institucional',
    descripcion: 'Extraída automáticamente del PDF',
    tipo: 'automatica',
    metadata: {
      fuente: 'Extraída automáticamente del PDF',
      prioridad: 'media'
    },
    estado: 'activa'
  },
  {
    id: 'ACT-002',
    titulo: '02. Elaboración y presentación de informes técnicos mensuales de avance',
    descripcion: 'Extraída automáticamente del PDF',
    tipo: 'automatica',
    metadata: {
      fuente: 'Extraída automáticamente del PDF',
      prioridad: 'alta'
    },
    estado: 'activa'
  },
  {
    id: 'ACT-003',
    titulo: '03. Seguimiento de indicadores de gestión energética y eficiencia operacional',
    descripcion: 'A Baja gestión detectada',
    tipo: 'gestion_detectada',
    metadata: {
      fuente: 'A Baja gestión detectada',
      prioridad: 'baja'
    },
    estado: 'baja'
  },
  {
    id: 'ACT-004',
    titulo: '04. Apoyo en procesos de licitación pública y gestión contractual',
    descripcion: 'IA sugiere acción inmediata',
    tipo: 'ia_sugerida',
    metadata: {
      fuente: 'IA sugiere acción inmediata',
      prioridad: 'alta'
    },
    estado: 'sin_inicio'
  },
  {
    id: 'ACT-005',
    titulo: '05. Documentación de procesos de seguridad eléctrica y protocolos operativos',
    descripcion: 'Extraída automáticamente del PDF',
    tipo: 'automatica',
    metadata: {
      fuente: 'Extraída automáticamente del PDF',
      prioridad: 'media'
    },
    estado: 'activa'
  }
];

async function seedActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado a MongoDB');

    await Activity.deleteMany({});
    console.log('🗑️  Colección de actividades limpiada');

    await Activity.insertMany(actividadesIniciales);
    console.log(`✅ ${actividadesIniciales.length} actividades insertadas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedActivities();