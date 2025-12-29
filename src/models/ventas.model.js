import { supabase } from "../config/db.js";

// ============================================
// VENTAS - TABLA INDEPENDIENTE
// ============================================

// Obtener todas las ventas
export const getAllVentas = async (filters = {}) => {
  let query = supabase
    .from("ventas")
    .select(`
      *,
      usuario:usuarios!ventas_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("activo", true)
    .order("fecha", { ascending: false });

  if (filters.venta_por) query = query.eq("venta_por", filters.venta_por);
  if (filters.metodo_pago) query = query.eq("metodo_pago", filters.metodo_pago);
  if (filters.fecha_inicio) query = query.gte("fecha", filters.fecha_inicio);
  if (filters.fecha_fin) query = query.lte("fecha", filters.fecha_fin);
  if (filters.usuario_registro) query = query.eq("usuario_registro", filters.usuario_registro);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Obtener venta por ID
export const getVentaById = async (id) => {
  const { data, error } = await supabase
    .from("ventas")
    .select(`
      *,
      usuario:usuarios!ventas_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("id_venta", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Registrar nueva venta usando función de PostgreSQL
export const registrarVenta = async (ventaData) => {
  const {
    factura_descripcion,
    venta_por,
    valor,
    metodo_pago,
    usuario_registro,
    observaciones,
  } = ventaData;

  const { data, error } = await supabase.rpc("registrar_venta", {
    p_factura_descripcion: factura_descripcion,
    p_venta_por: venta_por,
    p_valor: valor,
    p_metodo_pago: metodo_pago,
    p_usuario_registro: usuario_registro,
    p_observaciones: observaciones || null,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Actualizar venta
export const updateVenta = async (id, ventaData) => {
  const { data, error } = await supabase
    .from("ventas")
    .update(ventaData)
    .eq("id_venta", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar venta (soft delete)
export const deleteVenta = async (id) => {
  const { data, error } = await supabase
    .from("ventas")
    .update({ activo: false })
    .eq("id_venta", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Obtener ventas por período
export const getVentasPorPeriodo = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("reporte_ventas_periodo", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Obtener ventas por método de pago
export const getVentasPorMetodoPago = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("reporte_ventas_metodo_pago", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data;
};
