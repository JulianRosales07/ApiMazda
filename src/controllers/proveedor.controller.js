import {
  getAllProveedores,
  getProveedorById,
  getProveedorByCP,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  activarProveedor,
} from "../models/proveedor.model.js";
import { success, error } from "../utils/response.js";

// Obtener todos los proveedores
export const obtenerProveedores = async (req, res) => {
  try {
    const data = await getAllProveedores();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener un proveedor por ID
export const obtenerProveedor = async (req, res) => {
  try {
    const data = await getProveedorById(req.params.id);
    if (!data) return error(res, { message: "Proveedor no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear un nuevo proveedor
export const crearProveedor = async (req, res) => {
  try {
    const { cp, nombre_proveedor } = req.body;

    // Validar campos requeridos
    if (!cp || !nombre_proveedor) {
      return error(
        res,
        { message: "CP y nombre_proveedor son requeridos" },
        400
      );
    }

    // Verificar si el CP ya existe
    const proveedorExistente = await getProveedorByCP(cp);
    if (proveedorExistente) {
      return error(res, { message: "El código de proveedor (CP) ya existe" }, 400);
    }

    const nuevo = await createProveedor(req.body);
    success(res, nuevo, "Proveedor creado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar un proveedor
export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proveedor existe
    const proveedorExistente = await getProveedorById(id);
    if (!proveedorExistente) {
      return error(res, { message: "Proveedor no encontrado" }, 404);
    }

    // Si se está cambiando el CP, verificar que no esté en uso
    if (req.body.cp && req.body.cp !== proveedorExistente.cp) {
      const cpEnUso = await getProveedorByCP(req.body.cp);
      if (cpEnUso) {
        return error(res, { message: "El código de proveedor (CP) ya existe" }, 400);
      }
    }

    await updateProveedor(id, req.body);
    success(res, null, "Proveedor actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Desactivar un proveedor
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proveedor existe
    const proveedorExistente = await getProveedorById(id);
    if (!proveedorExistente) {
      return error(res, { message: "Proveedor no encontrado" }, 404);
    }

    await deleteProveedor(id);
    success(res, null, "Proveedor desactivado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Activar un proveedor
export const activarProveedorController = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proveedor existe
    const proveedorExistente = await getProveedorById(id);
    if (!proveedorExistente) {
      return error(res, { message: "Proveedor no encontrado" }, 404);
    }

    await activarProveedor(id);
    success(res, null, "Proveedor activado correctamente");
  } catch (err) {
    error(res, err);
  }
};
