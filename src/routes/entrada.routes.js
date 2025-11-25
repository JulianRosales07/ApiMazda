import { Router } from "express";
import {
  obtenerEntradas,
  obtenerEntrada,
  crearEntrada,
  actualizarEntrada,
  eliminarEntrada,
} from "../controllers/entrada.controller.js";

const router = Router();

/**
 * @swagger
 * /api/entradas:
 *   get:
 *     summary: Obtener todas las entradas
 *     tags: [Entradas]
 *     parameters:
 *       - in: query
 *         name: proveedor
 *         schema:
 *           type: string
 *         description: Filtrar por proveedor
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
 *         description: Lista de entradas
 */
router.get("/", obtenerEntradas);

/**
 * @swagger
 * /api/entradas/{id}:
 *   get:
 *     summary: Obtener una entrada por ID
 *     tags: [Entradas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada encontrada
 *       404:
 *         description: Entrada no encontrada
 */
router.get("/:id", obtenerEntrada);

/**
 * @swagger
 * /api/entradas:
 *   post:
 *     summary: Crear una nueva entrada
 *     tags: [Entradas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               n_factura:
 *                 type: string
 *               proveedor:
 *                 type: string
 *               fecha:
 *                 type: string
 *               cb:
 *                 type: string
 *               ci:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               cantidad:
 *                 type: number
 *               costo:
 *                 type: number
 *               valor_venta:
 *                 type: number
 *     responses:
 *       200:
 *         description: Entrada creada exitosamente
 */
router.post("/", crearEntrada);

/**
 * @swagger
 * /api/entradas/{id}:
 *   put:
 *     summary: Actualizar una entrada
 *     tags: [Entradas]
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
 *         description: Entrada actualizada
 */
router.put("/:id", actualizarEntrada);

/**
 * @swagger
 * /api/entradas/{id}:
 *   delete:
 *     summary: Eliminar una entrada
 *     tags: [Entradas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada eliminada
 */
router.delete("/:id", eliminarEntrada);

export default router;
