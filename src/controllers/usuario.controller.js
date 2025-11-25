import bcrypt from "bcryptjs";
import {
  getAllUsuarios,
  getUsuarioById,
  getUsuarioByEmail,
  createUsuario,
  updateUsuario,
  updatePassword,
  deleteUsuario,
} from "../models/usuario.model.js";
import { success, error } from "../utils/response.js";

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const data = await getAllUsuarios();
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req, res) => {
  try {
    const data = await getUsuarioById(req.params.id);
    if (!data) return error(res, { message: "Usuario no encontrado" }, 404);
    success(res, data);
  } catch (err) {
    error(res, err);
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return error(res, { message: "Nombre, email y password son requeridos" }, 400);
    }

    // Verificar si el email ya existe
    const usuarioExistente = await getUsuarioByEmail(email);
    if (usuarioExistente) {
      return error(res, { message: "El email ya está registrado" }, 400);
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = await createUsuario({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || "usuario",
    });

    success(res, nuevoUsuario, "Usuario creado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    // Verificar si el usuario existe
    const usuarioExistente = await getUsuarioById(id);
    if (!usuarioExistente) {
      return error(res, { message: "Usuario no encontrado" }, 404);
    }

    // Si se está cambiando el email, verificar que no esté en uso
    if (email && email !== usuarioExistente.email) {
      const emailEnUso = await getUsuarioByEmail(email);
      if (emailEnUso) {
        return error(res, { message: "El email ya está registrado" }, 400);
      }
    }

    await updateUsuario(id, { nombre, email, rol });
    success(res, null, "Usuario actualizado correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Actualizar contraseña de usuario
export const actualizarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return error(res, { message: "La contraseña es requerida" }, 400);
    }

    // Verificar si el usuario existe
    const usuarioExistente = await getUsuarioById(id);
    if (!usuarioExistente) {
      return error(res, { message: "Usuario no encontrado" }, 404);
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await updatePassword(id, hashedPassword);
    success(res, null, "Contraseña actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const usuarioExistente = await getUsuarioById(id);
    if (!usuarioExistente) {
      return error(res, { message: "Usuario no encontrado" }, 404);
    }

    await deleteUsuario(id);
    success(res, null, "Usuario eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};
