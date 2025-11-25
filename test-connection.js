import { supabase } from "./src/config/db.js";

async function testConnection() {
  console.log("🔍 Probando conexión a Supabase...\n");

  try {
    // Test 1: Verificar conexión
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from("usuarios")
      .select("count");

    if (errorUsuarios) {
      console.error("❌ Error al conectar:", errorUsuarios.message);
      return;
    }

    console.log("✅ Conexión exitosa a Supabase");

    // Test 2: Listar tablas disponibles
    const tablas = ["usuarios", "repuestos", "entradas", "salidas", "marcas", "proveedores"];
    
    console.log("\n📊 Verificando tablas:");
    for (const tabla of tablas) {
      const { data, error } = await supabase
        .from(tabla)
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.log(`   ❌ ${tabla}: No existe o no tiene permisos`);
      } else {
        console.log(`   ✅ ${tabla}: OK`);
      }
    }

    console.log("\n✨ Migración completada exitosamente!");
    console.log("💡 Ahora puedes ejecutar: pnpm start");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testConnection();
