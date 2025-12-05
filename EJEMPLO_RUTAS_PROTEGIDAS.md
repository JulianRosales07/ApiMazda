# Ejemplos de Rutas Protegidas con JWT

## 1. Proteger todas las rutas de un módulo

```javascript
// src/routes/usuario.routes.js
import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuario.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas que cualquier usuario autenticado puede usar
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuario);

// Rutas que solo administradores pueden usar
router.post("/", requireAdmin, crearUsuario);
router.put("/:id", requireAdmin, actualizarUsuario);
router.delete("/:id", requireAdmin, eliminarUsuario);

export default router;
```

## 2. Proteger rutas individuales

```javascript
// src/routes/producto.routes.js
import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import {
  obtenerRepuestos,
  obtenerRepuesto,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
} from "../controllers/producto.controller.js";

const router = Router();

// Rutas públicas (sin autenticación)
router.get("/", obtenerRepuestos);
router.get("/:cb", obtenerRepuesto);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, requireAdmin, crearRepuesto);
router.put("/:cb", authMiddleware, requireAdmin, actualizarRepuesto);
router.delete("/:cb", authMiddleware, requireAdmin, eliminarRepuesto);

export default router;
```

## 3. Validar permisos en el controlador

```javascript
// src/controllers/salida.controller.js
export const eliminarSalida = async (req, res) => {
  try {
    const { n_factura } = req.params;

    // Validar que solo administradores puedan eliminar
    if (req.user.rol !== "administrador") {
      return error(res, { message: "Solo administradores pueden eliminar salidas" }, 403);
    }

    // Verificar si la salida existe
    const salidaExistente = await getSalidaByFactura(n_factura);
    if (!salidaExistente) {
      return error(res, { message: "Salida no encontrada" }, 404);
    }

    await deleteSalida(n_factura);
    success(res, null, "Salida eliminada correctamente");
  } catch (err) {
    error(res, err);
  }
};
```

## 4. Usar roles personalizados

```javascript
import { requireRole } from "../middleware/auth.middleware.js";

// Solo administradores y supervisores
router.post("/aprobar", authMiddleware, requireRole("administrador", "supervisor"), aprobarSalida);

// Solo administradores
router.delete("/:id", authMiddleware, requireRole("administrador"), eliminarSalida);
```

## 5. Cómo usar desde el frontend

### Login
```javascript
const response = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@mazda.com",
    password: "password123"
  })
});

const data = await response.json();
// Guardar el token
localStorage.setItem("token", data.data.token);
localStorage.setItem("user", JSON.stringify(data.data.user));
```

### Hacer peticiones autenticadas
```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:3000/api/usuarios", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Verificar token
```javascript
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:3000/api/auth/verify", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

if (response.ok) {
  console.log("Token válido");
} else {
  console.log("Token inválido o expirado");
  // Redirigir al login
}
```

## 6. Respuestas de error

### Sin token
```json
{
  "ok": false,
  "message": "Token no proporcionado"
}
```

### Token inválido
```json
{
  "ok": false,
  "message": "Token inválido"
}
```

### Token expirado
```json
{
  "ok": false,
  "message": "Token expirado"
}
```

### Sin permisos
```json
{
  "ok": false,
  "message": "Acceso denegado. Se requiere rol de administrador"
}
```

## 7. Estructura del token JWT

El token contiene:
```javascript
{
  id_usuario: 1,
  email: "admin@mazda.com",
  nombre: "Admin",
  rol: "administrador",
  iat: 1234567890,  // Fecha de emisión
  exp: 1234654290   // Fecha de expiración
}
```

## 8. Configuración de seguridad

En `.env`:
```env
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h
```

**IMPORTANTE:** Cambia `JWT_SECRET` por una clave segura en producción.
