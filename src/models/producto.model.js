import { supabase } from "../config/db.js";

// Obtener todos los productos
export const getAllRepuestos = async () => {
  const { data, error } = await supabase
    .from("repuestos")
    .select("*")
    .eq("activo", true);
  
  if (error) throw error;
  return data;
};

// Obtener un producto por CB
export const getRepuestoByCB = async (cb) => {
  const { data, error } = await supabase
    .from("repuestos")
    .select("*")
    .eq("CB", cb)
    .single();
  
  if (error) throw error;
  return data;
};

// Crear un nuevo producto
export const createRepuesto = async (repuesto) => {
  const {
    CB,
    CI,
    PRODUCTO,
    TIPO,
    MODELO_ESPECIFICACION,
    REFERENCIA,
    MARCA,
    EXISTENCIAS_INICIALES,
    STOCK,
    PRECIO,
    DESCRIPCION_LARGA,
    ESTANTE,
    NIVEL,
    usuario_creacion,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .insert([{
      CB,
      CI,
      PRODUCTO,
      TIPO,
      MODELO_ESPECIFICACION,
      REFERENCIA,
      MARCA,
      EXISTENCIAS_INICIALES,
      STOCK,
      PRECIO,
      DESCRIPCION_LARGA,
      ESTANTE,
      NIVEL,
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
    CI,
    PRODUCTO,
    TIPO,
    MODELO_ESPECIFICACION,
    REFERENCIA,
    MARCA,
    EXISTENCIAS_INICIALES,
    STOCK,
    PRECIO,
    DESCRIPCION_LARGA,
    ESTANTE,
    NIVEL,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .update({
      CI,
      PRODUCTO,
      TIPO,
      MODELO_ESPECIFICACION,
      REFERENCIA,
      MARCA,
      EXISTENCIAS_INICIALES,
      STOCK,
      PRECIO,
      DESCRIPCION_LARGA,
      ESTANTE,
      NIVEL,
    })
    .eq("CB", cb)
    .select();
  
  if (error) throw error;
  return data;
};

// Eliminar un producto (soft delete)
export const deleteRepuesto = async (cb) => {
  const { data, error } = await supabase
    .from("repuestos")
    .update({ activo: false })
    .eq("CB", cb)
    .select();
  
  if (error) throw error;
  return data;
};
