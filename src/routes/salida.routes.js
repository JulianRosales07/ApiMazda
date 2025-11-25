import { Router } from "express";
import {
  obtenerSalidas,
  obtenerSalida,
  crearSalida,
  actualizarSalida,
  eliminarSalida,
} from "../controllers/salida.controller.js";

const router = Router();

router.get("/", obtenerSalidas);
router.get("/:n_factura", obtenerSalida);
router.post("/", crearSalida);
router.put("/:n_factura", actualizarSalida);
router.delete("/:n_factura", eliminarSalida);

export default router;
