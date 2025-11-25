import express from "express";
import cors from "cors";
import repuestoRoutes from "./routes/producto.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import salidaRoutes from "./routes/salida.routes.js";
import entradaRoutes from "./routes/entrada.routes.js";
import proveedorRoutes from "./routes/proveedor.routes.js";
import productoProveedorRoutes from "./routes/productoProveedor.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/repuestos", repuestoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/salidas", salidaRoutes);
app.use("/api/entradas", entradaRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/producto-proveedor", productoProveedorRoutes);

export default app;
