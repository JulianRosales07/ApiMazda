# Validación de Roles Simple (Sin JWT)

## Método 1: Validar en el Controlador

### Ejemplo: Eliminar Usuario (Solo Administradores)

```javascript
// src/controllers/usuario.controller.js
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body; // El frontend envía el rol del usuario actual

    // VALIDACIÓN DE ROL EN EL BACKEND
    if (rol !== "administrador") {
      return error(res, { message: "Acceso denegado. Solo administradores pueden eliminar usuarios" }, 403);
    }

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
```

### Ejemplo: Crear Producto (Solo Administradores)

```javascript
// src/controllers/producto.controller.js
export const crearRepuesto = async (req, res) => {
  try {
    const { rol, ...productoData } = req.body;

    // VALIDACIÓN DE ROL
    if (rol !== "administrador") {
      return error(res, { message: "Solo administradores pueden crear productos" }, 403);
    }

    const nuevo = await createRepuesto(productoData);
    success(res, nuevo, "Repuesto creado correctamente");
  } catch (err) {
    error(res, err);
  }
};
```

### Ejemplo: Aprobar Devolución (Solo Administradores)

```javascript
// src/controllers/devolucion.controller.js
export const aprobarDevolucion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    // VALIDACIÓN DE ROL
    if (rol !== "administrador") {
      return error(res, { message: "Acceso denegado. Solo administradores pueden aprobar devoluciones" }, 403);
    }

    // Procesar devolución
    await procesarDevolucion(id);
    success(res, null, "Devolución aprobada correctamente");
  } catch (err) {
    error(res, err);
  }
};
```

## Método 2: Usar Middleware Simple

### Crear el Middleware

```javascript
// src/middleware/roleCheck.middleware.js
export const requireAdmin = (req, res, next) => {
  const userRole = req.body.rol || req.query.rol || req.headers["x-user-role"];

  if (userRole !== "administrador") {
    return res.status(403).json({ 
      ok: false,
      message: "Acceso denegado. Se requiere rol de administrador" 
    });
  }

  next();
};
```

### Usar el Middleware en las Rutas

```javascript
// src/routes/usuario.routes.js
import { requireAdmin } from "../middleware/roleCheck.middleware.js";

// Rutas públicas
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuario);

// Rutas protegidas (solo administradores)
router.post("/", requireAdmin, crearUsuario);
router.put("/:id", requireAdmin, actualizarUsuario);
router.delete("/:id", requireAdmin, eliminarUsuario);
```

## Método 3: Validación Combinada (Middleware + Controlador)

```javascript
// En la ruta
router.delete("/:id", requireAdmin, eliminarUsuario);

// En el controlador (doble validación por seguridad)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    // Validación adicional en el controlador
    if (rol !== "administrador") {
      return error(res, { message: "Acceso denegado" }, 403);
    }

    await deleteUsuario(id);
    success(res, null, "Usuario eliminado correctamente");
  } catch (err) {
    error(res, err);
  }
};
```

## Cómo Enviar el Rol desde el Frontend

### Opción 1: En el Body
```javascript
fetch("http://localhost:3000/api/usuarios/1", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    rol: "administrador" // Rol del usuario actual
  })
});
```

### Opción 2: En los Headers
```javascript
fetch("http://localhost:3000/api/usuarios/1", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    "x-user-role": "administrador"
  }
});
```

### Opción 3: En Query Params
```javascript
fetch("http://localhost:3000/api/usuarios/1?rol=administrador", {
  method: "DELETE"
});
```

## Ejemplo Completo: Controlador de Salidas

```javascript
// src/controllers/salida.controller.js
export const crearSalida = async (req, res) => {
  try {
    const { rol, ...salidaData } = req.body;

    // Cualquier usuario puede crear salidas
    const nueva = await createSalida(salidaData);
    success(res, nueva, "Salida creada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const actualizarSalida = async (req, res) => {
  try {
    const { n_factura } = req.params;
    const { rol, ...salidaData } = req.body;

    // Solo administradores pueden actualizar
    if (rol !== "administrador") {
      return error(res, { message: "Solo administradores pueden actualizar salidas" }, 403);
    }

    await updateSalida(n_factura, salidaData);
    success(res, null, "Salida actualizada correctamente");
  } catch (err) {
    error(res, err);
  }
};

export const eliminarSalida = async (req, res) => {
  try {
    const { n_factura } = req.params;
    const { rol } = req.body;

    // Solo administradores pueden eliminar
    if (rol !== "administrador") {
      return error(res, { message: "Solo administradores pueden eliminar salidas" }, 403);
    }

    await deleteSalida(n_factura);
    success(res, null, "Salida eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
```

## Respuestas de Error

### Sin permisos
```json
{
  "ok": false,
  "message": "Acceso denegado. Solo administradores pueden eliminar usuarios"
}
```

### Rol no proporcionado
```json
{
  "ok": false,
  "message": "Rol de usuario no proporcionado"
}
```

## ⚠️ Importante

**Este método es menos seguro que JWT** porque:
- El frontend puede enviar cualquier rol
- No hay verificación de identidad real
- Es fácil de manipular desde el navegador

**Recomendación:** Úsalo solo para:
- Desarrollo y pruebas
- Aplicaciones internas sin acceso público
- Como capa adicional junto con JWT

Para producción, es mejor usar JWT + validación de roles.
