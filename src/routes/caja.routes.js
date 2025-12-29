import { Router } from "express";
import {
  obtenerCajas,
  obtenerCaja,
  obtenerCajaAbiertaUsuario,
  abrirCaja,
  cerrarCajaController,
  actualizarCaja,
  obtenerTotalesCaja,
  obtenerVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
  obtenerGastos,
  obtenerGasto,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  obtenerCategorias,
  obtenerSubcategorias,
  obtenerReporteDiarioController,
  obtenerReporteMensualController,
  obtenerResumenVentasPorMetodo,
  obtenerResumenGastosPorCategoria,
  obtenerSaldoCajaFuerte,
  obtenerMovimientosCajaFuerte,
  obtenerMovimientoCajaFuerte,
  crearMovimientoCajaFuerte,
  actualizarMovimientoCajaFuerte,
  eliminarMovimientoCajaFuerte,
  obtenerHistorialSaldosCajaFuerte,
} from "../controllers/caja.controller.js";

const router = Router();

// ============================================
// RUTAS DE CAJAS
// ============================================

/**
 * @swagger
 * /api/caja/cajas:
 *   get:
 *     summary: Obtener todas las cajas
 *     tags: [Cajas]
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [abierta, cerrada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: jornada
 *         schema:
 *           type: string
 *           enum: [mañana, tarde]
 *         description: Filtrar por jornada
 *     responses:
 *       200:
 *         description: Lista de cajas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Caja'
 */
router.get("/cajas", obtenerCajas);

/**
 * @swagger
 * /api/caja/cajas/{id}:
 *   get:
 *     summary: Obtener caja por ID
 *     tags: [Cajas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Caja encontrada
 *       404:
 *         description: Caja no encontrada
 */
router.get("/cajas/:id", obtenerCaja);

/**
 * @swagger
 * /api/caja/cajas/usuario/{usuario_id}/abierta:
 *   get:
 *     summary: Verificar si usuario tiene caja abierta
 *     tags: [Cajas]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Caja abierta o null
 */
router.get("/cajas/usuario/:usuario_id/abierta", obtenerCajaAbiertaUsuario);

/**
 * @swagger
 * /api/caja/cajas/{id}/totales:
 *   get:
 *     summary: Calcular totales de caja
 *     tags: [Cajas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Totales calculados
 */
router.get("/cajas/:id/totales", obtenerTotalesCaja);

/**
 * @swagger
 * /api/caja/cajas:
 *   post:
 *     summary: Abrir nueva caja
 *     tags: [Cajas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - jornada
 *               - monto_inicial
 *             properties:
 *               usuario_id:
 *                 type: integer
 *               jornada:
 *                 type: string
 *                 enum: [mañana, tarde]
 *               monto_inicial:
 *                 type: number
 *               notas_apertura:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caja abierta correctamente
 *       400:
 *         description: Ya existe una caja abierta
 */
router.post("/cajas", abrirCaja);

/**
 * @swagger
 * /api/caja/cajas/{id}/cerrar:
 *   post:
 *     summary: Cerrar caja
 *     tags: [Cajas]
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
 *             required:
 *               - monto_final
 *             properties:
 *               monto_final:
 *                 type: number
 *               notas_cierre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caja cerrada correctamente
 */
router.post("/cajas/:id/cerrar", cerrarCajaController);

/**
 * @swagger
 * /api/caja/cajas/{id}:
 *   put:
 *     summary: Actualizar caja
 *     tags: [Cajas]
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
 *             $ref: '#/components/schemas/Caja'
 *     responses:
 *       200:
 *         description: Caja actualizada
 */
router.put("/cajas/:id", actualizarCaja);

// ============================================
// RUTAS DE VENTAS
// ============================================

/**
 * @swagger
 * /api/caja/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     parameters:
 *       - in: query
 *         name: metodo_pago
 *         schema:
 *           type: string
 *       - in: query
 *         name: venta_por
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
router.get("/ventas", obtenerVentas);

/**
 * @swagger
 * /api/caja/ventas/{id}:
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
 */
router.get("/ventas/:id", obtenerVenta);

/**
 * @swagger
 * /api/caja/ventas:
 *   post:
 *     summary: Registrar nueva venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venta'
 *     responses:
 *       200:
 *         description: Venta registrada
 */
