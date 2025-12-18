import { Router } from "express";
import {
  obtenerProductoProveedor,
  obtenerProveedoresDeProducto,
  obtenerProductosDeProveedor,
  obtenerProveedorMasBarato,
  obtenerComparativa,
  crearProductoProveedor,
  actualizarProductoProveedor,
  establecerProveedorPrincipal,
  eliminarProductoProveedor,
  eliminarRelacionesProducto,
} from "../controllers/productoProveedor.controller.js";

const router = Router();

/**
 * @swagger
 * /api/producto-proveedor:
 *   get:
 *     summary: Obtener todas las relaciones producto-proveedor
 *     tags: [Producto-Proveedor]
 *     responses:
 *       200:
 *         description: Lista de relaciones
 */
router.get("/", obtenerProductoProveedor);

/**
 * @swagger
 * /api/producto-proveedor/producto/{producto_cb}:
 *   get:
 *     summary: Obtener todos los proveedores de un producto
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de barras del producto
 *     responses:
 *       200:
 *         description: Lista de proveedores del producto
 */
router.get("/producto/:producto_cb", obtenerProveedoresDeProducto);

/**
 * @swagger
 * /api/producto-proveedor/proveedor/{proveedor_id}:
 *   get:
 *     summary: Obtener todos los productos de un proveedor
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: proveedor_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos del proveedor
 */
router.get("/proveedor/:proveedor_id", obtenerProductosDeProveedor);

/**
 * @swagger
 * /api/producto-proveedor/producto/{producto_cb}/mas-barato:
 *   get:
 *     summary: Obtener el proveedor más barato de un producto
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proveedor más barato
 *       404:
 *         description: No se encontraron proveedores
 */
router.get("/producto/:producto_cb/mas-barato", obtenerProveedorMasBarato);

/**
 * @swagger
 * /api/producto-proveedor/producto/{producto_cb}/comparativa:
 *   get:
 *     summary: Obtener comparativa de precios de proveedores para un producto
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comparativa de proveedores con precios y márgenes
 */
router.get("/producto/:producto_cb/comparativa", obtenerComparativa);

/**
 * @swagger
 * /api/producto-proveedor:
 *   post:
 *     summary: Crear una relación producto-proveedor
 *     tags: [Producto-Proveedor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_cb
 *               - proveedor_id
 *               - precio_proveedor
 *             properties:
 *               producto_cb:
 *                 type: string
 *               proveedor_id:
 *                 type: integer
 *               precio_proveedor:
 *                 type: number
 *               es_proveedor_principal:
 *                 type: boolean
 *               fecha_ultima_compra:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Relación creada exitosamente
 */
router.post("/", crearProductoProveedor);

/**
 * @swagger
 * /api/producto-proveedor/principal:
 *   post:
 *     summary: Establecer un proveedor como principal para un producto
 *     tags: [Producto-Proveedor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_cb
 *               - proveedor_id
 *             properties:
 *               producto_cb:
 *                 type: string
 *               proveedor_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Proveedor principal establecido
 */
router.post("/principal", establecerProveedorPrincipal);

/**
 * @swagger
 * /api/producto-proveedor/{id}:
 *   put:
 *     summary: Actualizar una relación producto-proveedor
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precio_proveedor:
 *                 type: number
 *               es_proveedor_principal:
 *                 type: boolean
 *               fecha_ultima_compra:
 *                 type: string
 *     responses:
 *       200:
 *         description: Relación actualizada
 */
router.put("/:id", actualizarProductoProveedor);

/**
 * @swagger
 * /api/producto-proveedor/{id}:
 *   delete:
 *     summary: Desactivar una relación producto-proveedor
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relación desactivada
 */
router.delete("/:id", eliminarProductoProveedor);

/**
 * @swagger
 * /api/producto-proveedor/producto/{producto_cb}/hard-delete:
 *   delete:
 *     summary: Eliminar permanentemente todas las relaciones de un producto
 *     tags: [Producto-Proveedor]
 *     parameters:
 *       - in: path
 *         name: producto_cb
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de barras del producto
 *     responses:
 *       200:
 *         description: Relaciones eliminadas permanentemente
 */
router.delete("/producto/:producto_cb/hard-delete", eliminarRelacionesProducto);

export default router;
