import { supabase } from "../config/db.js";

// Obtener todos los proveedores
export const getAllProveedores = async () => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("activo", true)
    .order("nombre_proveedor");

  if (error) throw error;
  return data;
};

// Obtener un proveedor por ID
export const getProveedorById = async (id) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("id_proveedor", id)
    .single();

  if (error) throw error;
  return data;
};

// Obtener un proveedor por CP
export const getProveedorByCP = async (cp) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("cp", cp)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Crear un nuevo proveedor
export const createProveedor = async (proveedor) => {
  const { ci, cp, nombre_proveedor, costo, usuario_creacion } = proveedor;

  const { data, error } = await supabase
    .from("proveedores")
    .insert([
      {
        ci,
        cp,
        nombre_proveedor,
        costo: costo || 0,
        usuario_creacion,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar un proveedor
export const updateProveedor = async (id, proveedor) => {
  const { ci, cp, nombre_proveedor, costo } = proveedor;

  const { data, error } = await supabase
    .from("proveedores")
    .update({
      ci,
      cp,
      nombre_proveedor,
      costo,
    })
    .eq("id_proveedor", id)
    .select();

  if (error) throw error;
  return data;
};

// Desactivar un proveedor (soft delete)
export const deleteProveedor = async (id) => {
  const { data, error } = await supabase
    .from("proveedores")
    .update({ activo: false })
    .eq("id_proveedor", id)
    .select();

  if (error) throw error;
  return data;
};

// Activar un proveedor
export const activarProveedor = async (id) => {
  const { data, error } = await supabase
    .from("proveedores")
    .update({ activo: true })
    .eq("id_proveedor", id)
    .select();

  if (error) throw error;
  return data;
};
