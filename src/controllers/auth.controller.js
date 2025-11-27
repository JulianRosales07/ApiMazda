import bcrypt from "bcryptjs";
import { getUserByEmailWithPassword } from "../models/auth.model.js";
import { success, error } from "../utils/response.js";

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return error(res, { message: "Email y password son requeridos" }, 400);
    }

    // Buscar usuario por email
    const usuario = await getUserByEmailWithPassword(email);
    if (!usuario) {
      return error(res, { message: "Credenciales inválidas" }, 401);
    }

    // Validar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      return error(res, { message: "Credenciales inválidas" }, 401);
    }

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = usuario;

    // Responder con datos del usuario (sin password)
    success(res, {
      user: userWithoutPassword,
      message: "Login exitoso",
    });
  } catch (err) {
    error(res, err);
  }
};
