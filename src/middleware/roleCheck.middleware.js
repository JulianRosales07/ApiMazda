import { error } from "../utils/response.js";

// Middleware simple para verificar rol de administrador
// Asume que el frontend envía el rol en el body o headers
export const requireAdmin = (req, res, next) => {
  // Obtener rol del body, query params o headers
  const userRole = req.body.rol || req.query.rol || req.headers["x-user-role"];

  if (!userRole) {
    return error(res, { message: "Rol de usuario no proporcionado" }, 400);
  }

  if (userRole !== "administrador") {
    return error(
      res,
      { message: "Acceso denegado. Se requiere rol de administrador" },
      403
    );
  }

  // Guardar el rol en el request para uso posterior
  req.userRole = userRole;
  next();
};

// Middleware para verificar roles específicos
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.body.rol || req.query.rol || req.headers["x-user-role"];

    if (!userRole) {
      return error(res, { message: "Rol de usuario no proporcionado" }, 400);
    }

    if (!allowedRoles.includes(userRole)) {
      return error(
        res,
        {
          message: `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(", ")}`,
        },
        403
      );
    }

    req.userRole = userRole;
    next();
  };
};
