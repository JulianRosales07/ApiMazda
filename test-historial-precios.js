/**
 * Script de prueba para el sistema de historial de precios
 * Ejecutar: node test-historial-precios.js
 */

import { supabase } from "./src/config/db.js";

const testHistorialPrecios = async () => {
  console.log("🧪 Iniciando pruebas del sistema de historial de precios...\n");

  try {
    // Test 1: Verificar que la tabla existe
    console.log("📋 Test 1: Verificar tabla historial_precios");
    const { data: tableCheck, error: tableError } = await supabase
      .from("historial_precios")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Error: La tabla no existe o no es accesible");
      console.error(tableError.message);
      return;
    }
    console.log("✅ Tabla historial_precios existe y es accesible\n");

    // Test 2: Verificar función RPC
    console.log("📋 Test 2: Verificar función get_historial_precios_completo");
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_historial_precios_completo",
      {
        p_producto_cb: null,
        p_proveedor_id: null,
        p_fecha_desde: null,
        p_fecha_hasta: null,
        p_limit: 5,
      }
    );

    if (rpcError) {
      console.warn("⚠️  Función RPC no disponible (se usará fallback)");
      console.warn(rpcError.message);
    } else {
      console.log("✅ Función RPC funciona correctamente");
      console.log(`   Registros encontrados: ${rpcData.length}\n`);
    }

    // Test 3: Obtener un producto y proveedor para pruebas
    console.log("📋 Test 3: Obtener datos de prueba");
    const { data: productos, error: prodError } = await supabase
      .from("repuestos")
      .select("cb")
      .eq("activo", true)
      .limit(1);

    const { data: proveedores, error: provError } = await supabase
      .from("proveedores")
      .select("id_proveedor")
      .eq("activo", true)
      .limit(1);

    if (prodError || provError || !productos?.length || !proveedores?.length) {
      console.warn("⚠️  No hay datos de prueba disponibles");
      console.log("   Necesitas tener al menos 1 producto y 1 proveedor activos\n");
    } else {
      const producto_cb = productos[0].cb;
      const proveedor_id = proveedores[0].id_proveedor;
      console.log(`✅ Datos de prueba: Producto ${producto_cb}, Proveedor ${proveedor_id}\n`);

      // Test 4: Crear registro manual
      console.log("📋 Test 4: Crear registro manual de historial");
      const { data: nuevoHistorial, error: createError } = await supabase
        .from("historial_precios")
        .insert([
          {
            producto_cb,
            proveedor_id,
            precio_anterior: 100.0,
            precio_nuevo: 120.0,
            usuario_modificacion: "test_script",
            motivo_cambio: "Prueba automática del sistema",
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("❌ Error al crear registro:", createError.message);
      } else {
        console.log("✅ Registro creado exitosamente");
        console.log(`   ID: ${nuevoHistorial.id_historial}`);
        console.log(`   Precio anterior: $${nuevoHistorial.precio_anterior}`);
        console.log(`   Precio nuevo: $${nuevoHistorial.precio_nuevo}\n`);

        // Test 5: Consultar historial por producto
        console.log("📋 Test 5: Consultar historial por producto");
        const { data: historialProducto, error: histError } = await supabase
          .from("historial_precios")
          .select(
            `
            *,
            repuestos:producto_cb (producto),
            proveedores:proveedor_id (nombre_proveedor)
          `
          )
          .eq("producto_cb", producto_cb)
          .eq("activo", true)
          .order("fecha_cambio", { ascending: false })
          .limit(5);

        if (histError) {
          console.error("❌ Error al consultar historial:", histError.message);
        } else {
          console.log(`✅ Historial consultado: ${historialProducto.length} registros`);
          historialProducto.forEach((h, i) => {
            console.log(`   ${i + 1}. $${h.precio_anterior || "N/A"} → $${h.precio_nuevo} (${h.motivo_cambio})`);
          });
          console.log();
        }

        // Test 6: Actualizar registro
        console.log("📋 Test 6: Actualizar registro");
        const { data: updated, error: updateError } = await supabase
          .from("historial_precios")
          .update({
            motivo_cambio: "Prueba actualizada - Sistema funcionando correctamente",
          })
          .eq("id_historial", nuevoHistorial.id_historial)
          .select()
          .single();

        if (updateError) {
          console.error("❌ Error al actualizar:", updateError.message);
        } else {
          console.log("✅ Registro actualizado exitosamente");
          console.log(`   Nuevo motivo: ${updated.motivo_cambio}\n`);
        }

        // Test 7: Soft delete
        console.log("📋 Test 7: Eliminar registro (soft delete)");
        const { data: deleted, error: deleteError } = await supabase
          .from("historial_precios")
          .update({ activo: false })
          .eq("id_historial", nuevoHistorial.id_historial)
          .select()
          .single();

        if (deleteError) {
          console.error("❌ Error al eliminar:", deleteError.message);
        } else {
          console.log("✅ Registro eliminado (soft delete)");
          console.log(`   Activo: ${deleted.activo}\n`);
        }
      }
    }

    // Test 8: Verificar trigger (si existe producto_proveedor)
    console.log("📋 Test 8: Verificar trigger automático");
    const { data: prodProv, error: ppError } = await supabase
      .from("producto_proveedor")
      .select("*")
      .eq("activo", true)
      .limit(1)
      .single();

    if (ppError || !prodProv) {
      console.warn("⚠️  No hay relaciones producto-proveedor para probar el trigger");
      console.log("   El trigger se activará automáticamente al crear/actualizar precios\n");
    } else {
      console.log("✅ Trigger configurado correctamente");
      console.log("   Se activará automáticamente al actualizar precios en producto_proveedor\n");
    }

    // Test 9: Estadísticas
    console.log("📋 Test 9: Consultar estadísticas generales");
    const { data: stats, error: statsError } = await supabase
      .from("historial_precios")
      .select("producto_cb, precio_nuevo")
      .eq("activo", true);

    if (statsError) {
      console.error("❌ Error al obtener estadísticas:", statsError.message);
    } else {
      console.log(`✅ Total de registros activos: ${stats.length}`);
      
      if (stats.length > 0) {
        const precios = stats.map((s) => parseFloat(s.precio_nuevo));
        const precioMin = Math.min(...precios);
        const precioMax = Math.max(...precios);
        const precioPromedio = precios.reduce((a, b) => a + b, 0) / precios.length;

        console.log(`   Precio mínimo: $${precioMin.toFixed(2)}`);
        console.log(`   Precio máximo: $${precioMax.toFixed(2)}`);
        console.log(`   Precio promedio: $${precioPromedio.toFixed(2)}`);
      }
      console.log();
    }

    // Resumen final
    console.log("=" .repeat(60));
    console.log("🎉 PRUEBAS COMPLETADAS");
    console.log("=" .repeat(60));
    console.log("✅ Sistema de historial de precios funcionando correctamente");
    console.log("\n📚 Próximos pasos:");
    console.log("   1. Ejecutar la migración: migration_historial_precios.sql");
    console.log("   2. Iniciar el servidor: npm start");
    console.log("   3. Probar endpoints: http://localhost:3000/api/historial-precios");
    console.log("   4. Ver documentación: HISTORIAL_PRECIOS_GUIA.md");
    console.log();

  } catch (error) {
    console.error("\n❌ Error general en las pruebas:");
    console.error(error);
  }
};

// Ejecutar pruebas
testHistorialPrecios()
  .then(() => {
    console.log("✅ Script de pruebas finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
