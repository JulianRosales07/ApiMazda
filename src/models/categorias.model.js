import { supabase } from "../config/db.js";

// ============================================
// CATEGORÍAS Y SUBCATEGORÍAS
// ============================================

// Obtener todas las categorías con subcategorías
export const getAllCategorias = async () => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .select(`
      *,
      subcategorias:subcategorias_gastos(*)
    `)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
};

// Obtener categoría por ID
export const getCategoriaById = async (id) => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .select(`
      *,
      subcategorias:subcategorias_gastos(*)
    `)
    .eq("id_categoria", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Crear nueva categoría
export const createCategoria = async (categoriaData) => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .insert([categoriaData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar categoría
export const updateCategoria = async (id, categoriaData) => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .update(categoriaData)
    .eq("id_categoria", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar categoría (soft delete)
export const deleteCategoria = async (id) => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .update({ activo: false })
    .eq("id_categoria", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// SUBCATEGORÍAS
// ============================================

// Obtener subcategorías por categoría
export const getSubcategoriasByCategoria = async (id_categoria) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .select("*")
    .eq("id_categoria", id_categoria)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
};

// Obtener subcategoría por ID
export const getSubcategoriaById = async (id) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .select(`
      *,
      categoria:categorias_gastos!subcategorias_gastos_id_categoria_fkey(id_categoria, nombre)
    `)
    .eq("id_subcategoria", id)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

// Crear nueva subcategoría
export const createSubcategoria = async (subcategoriaData) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .insert([subcategoriaData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar subcategoría
export const updateSubcategoria = async (id, subcategoriaData) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .update(subcategoriaData)
    .eq("id_subcategoria", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar subcategoría (soft delete)
export const deleteSubcategoria = async (id) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .update({ activo: false })
    .eq("id_subcategoria", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
