import { supabase } from "../config/db.js";

// Obtener historial completo con filtros opcionales
export const getHistorialPrecios = async (filters = {}) => {
  const {
    producto_cb,
    proveedor_id,
    fecha_desde,
    fecha_hasta,
    limit = 100,
  } = filters;

  const { data, error } = await supabase.rpc("get_historial_precios_completo", {
    p_producto_cb: producto_cb || null,
    p_proveedor_id: proveedor_id || null,
    p_fecha_desde: fecha_desde || null,
    p_fecha_hasta: fecha_hasta || null,
    p_limit: limit,
  });

  if (error) {
    // Fallback si la función RPC no existe
    let query = supabase
      .from("historial_precios")
      .select(
        `
        *,
        repuestos:producto_cb (producto, marca, tipo),
        proveedores:proveedor_id (nombre_proveedor, cp)
      `
      )
      .eq("activo", true)
      .order("fecha_cambio", { ascending: false });

    if (producto_cb) query = query.eq("producto_cb", producto_cb);
    if (proveedor_id) query = query.eq("proveedor_id", proveedor_id);
    if (fecha_desde) query = query.gte("fecha_cambio", fecha_desde);
    if (fecha_hasta) query = query.lte("fecha_cambio", fecha_hasta);
    if (limit) query = query.limit(limit);

    const { data: fallbackData, error: fallbackError } = await query;
    if (fallbackError) throw fallbackError;
    return fallbackData;
  }

  return data;
};

// Obtener historial por producto específico
export const getHistorialByProducto = async (producto_cb, limit = 50) => {
  return await getHistorialPrecios({ producto_cb, limit });
};

// Obtener historial por proveedor específico
export const getHistorialByProveedor = async (proveedor_id, limit = 50) => {
  return await getHistorialPrecios({ proveedor_id, limit });
};

// Obtener historial de un producto con un proveedor específico
export const getHistorialProductoProveedor = async (producto_cb, proveedor_id) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select(
      `
      *,
      repuestos:producto_cb (producto, marca, tipo),
      proveedores:proveedor_id (nombre_proveedor, cp)
    `
    )
    .eq("producto_cb", producto_cb)
    .eq("proveedor_id", proveedor_id)
    .eq("activo", true)
    .order("fecha_cambio", { ascending: false });

  if (error) throw error;
  return data;
};

// Crear registro manual de historial
export const createHistorialPrecio = async (historial) => {
  const {
    producto_cb,
    proveedor_id,
    precio_anterior,
    precio_nuevo,
    usuario_modificacion,
    motivo_cambio,
  } = historial;

  const { data, error } = await supabase
    .from("historial_precios")
    .insert([
      {
        producto_cb,
        proveedor_id,
        precio_anterior,
        precio_nuevo,
        usuario_modificacion,
        motivo_cambio,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar registro de historial (solo motivo y usuario)
export const updateHistorialPrecio = async (id, data) => {
  const { motivo_cambio, usuario_modificacion } = data;

  const updateData = {};
  if (motivo_cambio !== undefined) updateData.motivo_cambio = motivo_cambio;
  if (usuario_modificacion !== undefined) updateData.usuario_modificacion = usuario_modificacion;

  const { data: result, error } = await supabase
    .from("historial_precios")
    .update(updateData)
    .eq("id_historial", id)
    .select();

  if (error) throw error;
  return result;
};

// Eliminar registro de historial (soft delete)
export const deleteHistorialPrecio = async (id) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .update({ activo: false })
    .eq("id_historial", id)
    .select();

  if (error) throw error;
  return data;
};

// Obtener último precio registrado
export const getUltimoPrecio = async (producto_cb, proveedor_id) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select("*")
    .eq("producto_cb", producto_cb)
    .eq("proveedor_id", proveedor_id)
    .eq("activo", true)
    .order("fecha_cambio", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Obtener estadísticas de precios
export const getEstadisticasPrecios = async (producto_cb, proveedor_id) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select("precio_nuevo")
    .eq("producto_cb", producto_cb)
    .eq("proveedor_id", proveedor_id)
    .eq("activo", true)
    .order("fecha_cambio", { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return {
      precio_actual: null,
      precio_minimo: null,
      precio_maximo: null,
      precio_promedio: null,
      total_cambios: 0,
    };
  }

  const precios = data.map((h) => parseFloat(h.precio_nuevo));
  const precio_actual = precios[0];
  const precio_minimo = Math.min(...precios);
  const precio_maximo = Math.max(...precios);
  const precio_promedio = precios.reduce((a, b) => a + b, 0) / precios.length;

  return {
    precio_actual,
    precio_minimo,
    precio_maximo,
    precio_promedio: parseFloat(precio_promedio.toFixed(2)),
    total_cambios: data.length,
  };
};

// Comparar precios entre proveedores en un rango de fechas
export const compararPreciosProveedores = async (producto_cb, fecha_desde, fecha_hasta) => {
  const { data, error } = await supabase
    .from("historial_precios")
    .select(
      `
      proveedor_id,
      precio_nuevo,
      fecha_cambio,
      proveedores:proveedor_id (nombre_proveedor, cp)
    `
    )
    .eq("producto_cb", producto_cb)
    .eq("activo", true)
    .gte("fecha_cambio", fecha_desde)
    .lte("fecha_cambio", fecha_hasta)
    .order("fecha_cambio", { ascending: false });

  if (error) throw error;
  return data;
};
