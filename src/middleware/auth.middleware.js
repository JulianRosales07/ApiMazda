import jwt from "jsonwebtoken";
import { error } from "../utils/response.js";

// Middleware para verificar token JWT
export const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return error(res, { message: "Token no proporcionado" }, 401);
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return error(res, { message: "Formato de token inválido" }, 401);
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = decoded;
    
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return error(res, { message: "Token inválido" }, 401);
    }
    if (err.name === "TokenExpiredError") {
      return error(res, { message: "Token expirado" }, 401);
    }
    return error(res, { message: "Error de autenticación" }, 401);
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  if (req.user.rol !== "administrador") {
    return error(res, { message: "Acceso denegado. Se requiere rol de administrador" }, 403);
  }
  next();
};

// Middleware para verificar rol (genérico)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return error(
        res,
        { message: `Acceso denegado. Se requiere uno de estos roles: ${roles.join(", ")}` },
        403
      );
    }
    next();
  };
};
