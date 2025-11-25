import { supabase } from "../config/db.js";

// Obtener todas las salidas
export const getAllSalidas = async () => {
  const { data, error } = await supabase
    .from("salidas")
    .select("*")
    .order("fecha", { ascending: false });
  
  if (error) throw error;
  return data;
};

// Obtener una salida por número de factura
export const getSalidaByFactura = async (n_factura) => {
  const { data, error } = await supabase
    .from("salidas")
    .select("*")
    .eq("n_factura", n_factura)
    .single();
  
  if (error) throw error;
  return data;
};

// Obtener salidas por CB
export const getSalidasByCB = async (cb) => {
  const { data, error } = await supabase
    .from("salidas")
    .select("*")
    .eq("cb", cb);
  
  if (error) throw error;
  return data;
};

// Obtener salidas por fecha
export const getSalidasByFecha = async (fecha) => {
  const { data, error } = await supabase
    .from("salidas")
    .select("*")
    .eq("fecha", fecha);
  
  if (error) throw error;
  return data;
};

// Crear una nueva salida
export const createSalida = async (salida) => {
  const {
    n_factura,
    fecha,
    cb,
    ci,
    descripcion,
    valor,
    cantidad,
    columna1,
    usuario_registro,
  } = salida;

  const { data, error } = await supabase
    .from("salidas")
    .insert([{
      n_factura,
      fecha,
      cb,
      ci,
      descripcion,
      valor,
      cantidad,
      columna1,
      usuario_registro,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar una salida
export const updateSalida = async (n_factura, salida) => {
  const {
    n_factura: new_n_factura,
    fecha,
    cb,
    ci,
    descripcion,
    valor,
    cantidad,
    columna1,
  } = salida;

  const { data, error } = await supabase
    .from("salidas")
    .update({
      n_factura: new_n_factura,
      fecha,
      cb,
      ci,
      descripcion,
      valor,
      cantidad,
      columna1,
    })
    .eq("n_factura", n_factura)
    .select();

  if (error) throw error;
  return data;
};

// Eliminar una salida
export const deleteSalida = async (n_factura) => {
  const { data, error } = await supabase
    .from("salidas")
    .delete()
    .eq("n_factura", n_factura)
    .select();
  
  if (error) throw error;
  return data;
};
