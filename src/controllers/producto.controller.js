import {
  getAllRepuestos,
  getRepuestoByCB,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
  searchRepuestos,
  getMaxCodes,
} from "../models/producto.model.js";
import { success, error } from "../utils/response.js";

export const obtenerRepuestos = async (req, res) => {
  try {
    const data = await getAllRepuestos();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const buscarRepuestos = async (req, res) => {
  try {
    const searchParams = req.body;
    const data = await searchRepuestos(searchParams);
    success(res, data, `Se encontraron ${data.length} resultados`);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerRepuesto = async (req, res) => {
  try {
    const data = await getRepuestoByCB(req.params.cb);
    if (!data) return error(res, { message: "Repuesto no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const crearRepuesto = async (req, res) => {
  try {
    const nuevo = await createRepuesto(req.body);
    success(res, nuevo, "Repuesto creado correctamente");
  } catch (err) {
    // Error de clave duplicada (PostgreSQL 23505)
    if (err.code === "23505") {
      const detail = (err.details || err.detail || err.message || "").toLowerCase();
      let message = "Ya existe un registro con estos datos únicos";

      if (detail.includes("cb") || detail.includes("pkey")) {
        message = "El código de barras (CB) ya existe en el sistema (puede estar inactivo o eliminado)";
      } else if (detail.includes("ci")) {
        message = "El código interno (CI) ya existe en el sistema";
      } else if (err.details || err.detail) {
        message = `Registro duplicado: ${err.details || err.detail}`;
      }

      return error(
        res,
        { message, details: err.details || err.detail },
        400
      );
    }
    error(res, err);
  }
};

export const actualizarRepuesto = async (req, res) => {
  try {
    await updateRepuesto(req.params.cb, req.body);
    success(res, null, "Repuesto actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const eliminarRepuesto = async (req, res) => {
  try {
    await deleteRepuesto(req.params.cb);
    success(res, null, "Repuesto eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const obtenerMaxCodes = async (req, res) => {
  try {
    const data = await getMaxCodes();
    success(res, {
      maxCI: data.max_ci,
      maxCB: data.max_cb
    }, "Operación exitosa");
  } catch (err) {
    error(res, err);
  }
};
