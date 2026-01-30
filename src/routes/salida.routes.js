import { Router } from "express";
import {
  obtenerSalidas,
  obtenerSalida,
  obtenerSalidasPorFactura,
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
 * /api/salidas/factura/{n_factura}:
 *   get:
 *     summary: Obtener salidas por número de factura
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: n_factura
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Salidas encontradas
 *       404:
 *         description: No se encontraron salidas
 */
router.get("/factura/:n_factura", obtenerSalidasPorFactura);

/**
 * @swagger
 * /api/salidas/{id}:
 *   get:
 *     summary: Obtener una salida por ID
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salida encontrada
 *       404:
 *         description: Salida no encontrada
 */
router.get("/:id", obtenerSalida);

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
 * /api/salidas/{id}:
 *   put:
 *     summary: Actualizar una salida por ID
 *     tags: [Salidas]
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
 *     responses:
 *       200:
 *         description: Salida actualizada
 */
router.put("/:id", actualizarSalida);

/**
 * @swagger
 * /api/salidas/{id}:
 *   delete:
 *     summary: Eliminar una salida por ID
 *     tags: [Salidas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salida eliminada
 */
router.delete("/:id", eliminarSalida);

export default router;
