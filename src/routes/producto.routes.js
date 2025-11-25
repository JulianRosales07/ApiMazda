import { Router } from "express";
import {
  obtenerRepuestos,
  obtenerRepuesto,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
} from "../controllers/producto.controller.js";

const router = Router();

router.get("/", obtenerRepuestos);
router.get("/:cb", obtenerRepuesto);
router.post("/", crearRepuesto);
router.put("/:cb", actualizarRepuesto);
router.delete("/:cb", eliminarRepuesto);

export default router;
