import {
  getAllSalidas,
  getSalidaById,
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

// Obtener una salida por ID o n_factura (compatibilidad)
export const obtenerSalida = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Intentar primero por ID numérico
    let data = await getSalidaById(id);
    
    // Si no se encuentra por ID, intentar por n_factura (compatibilidad)
    if (!data) {
      const salidas = await getSalidaByFactura(id);
      data = salidas && salidas.length > 0 ? salidas[0] : null;
    }
    
    if (!data) return error(res, { message: "Salida no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener salidas por número de factura
export const obtenerSalidasPorFactura = async (req, res) => {
  try {
    const data = await getSalidaByFactura(req.params.n_factura);
    if (!data || data.length === 0) {
      return error(res, { message: "No se encontraron salidas con ese número de factura" }, 404);
    }
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

// Actualizar una salida por ID o n_factura (compatibilidad)
export const actualizarSalida = async (req, res) => {
  try {
    const { id } = req.params;

    // Intentar primero por ID
    let salidaExistente = await getSalidaById(id);
    
    // Si no se encuentra por ID, intentar por n_factura
    if (!salidaExistente) {
      const salidas = await getSalidaByFactura(id);
      salidaExistente = salidas && salidas.length > 0 ? salidas[0] : null;
    }
    
    if (!salidaExistente) {
      return error(res, { message: "Salida no encontrada" }, 404);
    }

    // Actualizar usando el ID real del registro encontrado
    await updateSalida(salidaExistente.id, req.body);
    success(res, null, "Salida actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar una salida por ID o n_factura (compatibilidad)
export const eliminarSalida = async (req, res) => {
  try {
    const { id } = req.params;

    // Intentar primero por ID
    let salidaExistente = await getSalidaById(id);
    
    // Si no se encuentra por ID, intentar por n_factura
    if (!salidaExistente) {
      const salidas = await getSalidaByFactura(id);
      salidaExistente = salidas && salidas.length > 0 ? salidas[0] : null;
    }
    
    if (!salidaExistente) {
      return error(res, { message: "Salida no encontrada" }, 404);
    }

    // Eliminar usando el ID real del registro encontrado
    await deleteSalida(salidaExistente.id);
    success(res, null, "Salida eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
