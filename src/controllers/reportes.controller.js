import {
  getReporteDiarioVentasGastos,
  actualizarReporteDiario,
  getAllReportes,
  getReporteById,
  getReporteByFecha,
  getVistaReporteDiario,
  deleteReporte,
} from "../models/reportes.model.js";
import { success, error } from "../utils/response.js";

// Reporte diario de ventas vs gastos
export const obtenerReporteDiario = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return error(res, { message: "Se requieren fecha_inicio y fecha_fin" }, 400);
    }
    const data = await getReporteDiarioVentasGastos(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Actualizar o crear reporte diario
export const actualizarReporte = async (req, res) => {
  try {
    const { fecha, usuario_registro } = req.body;
    if (!fecha) {
      return error(res, { message: "Se requiere el parámetro fecha" }, 400);
    }
    const data = await actualizarReporteDiario(fecha, usuario_registro);
    success(res, data, "Reporte actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Obtener todos los reportes almacenados
export const obtenerReportes = async (req, res) => {
  try {
    const filters = {
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
    };
    const data = await getAllReportes(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener reporte por ID
export const obtenerReporte = async (req, res) => {
  try {
    const data = await getReporteById(req.params.id);
    if (!data) return error(res, { message: "Reporte no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener reporte por fecha
export const obtenerReportePorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const data = await getReporteByFecha(fecha);
    if (!data) return error(res, { message: "Reporte no encontrado para esta fecha" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener vista de reporte diario
export const obtenerVistaReporteDiario = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const data = await getVistaReporteDiario(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Eliminar reporte
export const eliminarReporte = async (req, res) => {
  try {
    await deleteReporte(req.params.id);
    success(res, null, "Reporte eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};
