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
} from "../controllers/caja.controller.js";

const router = Router();

// ============================================
// RUTAS DE CAJAS
// ============================================
router.get("/cajas", obtenerCajas);
router.get("/cajas/:id", obtenerCaja);
router.get("/cajas/usuario/:usuario_id/abierta", obtenerCajaAbiertaUsuario);
router.get("/cajas/:id/totales", obtenerTotalesCaja);
router.post("/cajas", abrirCaja);
router.post("/cajas/:id/cerrar", cerrarCajaController);
router.put("/cajas/:id", actualizarCaja);

// ============================================
// RUTAS DE VENTAS
// ============================================
router.get("/ventas", obtenerVentas);
router.get("/ventas/:id", obtenerVenta);
router.post("/ventas", crearVenta);
router.put("/ventas/:id", actualizarVenta);
router.delete("/ventas/:id", eliminarVenta);

// ============================================
// RUTAS DE GASTOS
// ============================================
router.get("/gastos", obtenerGastos);
router.get("/gastos/:id", obtenerGasto);
router.post("/gastos", crearGasto);
router.put("/gastos/:id", actualizarGasto);
router.delete("/gastos/:id", eliminarGasto);

// ============================================
// RUTAS DE CATEGORÍAS
// ============================================
router.get("/categorias", obtenerCategorias);
router.get("/categorias/:categoria_id/subcategorias", obtenerSubcategorias);

// ============================================
// RUTAS DE REPORTES
// ============================================
router.get("/reportes/diario", obtenerReporteDiarioController);
router.get("/reportes/mensual", obtenerReporteMensualController);
router.get("/reportes/cajas/:caja_id/ventas-metodo", obtenerResumenVentasPorMetodo);
router.get("/reportes/cajas/:caja_id/gastos-categoria", obtenerResumenGastosPorCategoria);

export default router;
