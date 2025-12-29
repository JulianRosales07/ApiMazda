import { Router } from "express";
import {
  obtenerVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
  reporteVentasPeriodo,
  reporteVentasMetodoPago,
} from "../controllers/ventas.controller.js";

const router = Router();

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     parameters:
 *       - in: query
 *         name: venta_por
 *         schema:
 *           type: string
 *           enum: [REDES, ALMACEN]
 *       - in: query
 *         name: metodo_pago
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get("/", obtenerVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: Venta no encontrada
 */
router.get("/:id", obtenerVenta);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Registrar nueva venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - factura_descripcion
 *               - venta_por
 *               - valor
 *               - metodo_pago
 *               - usuario_registro
 *             properties:
 *               factura_descripcion:
 *                 type: string
 *               venta_por:
 *                 type: string
 *                 enum: [REDES, ALMACEN]
 *               valor:
 *                 type: number
 *               metodo_pago:
 *                 type: string
 *                 enum: [EFECTIVO, TARJETA, BANCOLOMBIA, NEQUI, DAVIPLATA, A LA MANO]
 *               usuario_registro:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venta registrada correctamente
 */
router.post("/", crearVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   put:
 *     summary: Actualizar venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta actualizada
 */
router.put("/:id", actualizarVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta eliminada
 */
router.delete("/:id", eliminarVenta);

/**
 * @swagger
 * /api/ventas/reportes/periodo:
 *   get:
 *     summary: Reporte de ventas por período
 *     tags: [Ventas]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte de ventas
 */
router.get("/reportes/periodo", reporteVentasPeriodo);

/**
 * @swagger
 * /api/ventas/reportes/metodo-pago:
 *   get:
 *     summary: Reporte de ventas por método de pago
 *     tags: [Ventas]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte por método de pago
 */
router.get("/reportes/metodo-pago", reporteVentasMetodoPago);

export default router;
