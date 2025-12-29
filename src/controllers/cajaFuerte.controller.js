import {
  getSaldoCajaFuerte,
  getAllMovimientosCajaFuerte,
  getMovimientoCajaFuerteById,
  registrarMovimientoCajaFuerte,
  updateMovimientoCajaFuerte,
  deleteMovimientoCajaFuerte,
  getHistorialSaldos,
  getFlujoCajaDiario,
} from "../models/cajaFuerte.model.js";
import { success, error } from "../utils/response.js";

// Obtener saldo actual de caja fuerte
export const obtenerSaldoCajaFuerte = async (req, res) => {
  try {
    const saldo = await getSaldoCajaFuerte();
    success(res, { saldo });
  } catch (err) {
    error(res, err);
  }
};

// Obtener todos los movimientos
export const obtenerMovimientosCajaFuerte = async (req, res) => {
  try {
    const filters = {
      tipo_movimiento: req.query.tipo_movimiento,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
      usuario_registro: req.query.usuario_registro,
      caja_id: req.query.caja_id,
    };
    const data = await getAllMovimientosCajaFuerte(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener movimiento por ID
export const obtenerMovimientoCajaFuerte = async (req, res) => {
  try {
    const data = await getMovimientoCajaFuerteById(req.params.id);
    if (!data) return error(res, { message: "Movimiento no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Registrar nuevo movimiento
export const crearMovimientoCajaFuerte = async (req, res) => {
  try {
    const resultado = await registrarMovimientoCajaFuerte(req.body);
    success(res, resultado, "Movimiento registrado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar movimiento
export const actualizarMovimientoCajaFuerte = async (req, res) => {
  try {
    const data = await updateMovimientoCajaFuerte(req.params.id, req.body);
    success(res, data, "Movimiento actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar movimiento
export const eliminarMovimientoCajaFuerte = async (req, res) => {
  try {
    await deleteMovimientoCajaFuerte(req.params.id);
    success(res, null, "Movimiento eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Obtener historial de saldos
export const obtenerHistorialSaldos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const data = await getHistorialSaldos(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Flujo de caja diario
export const obtenerFlujoCajaDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return error(res, { message: "Se requiere el parámetro fecha" }, 400);
    }
    const data = await getFlujoCajaDiario(fecha);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};
