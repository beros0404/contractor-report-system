import { generarResumenActividad } from './services/openai.service';
import dotenv from 'dotenv';

dotenv.config();

async function testOpenAI() {
  console.log('🔍 Probando conexión con OpenAI/Azure...');
  console.log('📡 Usando:', process.env.AZURE_OPENAI_ENDPOINT ? 'Azure OpenAI' : 'OpenAI estándar');
  
  const aportesEjemplo = [
    {
      fecha: new Date().toISOString(),
      descripcion: "Reunión con equipo de desarrollo para definir alcance del proyecto"
    },
    {
      fecha: new Date().toISOString(),
      descripcion: "Elaboración de documentación técnica y manuales de usuario"
    },
    {
      fecha: new Date().toISOString(),
      descripcion: "Pruebas de integración con sistema legacy"
    }
  ];

  const resumen = await generarResumenActividad(
    "Desarrollo e implementación de módulo de reportes",
    aportesEjemplo
  );

  console.log('✅ Resumen generado:');
  console.log(resumen);
}

testOpenAI();