import { supabase } from "../config/db.js";

// ============================================
// GASTOS - TABLA INDEPENDIENTE
// ============================================

// Obtener todos los gastos
export const getAllGastos = async (filters = {}) => {
  let query = supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias_gastos!gastos_id_categoria_fkey(id_categoria, nombre),
      subcategoria:subcategorias_gastos!gastos_id_subcategoria_fkey(id_subcategoria, nombre),
      usuario:usuarios!gastos_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("activo", true)
    .order("fecha", { ascending: false });

  if (filters.id_categoria) query = query.eq("id_categoria", filters.id_categoria);
  if (filters.id_subcategoria) query = query.eq("id_subcategoria", filters.id_subcategoria);
  if (filters.metodo_pago) query = query.eq("metodo_pago", filters.metodo_pago);
  if (filters.fecha_inicio) query = query.gte("fecha", filters.fecha_inicio);
  if (filters.fecha_fin) query = query.lte("fecha", filters.fecha_fin);
  if (filters.usuario_registro) query = query.eq("usuario_registro", filters.usuario_registro);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Obtener gasto por ID
export const getGastoById = async (id) => {
  const { data, error } = await supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias_gastos!gastos_id_categoria_fkey(id_categoria, nombre),
      subcategoria:subcategorias_gastos!gastos_id_subcategoria_fkey(id_subcategoria, nombre),
      usuario:usuarios!gastos_usuario_registro_fkey(id_usuario, nombre, email)
    `)
    .eq("id_gasto", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Registrar nuevo gasto usando función de PostgreSQL
export const registrarGasto = async (gastoData) => {
  const {
    descripcion,
    id_categoria,
    id_subcategoria,
    metodo_pago,
    valor,
    usuario_registro,
  } = gastoData;

  // Obtener la caja abierta del usuario
  const { data: cajaAbierta } = await supabase
    .from("cajas")
    .select("id_caja")
    .eq("usuario_id", usuario_registro)
    .eq("estado", "abierta")
    .eq("activo", true)
    .order("fecha_apertura", { ascending: false })
    .limit(1)
    .maybeSingle();

  const caja_id = cajaAbierta?.id_caja || null;

  const { data, error } = await supabase.rpc("registrar_gasto", {
    p_descripcion: descripcion,
    p_id_categoria: id_categoria,
    p_id_subcategoria: id_subcategoria || null,
    p_metodo_pago: metodo_pago,
    p_valor: valor,
    p_usuario_registro: usuario_registro,
  });

  if (error) throw error;
  
  // Si se creó el gasto y hay una caja abierta, actualizar el caja_id
  if (data && data.length > 0 && caja_id) {
    const gastoCreado = data[0];
    const { data: gastoActualizado, error: updateError } = await supabase
      .from("gastos")
      .update({ caja_id })
      .eq("id_gasto", gastoCreado.id_gasto)
      .select()
      .single();
    
    if (updateError) throw updateError;
    return gastoActualizado;
  }
  
  return data && data.length > 0 ? data[0] : null;
};

// Actualizar gasto
export const updateGasto = async (id, gastoData) => {
  const { data, error } = await supabase
    .from("gastos")
    .update(gastoData)
    .eq("id_gasto", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar gasto (soft delete)
export const deleteGasto = async (id) => {
  const { data, error } = await supabase
    .from("gastos")
    .update({ activo: false })
    .eq("id_gasto", id)
    .select();

  if (error) throw error;
  
  // Verificar que se eliminó algo
  if (!data || data.length === 0) {
    throw new Error('Gasto no encontrado');
  }
  
  return data[0];
};

// Obtener gastos por categoría
export const getGastosPorCategoria = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("reporte_gastos_categoria", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data;
};

// Obtener gastos por método de pago
export const getGastosPorMetodoPago = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("reporte_gastos_metodo_pago", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data;
};
