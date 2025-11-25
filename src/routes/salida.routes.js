import { Router } from "express";
import {
  obtenerSalidas,
  obtenerSalida,
  crearSalida,
  actualizarSalida,
  eliminarSalida,
} from "../controllers/salida.controller.js";

const router = Router();

/**
 * @swagger
 * /api/salidas:
 *   get:
 *     summary: Obtener todas las salidas
 *     tags: [Salidas]
 *     parameters:
 *       - in: query
 *         name: cb
 *         schema:
 *           type: string
 *         description: Filtrar por código de barras
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *         description: Filtrar por fecha
 *     responses:
 *       200:
 *         description: Lista de salidas
 */
router.get("/", obtenerSalidas);

/**
 * @swagger
 * /api/salidas/{n_factura}:
 *   get:
 *     summary: Obtener una salida por número de factura
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: n_factura
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Salida encontrada
 *       404:
 *         description: Salida no encontrada
 */
router.get("/:n_factura", obtenerSalida);

/**
 * @swagger
 * /api/salidas:
 *   post:
 *     summary: Crear una nueva salida
 *     tags: [Salidas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               n_factura:
 *                 type: number
 *               fecha:
 *                 type: number
 *               cb:
 *                 type: number
 *               ci:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               valor:
 *                 type: number
 *               cantidad:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salida creada exitosamente
 */
router.post("/", crearSalida);

/**
 * @swagger
 * /api/salidas/{n_factura}:
 *   put:
 *     summary: Actualizar una salida
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: n_factura
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Salida actualizada
 */
router.put("/:n_factura", actualizarSalida);

/**
 * @swagger
 * /api/salidas/{n_factura}:
 *   delete:
 *     summary: Eliminar una salida
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: n_factura
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Salida eliminada
 */
router.delete("/:n_factura", eliminarSalida);

export default router;