router.post("/ventas", crearVenta);

/**
 * @swagger
 * /api/caja/ventas/{id}:
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
router.put("/ventas/:id", actualizarVenta);

/**
 * @swagger
 * /api/caja/ventas/{id}:
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
router.delete("/ventas/:id", eliminarVenta);

// ============================================
// RUTAS DE GASTOS
// ============================================

/**
 * @swagger
 * /api/caja/gastos:
 *   get:
 *     summary: Obtener todos los gastos
 *     tags: [Gastos]
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
router.get("/gastos", obtenerGastos);

/**
 * @swagger
 * /api/caja/gastos/{id}:
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
 */
router.get("/gastos/:id", obtenerGasto);

/**
 * @swagger
 * /api/caja/gastos:
 *   post:
 *     summary: Registrar nuevo gasto
 *     tags: [Gastos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gasto'
 *     responses:
 *       200:
 *         description: Gasto registrado
 */
router.post("/gastos", crearGasto);

/**
 * @swagger
 * /api/caja/gastos/{id}:
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
router.put("/gastos/:id", actualizarGasto);

/**
 * @swagger
 * /api/caja/gastos/{id}:
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
router.delete("/gastos/:id", eliminarGasto);

// ============================================
// RUTAS DE CATEGORÍAS
// ============================================

/**
 * @swagger
 * /api/caja/categorias:
 *   get:
 *     summary: Obtener todas las categorías con subcategorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/categorias", obtenerCategorias);

/**
 * @swagger
 * /api/caja/categorias/{categoria_id}/subcategorias:
 *   get:
 *     summary: Obtener subcategorías por categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: categoria_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de subcategorías
 */
router.get("/categorias/:categoria_id/subcategorias", obtenerSubcategorias);

// ============================================
// RUTAS DE REPORTES
// ============================================

/**
 * @swagger
 * /api/caja/reportes/diario:
 *   get:
 *     summary: Reporte diario de cajas
 *     tags: [Reportes Caja]
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
 *         description: Reporte diario
 */
router.get("/reportes/diario", obtenerReporteDiarioController);

/**
 * @swagger
 * /api/caja/reportes/mensual:
 *   get:
 *     summary: Reporte mensual de cajas
 *     tags: [Reportes Caja]
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte mensual
 */
router.get("/reportes/mensual", obtenerReporteMensualController);

/**
 * @swagger
 * /api/caja/reportes/ventas-metodo:
 *   get:
 *     summary: Resumen de ventas por método de pago
 *     tags: [Reportes Caja]
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
 *         description: Resumen de ventas
 */
router.get("/reportes/ventas-metodo", obtenerResumenVentasPorMetodo);

/**
 * @swagger
 * /api/caja/reportes/gastos-categoria:
 *   get:
 *     summary: Resumen de gastos por categoría
 *     tags: [Reportes Caja]
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
 *         description: Resumen de gastos
 */
router.get("/reportes/gastos-categoria", obtenerResumenGastosPorCategoria);

// ============================================
// RUTAS DE CAJA FUERTE
// ============================================

/**
 * @swagger
 * /api/caja/caja-fuerte/saldo:
 *   get:
 *     summary: Obtener saldo actual de caja fuerte
 *     tags: [Caja Fuerte]
 *     responses:
 *       200:
 *         description: Saldo actual
 */
router.get("/caja-fuerte/saldo", obtenerSaldoCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/movimientos:
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
 *     responses:
 *       200:
 *         description: Lista de movimientos
 */
router.get("/caja-fuerte/movimientos", obtenerMovimientosCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/movimientos/{id}:
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
router.get("/caja-fuerte/movimientos/:id", obtenerMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/historial:
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
router.get("/caja-fuerte/historial", obtenerHistorialSaldosCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/movimientos:
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
router.post("/caja-fuerte/movimientos", crearMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/movimientos/{id}:
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
router.put("/caja-fuerte/movimientos/:id", actualizarMovimientoCajaFuerte);

/**
 * @swagger
 * /api/caja/caja-fuerte/movimientos/{id}:
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
router.delete("/caja-fuerte/movimientos/:id", eliminarMovimientoCajaFuerte);

export default router;
