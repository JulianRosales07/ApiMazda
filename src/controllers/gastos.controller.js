import {
  getAllGastos,
  getGastoById,
  registrarGasto,
  updateGasto,
  deleteGasto,
  getGastosPorCategoria,
  getGastosPorMetodoPago,
} from "../models/gastos.model.js";
import { success, error } from "../utils/response.js";

// Obtener todos los gastos
export const obtenerGastos = async (req, res) => {
  try {
    const filters = {
      id_categoria: req.query.id_categoria,
      id_subcategoria: req.query.id_subcategoria,
      metodo_pago: req.query.metodo_pago,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      usuario_registro: req.query.usuario_registro,
    };
    const data = await getAllGastos(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener gasto por ID
export const obtenerGasto = async (req, res) => {
  try {
    const data = await getGastoById(req.params.id);
    if (!data) return error(res, { message: "Gasto no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Registrar nuevo gasto
export const crearGasto = async (req, res) => {
  try {
    const resultado = await registrarGasto(req.body);
    success(res, resultado, "Gasto registrado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar gasto
export const actualizarGasto = async (req, res) => {
  try {
    const data = await updateGasto(req.params.id, req.body);
    success(res, data, "Gasto actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar gasto
export const eliminarGasto = async (req, res) => {
  try {
    await deleteGasto(req.params.id);
    success(res, null, "Gasto eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Reporte de gastos por categoría
export const reporteGastosCategoria = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return error(res, { message: "Se requieren fecha_inicio y fecha_fin" }, 400);
    }
    const data = await getGastosPorCategoria(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Reporte de gastos por método de pago
export const reporteGastosMetodoPago = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return error(res, { message: "Se requieren fecha_inicio y fecha_fin" }, 400);
    }
    const data = await getGastosPorMetodoPago(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};
