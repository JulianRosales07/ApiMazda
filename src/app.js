import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import repuestoRoutes from "./routes/producto.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import salidaRoutes from "./routes/salida.routes.js";
import entradaRoutes from "./routes/entrada.routes.js";
import proveedorRoutes from "./routes/proveedor.routes.js";
import productoProveedorRoutes from "./routes/productoProveedor.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta principal - Mostrar todas las rutas disponibles
app.get("/", (req, res) => {
  const routes = [
    { group: "REPUESTOS", method: "GET", path: "/api/repuestos", desc: "Obtener todos los repuestos" },
    { group: "REPUESTOS", method: "GET", path: "/api/repuestos/:cb", desc: "Obtener un repuesto por CB" },
    { group: "REPUESTOS", method: "POST", path: "/api/repuestos", desc: "Crear un nuevo repuesto" },
    { group: "REPUESTOS", method: "PUT", path: "/api/repuestos/:cb", desc: "Actualizar un repuesto" },
    { group: "REPUESTOS", method: "DELETE", path: "/api/repuestos/:cb", desc: "Eliminar un repuesto" },
    
    { group: "USUARIOS", method: "GET", path: "/api/usuarios", desc: "Obtener todos los usuarios" },
    { group: "USUARIOS", method: "GET", path: "/api/usuarios/:id", desc: "Obtener un usuario por ID" },
    { group: "USUARIOS", method: "POST", path: "/api/usuarios", desc: "Crear un nuevo usuario" },
    { group: "USUARIOS", method: "PUT", path: "/api/usuarios/:id", desc: "Actualizar un usuario" },
    { group: "USUARIOS", method: "PUT", path: "/api/usuarios/:id/password", desc: "Actualizar contraseña" },
    { group: "USUARIOS", method: "DELETE", path: "/api/usuarios/:id", desc: "Eliminar un usuario" },
    
    { group: "SALIDAS", method: "GET", path: "/api/salidas", desc: "Obtener todas las salidas" },
    { group: "SALIDAS", method: "GET", path: "/api/salidas/:n_factura", desc: "Obtener una salida por factura" },
    { group: "SALIDAS", method: "POST", path: "/api/salidas", desc: "Crear una nueva salida" },
    { group: "SALIDAS", method: "PUT", path: "/api/salidas/:n_factura", desc: "Actualizar una salida" },
    { group: "SALIDAS", method: "DELETE", path: "/api/salidas/:n_factura", desc: "Eliminar una salida" },
    
    { group: "ENTRADAS", method: "GET", path: "/api/entradas", desc: "Obtener todas las entradas" },
    { group: "ENTRADAS", method: "GET", path: "/api/entradas/:id", desc: "Obtener una entrada por ID" },
    { group: "ENTRADAS", method: "POST", path: "/api/entradas", desc: "Crear una nueva entrada" },
    { group: "ENTRADAS", method: "PUT", path: "/api/entradas/:id", desc: "Actualizar una entrada" },
    { group: "ENTRADAS", method: "DELETE", path: "/api/entradas/:id", desc: "Eliminar una entrada" },
    
    { group: "PROVEEDORES", method: "GET", path: "/api/proveedores", desc: "Obtener todos los proveedores" },
    { group: "PROVEEDORES", method: "GET", path: "/api/proveedores/:id", desc: "Obtener un proveedor por ID" },
    { group: "PROVEEDORES", method: "POST", path: "/api/proveedores", desc: "Crear un nuevo proveedor" },
    { group: "PROVEEDORES", method: "PUT", path: "/api/proveedores/:id", desc: "Actualizar un proveedor" },
    { group: "PROVEEDORES", method: "DELETE", path: "/api/proveedores/:id", desc: "Desactivar un proveedor" },
    { group: "PROVEEDORES", method: "PATCH", path: "/api/proveedores/:id/activar", desc: "Activar un proveedor" },
    
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor", desc: "Obtener todas las relaciones" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb", desc: "Proveedores de un producto" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/proveedor/:proveedor_id", desc: "Productos de un proveedor" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb/mas-barato", desc: "Proveedor más barato" },
    { group: "PRODUCTO-PROVEEDOR", method: "GET", path: "/api/producto-proveedor/producto/:producto_cb/comparativa", desc: "Comparativa de proveedores" },
    { group: "PRODUCTO-PROVEEDOR", method: "POST", path: "/api/producto-proveedor", desc: "Crear relación producto-proveedor" },
    { group: "PRODUCTO-PROVEEDOR", method: "POST", path: "/api/producto-proveedor/principal", desc: "Establecer proveedor principal" },
    { group: "PRODUCTO-PROVEEDOR", method: "PUT", path: "/api/producto-proveedor/:id", desc: "Actualizar relación" },
    { group: "PRODUCTO-PROVEEDOR", method: "DELETE", path: "/api/producto-proveedor/:id", desc: "Desactivar relación" },
  ];

  const groupedRoutes = {};
  routes.forEach((route) => {
    if (!groupedRoutes[route.group]) {
      groupedRoutes[route.group] = [];
    }
    groupedRoutes[route.group].push(route);
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Mazda - Rutas Disponibles</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          min-height: 100vh;
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 15px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 40px; 
          text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .content { padding: 40px; }
        .group { 
          margin-bottom: 40px; 
          border: 2px solid #e0e0e0; 
          border-radius: 10px; 
          overflow: hidden;
        }
        .group-header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 15px 20px; 
          font-size: 1.3em; 
          font-weight: bold;
        }
        .route { 
          padding: 15px 20px; 
          border-bottom: 1px solid #f0f0f0; 
          display: flex; 
          align-items: center;
          transition: background 0.2s;
        }
        .route:hover { background: #f8f9fa; }
        .route:last-child { border-bottom: none; }
        .method { 
          display: inline-block; 
          padding: 5px 12px; 
          border-radius: 5px; 
          font-weight: bold; 
          font-size: 0.85em; 
          margin-right: 15px;
          min-width: 70px;
          text-align: center;
        }
        .method.GET { background: #28a745; color: white; }
        .method.POST { background: #007bff; color: white; }
        .method.PUT { background: #ffc107; color: #333; }
        .method.DELETE { background: #dc3545; color: white; }
        .method.PATCH { background: #17a2b8; color: white; }
        .path { 
          font-family: 'Courier New', monospace; 
          color: #333; 
          font-weight: 500;
          flex: 1;
        }
        .desc { 
          color: #666; 
          font-size: 0.9em; 
          margin-left: 15px;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          background: #f8f9fa; 
          color: #666;
          font-size: 0.9em;
        }
        .stats { 
          display: flex; 
          justify-content: space-around; 
          padding: 30px; 
          background: #f8f9fa; 
          border-radius: 10px; 
          margin-bottom: 30px;
        }
        .stat { text-align: center; }
        .stat-number { 
          font-size: 2.5em; 
          font-weight: bold; 
          color: #667eea; 
        }
        .stat-label { 
          color: #666; 
          margin-top: 5px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 API Mazda</h1>
          <p>Sistema de Gestión de Repuestos y Proveedores</p>
        </div>
        
        <div class="content">
          <div class="stats">
            <div class="stat">
              <div class="stat-number">${routes.length}</div>
              <div class="stat-label">Rutas Totales</div>
            </div>
            <div class="stat">
              <div class="stat-number">${Object.keys(groupedRoutes).length}</div>
              <div class="stat-label">Módulos</div>
            </div>
            <div class="stat">
              <div class="stat-number">${req.protocol}://${req.get('host')}</div>
              <div class="stat-label">Base URL</div>
            </div>
          </div>

          ${Object.keys(groupedRoutes).sort().map(group => `
            <div class="group">
              <div class="group-header">📦 ${group}</div>
              ${groupedRoutes[group].map(route => `
                <div class="route">
                  <span class="method ${route.method}">${route.method}</span>
                  <span class="path">${route.path}</span>
                  <span class="desc">${route.desc}</span>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>💻 Desarrollado para Mazda | API REST v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Rutas
app.use("/api/repuestos", repuestoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/salidas", salidaRoutes);
app.use("/api/entradas", entradaRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/producto-proveedor", productoProveedorRoutes);

export default app;
