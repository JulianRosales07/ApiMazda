import { Router } from "express";
import {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    actualizarPassword,
    eliminarUsuario,
} from "../controllers/usuario.controller.js";

const router = Router();

router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuario);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.put("/:id/password", actualizarPassword);
router.delete("/:id", eliminarUsuario);

export default router;
