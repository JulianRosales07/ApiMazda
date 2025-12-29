import { supabase } from "../config/db.js";

// ============================================
// CAJA FUERTE - MOVIMIENTOS
// ============================================

// Obtener saldo actual de caja fuerte
export const getSaldoCajaFuerte = async () => {
  const { data, error } = await supabase.rpc("obtener_saldo_caja_fuerte");
  if (error) throw error;
  return data;
};

// Obtener todos los movimientos de caja fuerte
export const getAllMovimientosCajaFuerte = async (filters = {}) => {
  let query = supabase
    .from("caja_fuerte")
    .select(`
      *,
      usuario:usuarios!caja_fuerte_usuario_registro_fkey(id_usuario, nombre, email),
      caja:cajas(id_caja, jornada, fecha_apertura)
    `)
    .eq("activo", true)
    .order("fecha", { ascending: false });

  if (filters.tipo_movimiento) query = query.eq("tipo_movimiento", filters.tipo_movimiento);
  if (filters.fecha_inicio) query = query.gte("fecha", filters.fecha_inicio);
  if (filters.fecha_fin) query = query.lte("fecha", filters.fecha_fin);
  if (filters.usuario_registro) query = query.eq("usuario_registro", filters.usuario_registro);
  if (filters.caja_id) query = query.eq("caja_id", filters.caja_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Obtener movimiento por ID
export const getMovimientoCajaFuerteById = async (id) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .select(`
      *,
      usuario:usuarios!caja_fuerte_usuario_registro_fkey(id_usuario, nombre, email),
      caja:cajas(id_caja, jornada, fecha_apertura)
    `)
    .eq("id_movimiento", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Registrar movimiento en caja fuerte usando función de PostgreSQL
export const registrarMovimientoCajaFuerte = async (movimientoData) => {
  const {
    tipo_movimiento,
    monto,
    descripcion,
    usuario_registro,
    caja_id,
    observaciones,
  } = movimientoData;

  const { data, error } = await supabase.rpc("registrar_movimiento_caja_fuerte", {
    p_tipo_movimiento: tipo_movimiento,
    p_monto: monto,
    p_descripcion: descripcion,
    p_usuario_registro: usuario_registro,
    p_caja_id: caja_id || null,
    p_observaciones: observaciones || null,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Actualizar movimiento de caja fuerte
export const updateMovimientoCajaFuerte = async (id, movimientoData) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .update(movimientoData)
    .eq("id_movimiento", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar movimiento (soft delete)
export const deleteMovimientoCajaFuerte = async (id) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .update({ activo: false })
    .eq("id_movimiento", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Obtener historial de saldos
export const getHistorialSaldos = async (fecha_inicio, fecha_fin) => {
  let query = supabase
    .from("caja_fuerte")
    .select("fecha, tipo_movimiento, monto, saldo_anterior, saldo_nuevo, descripcion")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  if (fecha_inicio) query = query.gte("fecha", fecha_inicio);
  if (fecha_fin) query = query.lte("fecha", fecha_fin);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Flujo de caja diario
export const getFlujoCajaDiario = async (fecha) => {
  const { data, error } = await supabase.rpc("flujo_caja_diario", {
    p_fecha: fecha,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};
