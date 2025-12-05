import {
  getAllRepuestos,
  getRepuestoByCB,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
  searchRepuestos,
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
