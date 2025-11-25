import { Router } from "express";
import {
  obtenerProductoProveedor,
  obtenerProveedoresDeProducto,
  obtenerProductosDeProveedor,
  obtenerProveedorMasBarato,
  obtenerComparativa,
  crearProductoProveedor,
  actualizarProductoProveedor,
  establecerProveedorPrincipal,
  eliminarProductoProveedor,
} from "../controllers/productoProveedor.controller.js";

const router = Router();

router.get("/", obtenerProductoProveedor);
router.get("/producto/:producto_cb", obtenerProveedoresDeProducto);
router.get("/proveedor/:proveedor_id", obtenerProductosDeProveedor);
router.get("/producto/:producto_cb/mas-barato", obtenerProveedorMasBarato);
router.get("/producto/:producto_cb/comparativa", obtenerComparativa);
router.post("/", crearProductoProveedor);
router.post("/principal", establecerProveedorPrincipal);
router.put("/:id", actualizarProductoProveedor);
router.delete("/:id", eliminarProductoProveedor);

export default router;
