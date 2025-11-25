import { Router } from "express";
import {
  obtenerRepuestos,
  obtenerRepuesto,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
} from "../controllers/producto.controller.js";

const router = Router();

/**
 * @swagger
 * /api/repuestos:
 *   get:
 *     summary: Obtener todos los repuestos
 *     tags: [Repuestos]
 *     responses:
 *       200:
 *         description: Lista de repuestos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Repuesto'
 */
router.get("/", obtenerRepuestos);

/**
 * @swagger
 * /api/repuestos/{cb}:
 *   get:
 *     summary: Obtener un repuesto por código de barras
 *     tags: [Repuestos]
 *     parameters:
 *       - in: path
 *         name: cb
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de barras del repuesto
 *     responses:
 *       200:
 *         description: Repuesto encontrado
 *       404:
 *         description: Repuesto no encontrado
 */
router.get("/:cb", obtenerRepuesto);

/**
 * @swagger
 * /api/repuestos:
 *   post:
 *     summary: Crear un nuevo repuesto
 *     tags: [Repuestos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Repuesto'
 *     responses:
 *       200:
 *         description: Repuesto creado exitosamente
 */
router.post("/", crearRepuesto);

/**
 * @swagger
 * /api/repuestos/{cb}:
 *   put:
 *     summary: Actualizar un repuesto
 *     tags: [Repuestos]
 *     parameters:
 *       - in: path
 *         name: cb
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Repuesto'
 *     responses:
 *       200:
 *         description: Repuesto actualizado
 */
router.put("/:cb", actualizarRepuesto);

/**
 * @swagger
 * /api/repuestos/{cb}:
 *   delete:
 *     summary: Eliminar un repuesto (soft delete)
 *     tags: [Repuestos]
 *     parameters:
 *       - in: path
 *         name: cb
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repuesto eliminado
 */
router.delete("/:cb", eliminarRepuesto);

export default router;
