import { Router } from "express";
import {
  obtenerEntradas,
  obtenerEntrada,
  crearEntrada,
  actualizarEntrada,
  eliminarEntrada,
} from "../controllers/entrada.controller.js";

const router = Router();

router.get("/", obtenerEntradas);
router.get("/:id", obtenerEntrada);
router.post("/", crearEntrada);
router.put("/:id", actualizarEntrada);
router.delete("/:id", eliminarEntrada);

export default router;
