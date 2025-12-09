import {
  getAllSalidas,
  getSalidaByFactura,
  getSalidasByCB,
  getSalidasByFecha,
  createSalida,
  updateSalida,
  deleteSalida,
} from "../models/salida.model.js";
import { success, error } from "../utils/response.js";

// Obtener todas las salidas
export const obtenerSalidas = async (req, res) => {
  try {
    const { cb, fecha } = req.query;

    // Filtrar por CB si se proporciona
    if (cb) {
      const data = await getSalidasByCB(cb);
      return success(res, data);
    }

    // Filtrar por fecha si se proporciona
    if (fecha) {
      const data = await getSalidasByFecha(fecha);
      return success(res, data);
    }

    // Obtener todas si no hay filtros
    const data = await getAllSalidas();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener una salida por número de factura
export const obtenerSalida = async (req, res) => {
  try {
    const data = await getSalidaByFactura(req.params.n_factura);
    if (!data) return error(res, { message: "Salida no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear una nueva salida
export const crearSalida = async (req, res) => {
  try {
    const nueva = await createSalida(req.body);
    success(res, nueva, "Salida creada correctamente");
  } catch (err) {
    // Error de clave duplicada
    if (err.code === "23505") {
      return error(
        res,
        { message: "Ya existe una salida con este número de factura" },
        400
      );
    }
    error(res, err);
  }
};

// Actualizar una salida
export const actualizarSalida = async (req, res) => {
  try {
    const { n_factura } = req.params;

    // Verificar si la salida existe
    const salidaExistente = await getSalidaByFactura(n_factura);
    if (!salidaExistente) {
      return error(res, { message: "Salida no encontrada" }, 404);
    }

    await updateSalida(n_factura, req.body);
    success(res, null, "Salida actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar una salida
export const eliminarSalida = async (req, res) => {
  try {
    const { n_factura } = req.params;

    // Verificar si la salida existe
    const salidaExistente = await getSalidaByFactura(n_factura);
    if (!salidaExistente) {
      return error(res, { message: "Salida no encontrada" }, 404);
    }

    await deleteSalida(n_factura);
    success(res, null, "Salida eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
