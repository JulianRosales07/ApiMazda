import { supabase } from "../config/db.js";

// Obtener usuario por email (incluyendo password para autenticación)
export const getUserByEmailWithPassword = async (email) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No encontrado
    throw error;
  }
  return data;
};
