import { supabase } from "../config/db.js";

// Obtener todas las entradas (con paginación automática)
export const getAllEntradas = async () => {
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("entradas")
      .select("*")
      .order("fecha", { ascending: false })
      .range(from, from + pageSize - 1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  
  return allData;
};

// Obtener una entrada por ID
export const getEntradaById = async (id) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
};

// Obtener entradas por proveedor
export const getEntradasByProveedor = async (proveedor) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .ilike("proveedor", `%${proveedor}%`);
  
  if (error) throw error;
  return data;
};

// Obtener entradas por CB
export const getEntradasByCB = async (cb) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("cb", cb);
  
  if (error) throw error;
  return data;
};

// Obtener entradas por fecha
export const getEntradasByFecha = async (fecha) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("fecha", fecha);
  
  if (error) throw error;
  return data;
};

// Crear una nueva entrada
export const createEntrada = async (entrada) => {
  const {
    n_factura,
    proveedor,
    fecha,
    cb,
    ci,
    descripcion,
    cantidad,
    costo,
    valor_venta,
    siigo,
    columna1,
    usuario_registro,
  } = entrada;

  const { data, error } = await supabase
    .from("entradas")
    .insert([{
      n_factura,
      proveedor,
      fecha,
      cb,
      ci,
      descripcion,
      cantidad,
      costo,
      valor_venta,
      siigo,
      columna1,
      usuario_registro,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar una entrada
export const updateEntrada = async (id, entrada) => {
  const {
    n_factura,
    proveedor,
    fecha,
    cb,
    ci,
    descripcion,
    cantidad,
    costo,
    valor_venta,
    siigo,
    columna1,
  } = entrada;

  const { data, error } = await supabase
    .from("entradas")
    .update({
      n_factura,
      proveedor,
      fecha,
      cb,
      ci,
      descripcion,
      cantidad,
      costo,
      valor_venta,
      siigo,
      columna1,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
};

// Eliminar una entrada
export const deleteEntrada = async (id) => {
  const { data, error } = await supabase
    .from("entradas")
    .delete()
    .eq("id", id)
    .select();
  
  if (error) throw error;
  return data;
};
