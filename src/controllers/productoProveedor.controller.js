import {
  getAllProductoProveedor,
  getProveedoresByProducto,
  getProductosByProveedor,
  getProveedorMasBarato,
  getComparativaProveedores,
  createProductoProveedor,
  updateProductoProveedor,
  setProveedorPrincipal,
  deleteProductoProveedor,
  hardDeleteProductoProveedorByProducto,
  getProductoProveedorById,
} from "../models/productoProveedor.model.js";
import { success, error } from "../utils/response.js";

// Obtener todas las relaciones producto-proveedor
export const obtenerProductoProveedor = async (req, res) => {
  try {
    const data = await getAllProductoProveedor();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener proveedores de un producto
export const obtenerProveedoresDeProducto = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const data = await getProveedoresByProducto(producto_cb);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener productos de un proveedor
export const obtenerProductosDeProveedor = async (req, res) => {
  try {
    const { proveedor_id } = req.params;
    const data = await getProductosByProveedor(proveedor_id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener el proveedor más barato de un producto
export const obtenerProveedorMasBarato = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const data = await getProveedorMasBarato(producto_cb);
    if (!data) {
      return error(
        res,
        { message: "No se encontraron proveedores para este producto" },
        404
      );
    }
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener comparativa de proveedores por producto
export const obtenerComparativa = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const data = await getComparativaProveedores(producto_cb);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear relación producto-proveedor
export const crearProductoProveedor = async (req, res) => {
  try {
    const { producto_cb, proveedor_id, precio_proveedor } = req.body;

    // Validar campos requeridos
    if (!producto_cb || !proveedor_id || !precio_proveedor) {
      return error(
        res,
        {
          message:
            "producto_cb, proveedor_id y precio_proveedor son requeridos",
        },
        400
      );
    }

    const nuevo = await createProductoProveedor(req.body);
    success(res, nuevo, "Relación producto-proveedor creada correctamente");
  } catch (err) {
    // Error de duplicado (constraint unique)
    if (err.code === "ER_DUP_ENTRY") {
      return error(
        res,
        { message: "Esta relación producto-proveedor ya existe" },
        400
      );
    }
    error(res, err);
  }
};

// Actualizar relación producto-proveedor
export const actualizarProductoProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const existente = await getProductoProveedorById(id);
    if (!existente) {
      return error(
        res,
        { message: "Relación producto-proveedor no encontrada" },
        404
      );
    }

    await updateProductoProveedor(id, req.body);
    success(res, null, "Relación producto-proveedor actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Establecer proveedor principal
export const establecerProveedorPrincipal = async (req, res) => {
  try {
    const { producto_cb, proveedor_id } = req.body;

    if (!producto_cb || !proveedor_id) {
      return error(
        res,
        { message: "producto_cb y proveedor_id son requeridos" },
        400
      );
    }

    await setProveedorPrincipal(producto_cb, proveedor_id);
    success(res, null, "Proveedor principal establecido correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Desactivar relación producto-proveedor
export const eliminarProductoProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const existente = await getProductoProveedorById(id);
    if (!existente) {
      return error(
        res,
        { message: "Relación producto-proveedor no encontrada" },
        404
      );
    }

    await deleteProductoProveedor(id);
    success(res, null, "Relación producto-proveedor desactivada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar permanentemente todas las relaciones de un producto
export const eliminarRelacionesProducto = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const deleted = await hardDeleteProductoProveedorByProducto(producto_cb);
    success(res, deleted, `${deleted?.length || 0} relaciones eliminadas permanentemente`);
  } catch (err) {
    error(res, err);
  }
};
