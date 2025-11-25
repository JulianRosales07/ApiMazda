import { supabase } from "../config/db.js";

// Obtener todos los usuarios
export const getAllUsuarios = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, email, rol, fecha_creacion, activo")
    .eq("activo", true);
  
  if (error) throw error;
  return data;
};

// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, email, rol, fecha_creacion, activo")
    .eq("id_usuario", id)
    .single();
  
  if (error) throw error;
  return data;
};

// Obtener un usuario por email
export const getUsuarioByEmail = async (email) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();
  
  if (error) throw error;
  return data;
};

// Crear un nuevo usuario
export const createUsuario = async (usuario) => {
  const { nombre, email, password, rol } = usuario;

  const { data, error } = await supabase
    .from("usuarios")
    .insert([{
      nombre,
      email,
      password,
      rol: rol || "usuario",
    }])
    .select("id_usuario, nombre, email, rol")
    .single();
  
  if (error) throw error;
  return data;
};

// Actualizar un usuario
export const updateUsuario = async (id, usuario) => {
  const { nombre, email, rol } = usuario;

  const { data, error } = await supabase
    .from("usuarios")
    .update({ nombre, email, rol })
    .eq("id_usuario", id)
    .select();
  
  if (error) throw error;
  return data;
};

// Actualizar contraseña de usuario
export const updatePassword = async (id, password) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ password })
    .eq("id_usuario", id)
    .select();
  
  if (error) throw error;
  return data;
};

// Eliminar un usuario (soft delete)
export const deleteUsuario = async (id) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ activo: false })
    .eq("id_usuario", id)
    .select();
  
  if (error) throw error;
  return data;
};
