import {
  getAllEntradas,
  getEntradaById,
  getEntradasByProveedor,
  getEntradasByCB,
  getEntradasByFecha,
  createEntrada,
  updateEntrada,
  deleteEntrada,
} from "../models/entrada.model.js";
import { success, error } from "../utils/response.js";

// Obtener todas las entradas con filtros opcionales
export const obtenerEntradas = async (req, res) => {
  try {
    const { proveedor, cb, fecha } = req.query;

    // Filtrar por proveedor
    if (proveedor) {
      const data = await getEntradasByProveedor(proveedor);
      return success(res, data);
    }

    // Filtrar por CB
    if (cb) {
      const data = await getEntradasByCB(cb);
      return success(res, data);
    }

    // Filtrar por fecha
    if (fecha) {
      const data = await getEntradasByFecha(fecha);
      return success(res, data);
    }

    // Obtener todas si no hay filtros
    const data = await getAllEntradas();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener una entrada por ID
export const obtenerEntrada = async (req, res) => {
  try {
    const data = await getEntradaById(req.params.id);
    if (!data) return error(res, { message: "Entrada no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear una nueva entrada
export const crearEntrada = async (req, res) => {
  try {
    const nueva = await createEntrada(req.body);
    success(res, nueva, "Entrada creada correctamente");
  } catch (err) {
    // Error de clave duplicada
    if (err.code === "23505") {
      return error(
        res,
        { message: "Ya existe una entrada con este identificador" },
        400
      );
    }
    error(res, err);
  }
};

// Actualizar una entrada
export const actualizarEntrada = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la entrada existe
    const entradaExistente = await getEntradaById(id);
    if (!entradaExistente) {
      return error(res, { message: "Entrada no encontrada" }, 404);
    }

    await updateEntrada(id, req.body);
    success(res, null, "Entrada actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar una entrada
export const eliminarEntrada = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la entrada existe
    const entradaExistente = await getEntradaById(id);
    if (!entradaExistente) {
      return error(res, { message: "Entrada no encontrada" }, 404);
    }

    await deleteEntrada(id);
    success(res, null, "Entrada eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
