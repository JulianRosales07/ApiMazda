import { supabase } from "../config/db.js";

// Obtener usuario por email o nombre (incluyendo password para autenticación)
export const getUserByIdentifier = async (identifier) => {
  // Buscar por email o nombre
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .or(`email.eq.${identifier},nombre.eq.${identifier}`)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No encontrado
    throw error;
  }
  return data;
};
