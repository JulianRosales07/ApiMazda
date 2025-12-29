import { Router } from "express";
import {
  obtenerReporteDiario,
  actualizarReporte,
  obtenerReportes,
  obtenerReporte,
  obtenerReportePorFecha,
  obtenerVistaReporteDiario,
  eliminarReporte,
} from "../controllers/reportes.controller.js";

const router = Router();

/**
 * @swagger
 * /api/reportes/diario:
 *   get:
 *     summary: Reporte diario de ventas vs gastos
 *     tags: [Reportes]
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
 *         description: Reporte diario
 */
router.get("/diario", obtenerReporteDiario);

/**
 * @swagger
 * /api/reportes/vista-diario:
 *   get:
 *     summary: Vista de reporte diario
 *     tags: [Reportes]
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
 *         description: Vista de reporte diario
 */
router.get("/vista-diario", obtenerVistaReporteDiario);

/**
 * @swagger
 * /api/reportes:
 *   get:
 *     summary: Obtener todos los reportes almacenados
 *     tags: [Reportes]
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
 *         description: Lista de reportes
 */
router.get("/", obtenerReportes);

/**
 * @swagger
 * /api/reportes/{id}:
 *   get:
 *     summary: Obtener reporte por ID
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte encontrado
 */
router.get("/:id", obtenerReporte);

/**
 * @swagger
 * /api/reportes/fecha/{fecha}:
 *   get:
 *     summary: Obtener reporte por fecha
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte encontrado
 */
router.get("/fecha/:fecha", obtenerReportePorFecha);

/**
 * @swagger
 * /api/reportes/actualizar:
 *   post:
 *     summary: Actualizar o crear reporte diario
 *     tags: [Reportes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               usuario_registro:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reporte actualizado
 */
router.post("/actualizar", actualizarReporte);

/**
 * @swagger
 * /api/reportes/{id}:
 *   delete:
 *     summary: Eliminar reporte
 *     tags: [Reportes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte eliminado
 */
router.delete("/:id", eliminarReporte);

export default router;
