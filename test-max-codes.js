// Script de prueba para el endpoint /api/repuestos/max-codes
// Uso: node test-max-codes.js

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testMaxCodes() {
  console.log('🧪 Probando endpoint /api/repuestos/max-codes...\n');
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/repuestos/max-codes`);
    const endTime = Date.now();
    
    const data = await response.json();
    
    console.log('✅ Respuesta recibida en', endTime - startTime, 'ms\n');
    console.log('📊 Datos:', JSON.stringify(data, null, 2));
    
    if (data.ok && data.data) {
      console.log('\n✅ Endpoint funcionando correctamente');
      console.log('   Max CI:', data.data.maxCI);
      console.log('   Max CB:', data.data.maxCB);
    } else {
      console.log('\n❌ Respuesta inesperada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo');
    console.log('   Ejemplo: node server.js');
  }
}

testMaxCodes();
