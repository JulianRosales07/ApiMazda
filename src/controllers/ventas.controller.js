import {
  getAllVentas,
  getVentaById,
  registrarVenta,
  updateVenta,
  deleteVenta,
  getVentasPorPeriodo,
  getVentasPorMetodoPago,
} from "../models/ventas.model.js";
import { success, error } from "../utils/response.js";

// Obtener todas las ventas
export const obtenerVentas = async (req, res) => {
  try {
    const filters = {
      venta_por: req.query.venta_por,
      metodo_pago: req.query.metodo_pago,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      usuario_registro: req.query.usuario_registro,
    };
    const data = await getAllVentas(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener venta por ID
export const obtenerVenta = async (req, res) => {
  try {
    const data = await getVentaById(req.params.id);
    if (!data) return error(res, { message: "Venta no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Registrar nueva venta
export const crearVenta = async (req, res) => {
  try {
    const resultado = await registrarVenta(req.body);
    success(res, resultado, "Venta registrada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar venta
export const actualizarVenta = async (req, res) => {
  try {
    const data = await updateVenta(req.params.id, req.body);
    success(res, data, "Venta actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar venta
export const eliminarVenta = async (req, res) => {
  try {
    await deleteVenta(req.params.id);
    success(res, null, "Venta eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Reporte de ventas por período
export const reporteVentasPeriodo = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return error(res, { message: "Se requieren fecha_inicio y fecha_fin" }, 400);
    }
    const data = await getVentasPorPeriodo(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Reporte de ventas por método de pago
export const reporteVentasMetodoPago = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return error(res, { message: "Se requieren fecha_inicio y fecha_fin" }, 400);
    }
    const data = await getVentasPorMetodoPago(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};
