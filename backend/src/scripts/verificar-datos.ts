import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Aporte } from '../api/aportes/model';

dotenv.config();

async function verificarDatos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conectado a MongoDB');

    const usuarioId = 'e475df86-bf65-48fc-89a3-a299d009f0c7'; 
    
    const aportes = await Aporte.find({ usuarioId });
    
    console.log(`\n📊 Total aportes para usuario ${usuarioId}: ${aportes.length}`);
    
    const porContrato: Record<string, number> = {};
    aportes.forEach(ap => {
      porContrato[ap.contratoId] = (porContrato[ap.contratoId] || 0) + 1;
    });
    
    console.log('\n📦 Aportes por contrato:');
    Object.entries(porContrato).forEach(([contratoId, count]) => {
      console.log(`   - Contrato ${contratoId}: ${count} aportes`);
    });

    const sinContrato = await Aporte.find({ contratoId: { $exists: false } });
    if (sinContrato.length > 0) {
      console.log(`\n⚠️ Hay ${sinContrato.length} aportes sin contratoId`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarDatos();