import { supabase } from "./src/config/db.js";

async function testSupabase() {
  console.log("🔍 Probando conexión a Supabase...\n");

  // Probar entradas
  console.log("📥 Consultando tabla 'entradas':");
  const { data: entradas, error: errorEntradas, count } = await supabase
    .from("entradas")
    .select("*", { count: "exact" })
    .limit(5);

  if (errorEntradas) {
    console.error("❌ Error en entradas:", errorEntradas.message);
    console.error("Detalles:", errorEntradas);
  } else {
    console.log(`✅ Entradas encontradas: ${entradas?.length || 0} (Total: ${count})`);
    if (entradas && entradas.length > 0) {
      console.log("Primer registro:", entradas[0]);
    }
  }

  // Probar sin filtros ni orden
  console.log("\n📥 Consultando entradas sin orden:");
  const { data: entradasSimple, error: errorSimple } = await supabase
    .from("entradas")
    .select("*")
    .limit(2);

  if (errorSimple) {
    console.error("❌ Error:", errorSimple.message);
  } else {
    console.log(`✅ Encontradas: ${entradasSimple?.length || 0}`);
    if (entradasSimple && entradasSimple.length > 0) {
      console.log("Registro:", entradasSimple[0]);
    }
  }

  console.log("\n📦 Consultando tabla 'repuestos':");
  const { data: repuestos, error: errorRepuestos } = await supabase
    .from("repuestos")
    .select("*")
    .limit(5);

  if (errorRepuestos) {
    console.error("❌ Error en repuestos:", errorRepuestos.message);
  } else {
    console.log(`✅ Repuestos encontrados: ${repuestos?.length || 0}`);
    if (repuestos && repuestos.length > 0) {
      console.log("Primer registro:", repuestos[0]);
    }
  }

  console.log("\n📤 Consultando tabla 'salidas':");
  const { data: salidas, error: errorSalidas } = await supabase
    .from("salidas")
    .select("*")
    .limit(5);

  if (errorSalidas) {
    console.error("❌ Error en salidas:", errorSalidas.message);
  } else {
    console.log(`✅ Salidas encontradas: ${salidas?.length || 0}`);
    if (salidas && salidas.length > 0) {
      console.log("Primer registro:", salidas[0]);
    }
  }

  console.log("\n👥 Consultando tabla 'usuarios':");
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from("usuarios")
    .select("*")
    .limit(5);

  if (errorUsuarios) {
    console.error("❌ Error en usuarios:", errorUsuarios.message);
  } else {
    console.log(`✅ Usuarios encontrados: ${usuarios?.length || 0}`);
  }

  console.log("\n✨ Prueba completada");
}

testSupabase();
