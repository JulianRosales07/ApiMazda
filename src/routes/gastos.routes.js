import { Router } from "express";
import {
  obtenerGastos,
  obtenerGasto,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  reporteGastosCategoria,
  reporteGastosMetodoPago,
} from "../controllers/gastos.controller.js";

const router = Router();

/**
 * @swagger
 * /api/gastos:
 *   get:
 *     summary: Obtener todos los gastos
 *     tags: [Gastos]
 *     parameters:
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_subcategoria
 *         schema:
 *           type: integer
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
 *         description: Lista de gastos
 */
router.get("/", obtenerGastos);

/**
 * @swagger
 * /api/gastos/{id}:
 *   get:
 *     summary: Obtener gasto por ID
 *     tags: [Gastos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto encontrado
 *       404:
 *         description: Gasto no encontrado
 */
router.get("/:id", obtenerGasto);

/**
 * @swagger
 * /api/gastos:
 *   post:
 *     summary: Registrar nuevo gasto
 *     tags: [Gastos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - id_categoria
 *               - metodo_pago
 *               - valor
 *               - usuario_registro
 *             properties:
 *               descripcion:
 *                 type: string
 *               id_categoria:
 *                 type: integer
 *               id_subcategoria:
 *                 type: integer
 *               metodo_pago:
 *                 type: string
 *                 enum: [EFECTIVO, TARJETA, BANCOLOMBIA, NEQUI, DAVIPLATA, A LA MANO]
 *               valor:
 *                 type: number
 *               usuario_registro:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gasto registrado correctamente
 */
router.post("/", crearGasto);

/**
 * @swagger
 * /api/gastos/{id}:
 *   put:
 *     summary: Actualizar gasto
 *     tags: [Gastos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto actualizado
 */
router.put("/:id", actualizarGasto);

/**
 * @swagger
 * /api/gastos/{id}:
 *   delete:
 *     summary: Eliminar gasto
 *     tags: [Gastos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto eliminado
 */
router.delete("/:id", eliminarGasto);

/**
 * @swagger
 * /api/gastos/reportes/categoria:
 *   get:
 *     summary: Reporte de gastos por categoría
 *     tags: [Gastos]
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
 *         description: Reporte de gastos
 */
router.get("/reportes/categoria", reporteGastosCategoria);

/**
 * @swagger
 * /api/gastos/reportes/metodo-pago:
 *   get:
 *     summary: Reporte de gastos por método de pago
 *     tags: [Gastos]
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
router.get("/reportes/metodo-pago", reporteGastosMetodoPago);

export default router;
