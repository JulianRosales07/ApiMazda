import { supabase } from "../config/db.js";

// Obtener todos los productos
export const getAllRepuestos = async () => {
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("repuestos")
      .select("*")
      .eq("activo", true)
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

// Obtener un producto por CB
export const getRepuestoByCB = async (cb) => {
  const { data, error } = await supabase
    .from("repuestos")
    .select("*")
    .eq("cb", cb)
    .single();
  
  if (error) throw error;
  return data;
};

// Crear un nuevo producto
export const createRepuesto = async (repuesto) => {
  const {
    cb,
    ci,
    producto,
    tipo,
    modelo_especificacion,
    referencia,
    marca,
    existencias_iniciales,
    stock,
    precio,
    descripcion_larga,
    estante,
    nivel,
    usuario_creacion,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .insert([{
      cb,
      ci,
      producto,
      tipo,
      modelo_especificacion,
      referencia,
      marca,
      existencias_iniciales,
      stock,
      precio,
      descripcion_larga,
      estante,
      nivel,
      usuario_creacion,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Actualizar un producto
export const updateRepuesto = async (cb, repuesto) => {
  const {
    ci,
    producto,
    tipo,
    modelo_especificacion,
    referencia,
    marca,
    existencias_iniciales,
    stock,
    precio,
    descripcion_larga,
    estante,
    nivel,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .update({
      ci,
      producto,
      tipo,
      modelo_especificacion,
      referencia,
      marca,
      existencias_iniciales,
      stock,
      precio,
      descripcion_larga,
      estante,
      nivel,
    })
    .eq("cb", cb)
    .select();
  
  if (error) throw error;
  return data;
};

// Eliminar un producto (soft delete)
export const deleteRepuesto = async (cb) => {
  const { data, error } = await supabase
    .from("repuestos")
    .update({ activo: false })
    .eq("cb", cb)
    .select();
  
  if (error) throw error;
  return data;
};
