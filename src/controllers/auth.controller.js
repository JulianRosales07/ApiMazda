import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByIdentifier } from "../models/auth.model.js";
import { success, error } from "../utils/response.js";

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, nombre, username, password } = req.body;

    // El identificador puede ser email, nombre o username
    const identifier = email || nombre || username;

    // Validar campos requeridos
    if (!identifier || !password) {
      return error(
        res,
        { message: "Email/nombre de usuario y password son requeridos" },
        400
      );
    }

    // Buscar usuario por email o nombre
    const usuario = await getUserByIdentifier(identifier);
    if (!usuario) {
      return error(res, { message: "Credenciales inválidas" }, 401);
    }

    // Validar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      return error(res, { message: "Credenciales inválidas" }, 401);
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = usuario;

    // Responder con token y datos del usuario (sin password)
    success(res, {
      token,
      user: userWithoutPassword,
      message: "Login exitoso",
    });
  } catch (err) {
    error(res, err);
  }
};

// Verificar token (opcional, para validar sesión)
export const verifyToken = async (req, res) => {
  try {
    // El middleware authMiddleware ya validó el token
    // req.user contiene la información del usuario
    success(res, {
      user: req.user,
      message: "Token válido",
    });
  } catch (err) {
    error(res, err);
  }
};
