import * as HistorialPreciosModel from "../models/historialPrecios.model.js";

// Obtener historial con filtros
export const getHistorial = async (req, res) => {
  try {
    const { producto_cb, proveedor_id, fecha_desde, fecha_hasta, limit } = req.query;

    const filters = {};
    if (producto_cb) filters.producto_cb = producto_cb;
    if (proveedor_id) filters.proveedor_id = parseInt(proveedor_id);
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    if (limit) filters.limit = parseInt(limit);

    const historial = await HistorialPreciosModel.getHistorialPrecios(filters);

    res.status(200).json({
      success: true,
      count: historial.length,
      data: historial,
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial de precios",
      error: error.message,
    });
  }
};

// Obtener historial por producto
export const getHistorialByProducto = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const { limit } = req.query;

    const historial = await HistorialPreciosModel.getHistorialByProducto(
      producto_cb,
      limit ? parseInt(limit) : 50
    );

    res.status(200).json({
      success: true,
      producto_cb,
      count: historial.length,
      data: historial,
    });
  } catch (error) {
    console.error("Error al obtener historial por producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial del producto",
      error: error.message,
    });
  }
};

// Obtener historial por proveedor
export const getHistorialByProveedor = async (req, res) => {
  try {
    const { proveedor_id } = req.params;
    const { limit } = req.query;

    const historial = await HistorialPreciosModel.getHistorialByProveedor(
      parseInt(proveedor_id),
      limit ? parseInt(limit) : 50
    );

    res.status(200).json({
      success: true,
      proveedor_id: parseInt(proveedor_id),
      count: historial.length,
      data: historial,
    });
  } catch (error) {
    console.error("Error al obtener historial por proveedor:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial del proveedor",
      error: error.message,
    });
  }
};

// Obtener historial de producto-proveedor específico
export const getHistorialProductoProveedor = async (req, res) => {
  try {
    const { producto_cb, proveedor_id } = req.params;

    const historial = await HistorialPreciosModel.getHistorialProductoProveedor(
      producto_cb,
      parseInt(proveedor_id)
    );

    res.status(200).json({
      success: true,
      producto_cb,
      proveedor_id: parseInt(proveedor_id),
      count: historial.length,
      data: historial,
    });
  } catch (error) {
    console.error("Error al obtener historial producto-proveedor:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial",
      error: error.message,
    });
  }
};

// Crear registro manual de historial
export const createHistorial = async (req, res) => {
  try {
    const {
      producto_cb,
      proveedor_id,
      precio_anterior,
      precio_nuevo,
      motivo_cambio,
    } = req.body;

    // Validaciones
    if (!producto_cb || !proveedor_id || precio_nuevo === undefined) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: producto_cb, proveedor_id, precio_nuevo",
      });
    }

    const historial = await HistorialPreciosModel.createHistorialPrecio({
      producto_cb,
      proveedor_id: parseInt(proveedor_id),
      precio_anterior: precio_anterior ? parseFloat(precio_anterior) : null,
      precio_nuevo: parseFloat(precio_nuevo),
      usuario_modificacion: req.user?.username || "sistema",
      motivo_cambio: motivo_cambio || "Registro manual",
    });

    res.status(201).json({
      success: true,
      message: "Historial de precio creado exitosamente",
      data: historial,
    });
  } catch (error) {
    console.error("Error al crear historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el historial de precio",
      error: error.message,
    });
  }
};

// Actualizar registro de historial
export const updateHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cambio, usuario_modificacion } = req.body;

    if (!motivo_cambio && !usuario_modificacion) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    const historial = await HistorialPreciosModel.updateHistorialPrecio(
      parseInt(id),
      {
        motivo_cambio,
        usuario_modificacion,
      }
    );

    res.status(200).json({
      success: true,
      message: "Historial actualizado exitosamente",
      data: historial,
    });
  } catch (error) {
    console.error("Error al actualizar historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el historial",
      error: error.message,
    });
  }
};

// Eliminar registro de historial
export const deleteHistorial = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await HistorialPreciosModel.deleteHistorialPrecio(parseInt(id));

    res.status(200).json({
      success: true,
      message: "Historial eliminado exitosamente",
      data: historial,
    });
  } catch (error) {
    console.error("Error al eliminar historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el historial",
      error: error.message,
    });
  }
};

// Obtener estadísticas de precios
export const getEstadisticas = async (req, res) => {
  try {
    const { producto_cb, proveedor_id } = req.params;

    const estadisticas = await HistorialPreciosModel.getEstadisticasPrecios(
      producto_cb,
      parseInt(proveedor_id)
    );

    res.status(200).json({
      success: true,
      producto_cb,
      proveedor_id: parseInt(proveedor_id),
      data: estadisticas,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de precios",
      error: error.message,
    });
  }
};

// Comparar precios entre proveedores
export const compararProveedores = async (req, res) => {
  try {
    const { producto_cb } = req.params;
    const { fecha_desde, fecha_hasta } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({
        success: false,
        message: "Se requieren fecha_desde y fecha_hasta",
      });
    }

    const comparacion = await HistorialPreciosModel.compararPreciosProveedores(
      producto_cb,
      fecha_desde,
      fecha_hasta
    );

    res.status(200).json({
      success: true,
      producto_cb,
      periodo: { desde: fecha_desde, hasta: fecha_hasta },
      count: comparacion.length,
      data: comparacion,
    });
  } catch (error) {
    console.error("Error al comparar proveedores:", error);
    res.status(500).json({
      success: false,
      message: "Error al comparar precios de proveedores",
      error: error.message,
    });
  }
};
