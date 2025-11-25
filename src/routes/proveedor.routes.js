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

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Obtener todos los proveedores activos
 *     tags: [Proveedores]
 *     responses:
 *       200:
 *         description: Lista de proveedores
 */
router.get("/", obtenerProveedores);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener un proveedor por ID
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       404:
 *         description: Proveedor no encontrado
 */
router.get("/:id", obtenerProveedor);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cp
 *               - nombre_proveedor
 *             properties:
 *               ci:
 *                 type: string
 *               cp:
 *                 type: string
 *                 description: Código de proveedor (único)
 *               nombre_proveedor:
 *                 type: string
 *               costo:
 *                 type: number
 *               usuario_creacion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Proveedor creado exitosamente
 */
router.post("/", crearProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Proveedores]
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
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 */
router.put("/:id", actualizarProveedor);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   delete:
 *     summary: Desactivar un proveedor (soft delete)
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor desactivado
 */
router.delete("/:id", eliminarProveedor);

/**
 * @swagger
 * /api/proveedores/{id}/activar:
 *   patch:
 *     summary: Activar un proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor activado
 */
router.patch("/:id/activar", activarProveedorController);

export default router;
