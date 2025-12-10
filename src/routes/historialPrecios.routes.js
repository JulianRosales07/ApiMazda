import express from "express";
import * as historialPreciosController from "../controllers/historialPrecios.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/historial-precios:
 *   get:
 *     summary: Obtener historial de precios con filtros
 *     tags: [Historial Precios]
 *     parameters:
 *       - in: query
 *         name: producto_cb
 *         schema:
 *           type: string
 *       - in: query
 *         name: proveedor_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 */
router.get("/", historialPreciosController.getHistorial);

/**
 * @swagger
 * /api/historial-precios/producto/{producto_cb}:
 *   get:
 *     summary: Obtener historial de precios por producto
 *     tags: [Historial Precios]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get("/producto/:producto_cb", historialPreciosController.getHistorialByProducto);

/**
 * @swagger
 * /api/historial-precios/proveedor/{proveedor_id}:
 *   get:
 *     summary: Obtener historial de precios por proveedor
 *     tags: [Historial Precios]
 *     parameters:
 *       - in: path
 *         name: proveedor_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get("/proveedor/:proveedor_id", historialPreciosController.getHistorialByProveedor);

/**
 * @swagger
 * /api/historial-precios/producto/{producto_cb}/proveedor/{proveedor_id}:
 *   get:
 *     summary: Obtener historial de un producto con un proveedor específico
 *     tags: [Historial Precios]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: proveedor_id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  "/producto/:producto_cb/proveedor/:proveedor_id",
  historialPreciosController.getHistorialProductoProveedor
);

/**
 * @swagger
 * /api/historial-precios/estadisticas/{producto_cb}/{proveedor_id}:
 *   get:
 *     summary: Obtener estadísticas de precios
 *     tags: [Historial Precios]
 */
router.get(
  "/estadisticas/:producto_cb/:proveedor_id",
  historialPreciosController.getEstadisticas
);

/**
 * @swagger
 * /api/historial-precios/comparar/{producto_cb}:
 *   get:
 *     summary: Comparar precios entre proveedores
 *     tags: [Historial Precios]
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 */
router.get("/comparar/:producto_cb", historialPreciosController.compararProveedores);

/**
 * @swagger
 * /api/historial-precios:
 *   post:
 *     summary: Crear registro manual de historial
 *     tags: [Historial Precios]
 */
router.post("/", historialPreciosController.createHistorial);

/**
 * @swagger
 * /api/historial-precios/{id}:
 *   put:
 *     summary: Actualizar registro de historial
 *     tags: [Historial Precios]
 */
router.put("/:id", historialPreciosController.updateHistorial);

/**
 * @swagger
 * /api/historial-precios/{id}:
 *   delete:
 *     summary: Eliminar registro de historial
 *     tags: [Historial Precios]
 */
router.delete("/:id", historialPreciosController.deleteHistorial);

export default router;
