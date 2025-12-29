import { supabase } from "../config/db.js";

// ============================================
// REPORTES - VENTAS Y GASTOS
// ============================================

// Reporte diario de ventas vs gastos
export const getReporteDiarioVentasGastos = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("reporte_diario_ventas_gastos", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data;
};

// Actualizar o crear reporte diario
export const actualizarReporteDiario = async (fecha, usuario_registro = null) => {
  const { data, error } = await supabase.rpc("actualizar_reporte_diario", {
    p_fecha: fecha,
    p_usuario_registro: usuario_registro,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Obtener todos los reportes almacenados
export const getAllReportes = async (filters = {}) => {
  let query = supabase
    .from("reporte_ventas_gastos")
    .select(`
      *,
      usuario:usuarios!reporte_ventas_gastos_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("activo", true)
    .order("fecha", { ascending: false });

  if (filters.fecha_inicio) query = query.gte("fecha", filters.fecha_inicio);
  if (filters.fecha_fin) query = query.lte("fecha", filters.fecha_fin);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Obtener reporte por ID
export const getReporteById = async (id) => {
  const { data, error } = await supabase
    .from("reporte_ventas_gastos")
    .select(`
      *,
      usuario:usuarios!reporte_ventas_gastos_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("id_reporte", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Obtener reporte por fecha
export const getReporteByFecha = async (fecha) => {
  const { data, error } = await supabase
    .from("reporte_ventas_gastos")
    .select(`
      *,
      usuario:usuarios!reporte_ventas_gastos_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("fecha", fecha)
    .eq("activo", true)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Obtener vista de reporte diario
export const getVistaReporteDiario = async (fecha_inicio, fecha_fin) => {
  let query = supabase
    .from("vista_reporte_diario")
    .select("*")
    .order("fecha", { ascending: false });

  if (fecha_inicio) query = query.gte("fecha", fecha_inicio);
  if (fecha_fin) query = query.lte("fecha", fecha_fin);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Eliminar reporte (soft delete)
export const deleteReporte = async (id) => {
  const { data, error } = await supabase
    .from("reporte_ventas_gastos")
    .update({ activo: false })
    .eq("id_reporte", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
