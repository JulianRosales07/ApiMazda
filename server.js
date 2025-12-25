import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}\n`);
  console.log("📋 RUTAS DISPONIBLES:\n");
  console.log("═".repeat(60));
  
  // Definir manualmente las rutas disponibles
  const routes = [
    { group: "REPUESTOS", method: "GET", path: "/api/repuestos" },
    { group: "REPUESTOS", method: "GET", path: "/api/repuestos/:cb" },
    { group: "REPUESTOS", method: "POST", path: "/api/repuestos" },
    { group: "REPUESTOS", method: "PUT", path: "/api/repuestos/:cb" },
    { group: "REPUESTOS", method: "DELETE", path: "/api/repuestos/:cb" },
    
    { group: "USUARIOS", method: "GET", path: "/api/usuarios" },
    { group: "USUARIOS", method: "GET", path: "/api/usuarios/:id" },
    { group: "USUARIOS", method: "POST", path: "/api/usuarios" },
    { group: "USUARIOS", method: "PUT", path: "/api/usuarios/:id" },
    { group: "USUARIOS", method: "PUT", path: "/api/usuarios/:id/password" },
    { group: "USUARIOS", method: "DELETE", path: "/api/usuarios/:id" },
    
    { group: "SALIDAS", method: "GET", path: "/api/salidas" },
    { group: "SALIDAS", method: "GET", path: "/api/salidas/:n_factura" },
    { group: "SALIDAS", method: "POST", path: "/api/salidas" },
    { group: "SALIDAS", method: "PUT", path: "/api/salidas/:n_factura" },
    { group: "SALIDAS", method: "DELETE", path: "/api/salidas/:n_factura" },
    
    { group: "ENTRADAS", method: "GET", path: "/api/entradas" },
    { group: "ENTRADAS", method: "GET", path: "/api/entradas/:id" },
    { group: "ENTRADAS", method: "POST", path: "/api/entradas" },
    { group: "ENTRADAS", method: "PUT", path: "/api/entradas/:id" },
    { group: "ENTRADAS", method: "DELETE", path: "/api/entradas/:id" },
    
    { group: "PROVEEDORES", method: "GET", path: "/api/proveedores" },
    { group: "PROVEEDORES", method: "GET", path: "/api/proveedores/:id" },
    { group: "PROVEEDORES", method: "POST", path: "/api/proveedores" },
    { group: "PROVEEDORES", method: "PUT", path: "/api/proveedores/:id" },
    { group: "PROVEEDORES", method: "DELETE", path: "/api/proveedores/:id" },
    { group: "PROVEEDORES", method: "PATCH", path: "/api/proveedores/:id/activar" },
    
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/proveedor/:proveedor_id" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb/mas-barato" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb/comparativa" },
    { group: "PRODUCTO-PROVEEDOR", method: "POST", path: "/api/producto-proveedor" },
    { group: "PRODUCTO-PROVEEDOR", method: "POST", path: "/api/producto-proveedor/principal" },
    { group: "PRODUCTO-PROVEEDOR", method: "PUT", path: "/api/producto-proveedor/:id" },
    { group: "PRODUCTO-PROVEEDOR", method: "DELETE", path: "/api/producto-proveedor/:id" },
    
    { group: "CAJA", method: "GET", path: "/api/caja/cajas" },
    { group: "CAJA", method: "GET", path: "/api/caja/cajas/:id" },
    { group: "CAJA", method: "GET", path: "/api/caja/cajas/usuario/:usuario_id/abierta" },
    { group: "CAJA", method: "GET", path: "/api/caja/cajas/:id/totales" },
    { group: "CAJA", method: "POST", path: "/api/caja/cajas" },
    { group: "CAJA", method: "POST", path: "/api/caja/cajas/:id/cerrar" },
    { group: "CAJA", method: "PUT", path: "/api/caja/cajas/:id" },
    
    { group: "VENTAS", method: "GET", path: "/api/caja/ventas" },
    { group: "VENTAS", method: "GET", path: "/api/caja/ventas/:id" },
    { group: "VENTAS", method: "POST", path: "/api/caja/ventas" },
    { group: "VENTAS", method: "PUT", path: "/api/caja/ventas/:id" },
    { group: "VENTAS", method: "DELETE", path: "/api/caja/ventas/:id" },
    
    { group: "GASTOS", method: "GET", path: "/api/caja/gastos" },
    { group: "GASTOS", method: "GET", path: "/api/caja/gastos/:id" },
    { group: "GASTOS", method: "POST", path: "/api/caja/gastos" },
    { group: "GASTOS", method: "PUT", path: "/api/caja/gastos/:id" },
    { group: "GASTOS", method: "DELETE", path: "/api/caja/gastos/:id" },
    
    { group: "CATEGORIAS", method: "GET", path: "/api/caja/categorias" },
    { group: "CATEGORIAS", method: "GET", path: "/api/caja/categorias/:categoria_id/subcategorias" },
    
    { group: "REPORTES-CAJA", method: "GET", path: "/api/caja/reportes/diario" },
    { group: "REPORTES-CAJA", method: "GET", path: "/api/caja/reportes/mensual" },
    { group: "REPORTES-CAJA", method: "GET", path: "/api/caja/reportes/cajas/:caja_id/ventas-metodo" },
    { group: "REPORTES-CAJA", method: "GET", path: "/api/caja/reportes/cajas/:caja_id/gastos-categoria" },
  ];
  
  // Agrupar rutas
  const groupedRoutes = {};
  routes.forEach((route) => {
    if (!groupedRoutes[route.group]) {
      groupedRoutes[route.group] = [];
    }
    groupedRoutes[route.group].push(route);
  });
  
  // Mostrar rutas agrupadas
  Object.keys(groupedRoutes).sort().forEach((group) => {
    console.log(`\n🔹 ${group}`);
    console.log("─".repeat(60));
    groupedRoutes[group].forEach((route) => {
      const method = route.method.padEnd(10);
      console.log(`  ${method} ${route.path}`);
    });
  });
  
  console.log("\n" + "═".repeat(60));
  console.log(`\n📊 Total de rutas: ${routes.length}\n`);
});
