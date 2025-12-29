import { Router } from "express";
import {
  obtenerCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerSubcategorias,
  obtenerSubcategoria,
  crearSubcategoria,
  actualizarSubcategoria,
  eliminarSubcategoria,
} from "../controllers/categorias.controller.js";

const router = Router();

// ============================================
// RUTAS DE CATEGORÍAS
// ============================================

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías con subcategorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/", obtenerCategorias);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 */
router.get("/:id", obtenerCategoria);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría creada
 */
router.post("/", crearCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put("/:id", actualizarCategoria);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.delete("/:id", eliminarCategoria);

// ============================================
// RUTAS DE SUBCATEGORÍAS
// ============================================

/**
 * @swagger
 * /api/categorias/{categoria_id}/subcategorias:
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
router.get("/:categoria_id/subcategorias", obtenerSubcategorias);

/**
 * @swagger
 * /api/categorias/subcategorias/{id}:
 *   get:
 *     summary: Obtener subcategoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategoría encontrada
 */
router.get("/subcategorias/:id", obtenerSubcategoria);

/**
 * @swagger
 * /api/categorias/subcategorias:
 *   post:
 *     summary: Crear nueva subcategoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_categoria
 *               - nombre
 *             properties:
 *               id_categoria:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subcategoría creada
 */
router.post("/subcategorias", crearSubcategoria);

/**
 * @swagger
 * /api/categorias/subcategorias/{id}:
 *   put:
 *     summary: Actualizar subcategoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategoría actualizada
 */
router.put("/subcategorias/:id", actualizarSubcategoria);

/**
 * @swagger
 * /api/categorias/subcategorias/{id}:
 *   delete:
 *     summary: Eliminar subcategoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subcategoría eliminada
 */
router.delete("/subcategorias/:id", eliminarSubcategoria);

export default router;
