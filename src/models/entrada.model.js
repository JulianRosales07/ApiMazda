import { supabase } from "../config/db.js";

// Obtener todas las entradas
export const getAllEntradas = async () => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .order("FECHA", { ascending: false });
  
  if (error) throw error;
  return data;
};

// Obtener una entrada por ID
export const getEntradaById = async (id) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("ID", id)
    .single();
  
  if (error) throw error;
  return data;
};

// Obtener entradas por proveedor
export const getEntradasByProveedor = async (proveedor) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .ilike("PROVEEDOR", `%${proveedor}%`);
  
  if (error) throw error;
  return data;
};

// Obtener entradas por CB
export const getEntradasByCB = async (cb) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("CB", cb);
  
  if (error) throw error;
  return data;
};

// Obtener entradas por fecha
export const getEntradasByFecha = async (fecha) => {
  const { data, error } = await supabase
    .from("entradas")
    .select("*")
    .eq("FECHA", fecha);
  
  if (error) throw error;
  return data;
};

// Crear una nueva entrada
export const createEntrada = async (entrada) => {
  const {
    N_FACTURA,
    PROVEEDOR,
    FECHA,
    CB,
    CI,
    DESCRIPCION,
    CANTIDAD,
    COSTO,
    VALOR_VENTA,
    SIIGO,
    Columna1,
    usuario_registro,
  } = entrada;

  const { data, error } = await supabase
    .from("entradas")
    .insert([{
      N_FACTURA,
      PROVEEDOR,
      FECHA,
      CB,
      CI,
      DESCRIPCION,
      CANTIDAD,
      COSTO,
      VALOR_VENTA,
      SIIGO,
      Columna1,
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
    N_FACTURA,
    PROVEEDOR,
    FECHA,
    CB,
    CI,
    DESCRIPCION,
    CANTIDAD,
    COSTO,
    VALOR_VENTA,
    SIIGO,
    Columna1,
  } = entrada;

  const { data, error } = await supabase
    .from("entradas")
    .update({
      N_FACTURA,
      PROVEEDOR,
      FECHA,
      CB,
      CI,
      DESCRIPCION,
      CANTIDAD,
      COSTO,
      VALOR_VENTA,
      SIIGO,
      Columna1,
    })
    .eq("ID", id)
    .select();

  if (error) throw error;
  return data;
};

// Eliminar una entrada
export const deleteEntrada = async (id) => {
  const { data, error } = await supabase
    .from("entradas")
    .delete()
    .eq("ID", id)
    .select();
  
  if (error) throw error;
  return data;
};
