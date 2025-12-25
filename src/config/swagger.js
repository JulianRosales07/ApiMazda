import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Mazda - Sistema de Gestión de Repuestos",
      version: "1.0.0",
      description:
        "API REST para la gestión de repuestos, proveedores, entradas y salidas de inventario",
      contact: {
        name: "Soporte API",
        email: "soporte@mazda.com",
      },
    },
    servers: [
      {
        url: "https://apimazda.onrender.com",
        description: "Servidor de producción",
      },
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    tags: [
      { name: "Repuestos", description: "Gestión de repuestos/productos" },
      { name: "Usuarios", description: "Gestión de usuarios del sistema" },
      { name: "Salidas", description: "Gestión de salidas de inventario" },
      { name: "Entradas", description: "Gestión de entradas de inventario" },
      { name: "Proveedores", description: "Gestión de proveedores" },
      {
        name: "Producto-Proveedor",
        description: "Relaciones y comparativas de precios",
      },
      { name: "Cajas", description: "Gestión de cajas (aperturas y cierres)" },
      { name: "Ventas", description: "Registro de ventas en caja" },
      { name: "Gastos", description: "Registro de gastos en caja" },
      { name: "Categorías", description: "Categorías y subcategorías de gastos" },
      { name: "Reportes Caja", description: "Reportes y estadísticas de caja" },
    ],
    components: {
      schemas: {
        Repuesto: {
          type: "object",
          properties: {
            cb: { type: "string", description: "Código de barras" },
            ci: { type: "string", description: "Código interno" },
            producto: { type: "string", description: "Nombre del producto" },
            tipo: { type: "string", description: "Tipo de producto" },
            modelo_especificacion: {
              type: "string",
              description: "Modelo o especificación",
            },
            referencia: { type: "string", description: "Referencia" },
            marca: { type: "string", description: "Marca" },
            existencias_iniciales: {
              type: "number",
              description: "Existencias iniciales",
            },
            stock: { type: "number", description: "Stock actual" },
            precio: { type: "number", description: "Precio de venta" },
            descripcion_larga: {
              type: "string",
              description: "Descripción detallada",
            },
            estante: { type: "string", description: "Ubicación - Estante" },
            nivel: { type: "string", description: "Ubicación - Nivel" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id_usuario: { type: "integer" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            rol: {
              type: "string",
              enum: ["administrador", "usuario"],
            },
            fecha_creacion: { type: "string", format: "date-time" },
          },
        },
        Proveedor: {
          type: "object",
          properties: {
            id_proveedor: { type: "integer" },
            ci: { type: "string" },
            cp: { type: "string", description: "Código de proveedor" },
            nombre_proveedor: { type: "string" },
            costo: { type: "number" },
            activo: { type: "boolean" },
          },
        },
        Caja: {
          type: "object",
          properties: {
            id_caja: { type: "integer" },
            usuario_id: { type: "integer" },
            fecha_apertura: { type: "string", format: "date-time" },
            fecha_cierre: { type: "string", format: "date-time", nullable: true },
            jornada: { type: "string", enum: ["mañana", "tarde"] },
            monto_inicial: { type: "number" },
            monto_final: { type: "number", nullable: true },
            total_ventas: { type: "number" },
            total_gastos: { type: "number" },
            diferencia: { type: "number", nullable: true },
            notas_apertura: { type: "string", nullable: true },
            notas_cierre: { type: "string", nullable: true },
            estado: { type: "string", enum: ["abierta", "cerrada"] },
            activo: { type: "boolean" },
          },
        },
        Venta: {
          type: "object",
          properties: {
            id_venta: { type: "integer" },
            caja_id: { type: "integer" },
            factura: { type: "string" },
            descripcion: { type: "string" },
            venta_por: { type: "string", enum: ["REDES", "ALMACEN"] },
            valor: { type: "number" },
            metodo_pago: {
              type: "string",
              enum: ["EFECTIVO", "TARJETA", "BANCOLOMBIA", "NEQUI", "DAVIPLATA", "A LA MANO"],
            },
            fecha: { type: "string", format: "date-time" },
            observaciones: { type: "string", nullable: true },
            usuario_registro: { type: "integer" },
            salida_id: { type: "integer", nullable: true },
            activo: { type: "boolean" },
          },
        },
        Gasto: {
          type: "object",
          properties: {
            id_gasto: { type: "integer" },
            caja_id: { type: "integer" },
            fecha: { type: "string", format: "date-time" },
            descripcion: { type: "string" },
            subcategoria_id: { type: "integer", nullable: true },
            categoria_id: { type: "integer" },
            metodo_pago: {
              type: "string",
              enum: ["EFECTIVO", "TARJETA", "BANCOLOMBIA", "NEQUI", "DAVIPLATA", "A LA MANO"],
            },
            valor: { type: "number" },
            usuario_registro: { type: "integer" },
            activo: { type: "boolean" },
          },
        },
        CategoriaGasto: {
          type: "object",
          properties: {
            id_categoria: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            activo: { type: "boolean" },
            subcategorias: {
              type: "array",
              items: { $ref: "#/components/schemas/SubcategoriaGasto" },
            },
          },
        },
        SubcategoriaGasto: {
          type: "object",
          properties: {
            id_subcategoria: { type: "integer" },
            categoria_id: { type: "integer" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            activo: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
