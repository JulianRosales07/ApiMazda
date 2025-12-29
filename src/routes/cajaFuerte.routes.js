import { Router } from "express";
import {
  obtenerSaldoCajaFuerte,
  obtenerMovimientosCajaFuerte,
  obtenerMovimientoCajaFuerte,
  crearMovimientoCajaFuerte,
  actualizarMovimientoCajaFuerte,
  eliminarMovimientoCajaFuerte,
  obtenerHistorialSaldos,
  obtenerFlujoCajaDiario,
} from "../controllers/cajaFuerte.controller.js";

const router = Router();

/**
 * @swagger
 * /api/caja-fuerte/saldo:
 *   get:
 *     summary: Obtener saldo actual de caja fuerte
 *     tags: [Caja Fuerte]
 *     responses:
 *       200:
 *         description: Saldo actual
 */
router.get("/saldo", obtenerSaldoCajaFuerte);

/**
 * @swagger
 * /api/caja-fuerte/movimientos:
 *   get:
 *     summary: Obtener todos los movimientos de caja fuerte
 *     tags: [Caja Fuerte]
 *     parameters:
 *       - in: query
 *         name: tipo_movimiento
 *         schema:
 *           type: string
 *           enum: [DEPOSITO, RETIRO]
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
 *       - in: query
 *         name: caja_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de movimientos
 */
router.get("/movimientos", obtenerMovimientosCajaFuerte);

/**
 * @swagger
 * /api/caja-fuerte/movimientos/{id}:
 *   get:
 *     summary: Obtener movimiento por ID
 *     tags: [Caja Fuerte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento encontrado
 */
router.get("/movimientos/:id", obtenerMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja-fuerte/historial:
 *   get:
 *     summary: Obtener historial de saldos
 *     tags: [Caja Fuerte]
 *     parameters:
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
 *         description: Historial de saldos
 */
router.get("/historial", obtenerHistorialSaldos);

/**
 * @swagger
 * /api/caja-fuerte/flujo-diario:
 *   get:
 *     summary: Flujo de caja diario
 *     tags: [Caja Fuerte]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Flujo de caja del día
 */
router.get("/flujo-diario", obtenerFlujoCajaDiario);

/**
 * @swagger
 * /api/caja-fuerte/movimientos:
 *   post:
 *     summary: Registrar movimiento en caja fuerte
 *     tags: [Caja Fuerte]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_movimiento
 *               - monto
 *               - descripcion
 *               - usuario_registro
 *             properties:
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [DEPOSITO, RETIRO]
 *               monto:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               usuario_registro:
 *                 type: integer
 *               caja_id:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movimiento registrado
 */
router.post("/movimientos", crearMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja-fuerte/movimientos/{id}:
 *   put:
 *     summary: Actualizar movimiento
 *     tags: [Caja Fuerte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento actualizado
 */
router.put("/movimientos/:id", actualizarMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja-fuerte/movimientos/{id}:
 *   delete:
 *     summary: Eliminar movimiento
 *     tags: [Caja Fuerte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento eliminado
 */
router.delete("/movimientos/:id", eliminarMovimientoCajaFuerte);

export default router;
