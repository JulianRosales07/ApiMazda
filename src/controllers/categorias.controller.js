import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getSubcategoriasByCategoria,
  getSubcategoriaById,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
} from "../models/categorias.model.js";
import { success, error } from "../utils/response.js";

// ============================================
// CONTROLADORES DE CATEGORÍAS
// ============================================

// Obtener todas las categorías
export const obtenerCategorias = async (req, res) => {
  try {
    const data = await getAllCategorias();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener categoría por ID
export const obtenerCategoria = async (req, res) => {
  try {
    const data = await getCategoriaById(req.params.id);
    if (!data) return error(res, { message: "Categoría no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear nueva categoría
export const crearCategoria = async (req, res) => {
  try {
    const nueva = await createCategoria(req.body);
    success(res, nueva, "Categoría creada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const data = await updateCategoria(req.params.id, req.body);
    success(res, data, "Categoría actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    await deleteCategoria(req.params.id);
    success(res, null, "Categoría eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// ============================================
// CONTROLADORES DE SUBCATEGORÍAS
// ============================================

// Obtener subcategorías por categoría
export const obtenerSubcategorias = async (req, res) => {
  try {
    const data = await getSubcategoriasByCategoria(req.params.categoria_id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener subcategoría por ID
export const obtenerSubcategoria = async (req, res) => {
  try {
    const data = await getSubcategoriaById(req.params.id);
    if (!data) return error(res, { message: "Subcategoría no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear nueva subcategoría
export const crearSubcategoria = async (req, res) => {
  try {
    const nueva = await createSubcategoria(req.body);
    success(res, nueva, "Subcategoría creada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar subcategoría
export const actualizarSubcategoria = async (req, res) => {
  try {
    const data = await updateSubcategoria(req.params.id, req.body);
    success(res, data, "Subcategoría actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar subcategoría
export const eliminarSubcategoria = async (req, res) => {
  try {
    await deleteSubcategoria(req.params.id);
    success(res, null, "Subcategoría eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
