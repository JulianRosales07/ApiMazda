import { Router } from "express";
import {
  obtenerProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  activarProveedorController,
} from "../controllers/proveedor.controller.js";

const router = Router();

router.get("/", obtenerProveedores);
router.get("/:id", obtenerProveedor);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);
router.patch("/:id/activar", activarProveedorController);

export default router;
