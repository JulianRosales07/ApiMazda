import {
  getAllCajas,
  getCajaById,
  getCajaAbierta,
  createCaja,
  cerrarCaja,
  updateCaja,
  calcularTotalesCaja,
  getAllVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  getAllGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  getAllCategorias,
  getSubcategoriasByCategoria,
  getReporteDiario,
  getReporteMensual,
  getVentasPorMetodoPago,
  getGastosPorCategoria,
} from "../models/caja.model.js";
import { success, error } from "../utils/response.js";

// ============================================
// CONTROLADORES DE CAJAS
// ============================================

export const obtenerCajas = async (req, res) => {
  try {
    const filters = {
      usuario_id: req.query.usuario_id,
      estado: req.query.estado,
      jornada: req.query.jornada,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
    };
    const data = await getAllCajas(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerCaja = async (req, res) => {
  try {
    const data = await getCajaById(req.params.id);
    if (!data) return error(res, { message: "Caja no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerCajaAbiertaUsuario = async (req, res) => {
  try {
    const data = await getCajaAbierta(req.params.usuario_id);
    if (!data) {
      return success(res, null, "No hay caja abierta para este usuario");
    }
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const abrirCaja = async (req, res) => {
  try {
    // Verificar si ya tiene una caja abierta
    const cajaAbierta = await getCajaAbierta(req.body.usuario_id);
    if (cajaAbierta) {
      return error(
        res,
        { message: "Ya tienes una caja abierta. Debes cerrarla primero." },
        400
      );
    }

    const nueva = await createCaja(req.body);
    success(res, nueva, "Caja abierta correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const cerrarCajaController = async (req, res) => {
  try {
    const { monto_final, notas_cierre } = req.body;
    const resultado = await cerrarCaja(
      req.params.id,
      monto_final,
      notas_cierre
    );

    if (!resultado) {
      return error(res, { message: "No se pudo cerrar la caja" }, 400);
    }

    // Obtener la caja actualizada
    const cajaActualizada = await getCajaById(req.params.id);
    success(res, cajaActualizada, "Caja cerrada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const actualizarCaja = async (req, res) => {
  try {
    const data = await updateCaja(req.params.id, req.body);
    success(res, data, "Caja actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const obtenerTotalesCaja = async (req, res) => {
  try {
    const data = await calcularTotalesCaja(req.params.id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// ============================================
// CONTROLADORES DE VENTAS
// ============================================

export const obtenerVentas = async (req, res) => {
  try {
    const filters = {
      caja_id: req.query.caja_id,
      metodo_pago: req.query.metodo_pago,
      venta_por: req.query.venta_por,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
    };
    const data = await getAllVentas(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerVenta = async (req, res) => {
  try {
    const data = await getVentaById(req.params.id);
    if (!data) return error(res, { message: "Venta no encontrada" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const crearVenta = async (req, res) => {
  try {
    const nueva = await createVenta(req.body);
    success(res, nueva, "Venta registrada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const actualizarVenta = async (req, res) => {
  try {
    const data = await updateVenta(req.params.id, req.body);
    success(res, data, "Venta actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const eliminarVenta = async (req, res) => {
  try {
    await deleteVenta(req.params.id);
    success(res, null, "Venta eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// ============================================
// CONTROLADORES DE GASTOS
// ============================================

export const obtenerGastos = async (req, res) => {
  try {
    const filters = {
      caja_id: req.query.caja_id,
      categoria_id: req.query.categoria_id,
      subcategoria_id: req.query.subcategoria_id,
      metodo_pago: req.query.metodo_pago,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin,
    };
    const data = await getAllGastos(filters);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerGasto = async (req, res) => {
  try {
    const data = await getGastoById(req.params.id);
    if (!data) return error(res, { message: "Gasto no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const crearGasto = async (req, res) => {
  try {
    const nuevo = await createGasto(req.body);
    success(res, nuevo, "Gasto registrado correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const actualizarGasto = async (req, res) => {
  try {
    const data = await updateGasto(req.params.id, req.body);
    success(res, data, "Gasto actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const eliminarGasto = async (req, res) => {
  try {
    await deleteGasto(req.params.id);
    success(res, null, "Gasto eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// ============================================
// CONTROLADORES DE CATEGORÍAS
// ============================================

export const obtenerCategorias = async (req, res) => {
  try {
    const data = await getAllCategorias();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerSubcategorias = async (req, res) => {
  try {
    const data = await getSubcategoriasByCategoria(req.params.categoria_id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// ============================================
// CONTROLADORES DE REPORTES
// ============================================

export const obtenerReporteDiarioController = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const data = await getReporteDiario(fecha_inicio, fecha_fin);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerReporteMensualController = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const data = await getReporteMensual(
      anio ? parseInt(anio) : null,
      mes ? parseInt(mes) : null
    );
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerResumenVentasPorMetodo = async (req, res) => {
  try {
    const data = await getVentasPorMetodoPago(req.params.caja_id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

export const obtenerResumenGastosPorCategoria = async (req, res) => {
  try {
    const data = await getGastosPorCategoria(req.params.caja_id);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};
