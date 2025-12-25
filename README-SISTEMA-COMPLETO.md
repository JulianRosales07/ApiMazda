# 🚗 Sistema Integrado Mazda Japón - Inventario y Caja

Sistema completo de gestión para Mazda Japón que integra:
- 📦 **Gestión de Inventario** (Repuestos, Entradas, Salidas)
- 💰 **Sistema de Caja** (Ventas, Gastos, Reportes)
- 👥 **Gestión de Usuarios** (Roles y permisos)
- 🏢 **Gestión de Proveedores** (Comparativas de precios)

## 🎯 Características Principales

### Módulo de Inventario
- ✅ CRUD completo de repuestos
- ✅ Control de stock automático
- ✅ Entradas y salidas de productos
- ✅ Devoluciones (clientes y proveedores)
- ✅ Gestión de proveedores
- ✅ Comparativa de precios entre proveedores
- ✅ Historial de precios
- ✅ Alertas de stock bajo

### Módulo de Caja
- ✅ Apertura y cierre de caja por jornada
- ✅ Registro de ventas (REDES y ALMACEN)
- ✅ Registro de gastos por categorías
- ✅ Múltiples métodos de pago
- ✅ Reportes diarios y mensuales
- ✅ Integración con salidas de inventario
- ✅ Cálculo automático de totales

### Módulo de Usuarios
- ✅ Autenticación con JWT
- ✅ Roles: administrador, cajero, gestion_inventario, etc.
- ✅ Control de acceso por rol

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT
- **Documentación:** Swagger

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar migraciones de base de datos
# Ejecutar schema-integrado.sql en Supabase SQL Editor

# Iniciar servidor
npm start
```

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### Inventario
- `usuarios` - Usuarios del sistema
- `repuestos` - Catálogo de productos
- `entradas` - Entradas de inventario
- `salidas` - Salidas de inventario
- `devoluciones` - Devoluciones
- `proveedores` - Proveedores
- `producto_proveedor` - Relación productos-proveedores
- `marcas` - Marcas de productos

#### Caja
- `cajas` - Aperturas y cierres de caja
- `ventas` - Registro de ventas
- `gastos` - Registro de gastos
- `categorias_gastos` - Categorías de gastos
- `subcategorias_gastos` - Subcategorías de gastos

## 🚀 Endpoints Disponibles

### Autenticación
```
POST   /api/auth/login          - Iniciar sesión
POST   /api/auth/register       - Registrar usuario
```

### Inventario
```
GET    /api/repuestos           - Listar repuestos
POST   /api/repuestos           - Crear repuesto
GET    /api/repuestos/:cb       - Obtener repuesto
PUT    /api/repuestos/:cb       - Actualizar repuesto
DELETE /api/repuestos/:cb       - Eliminar repuesto

GET    /api/entradas            - Listar entradas
POST   /api/entradas            - Registrar entrada
GET    /api/salidas             - Listar salidas
POST   /api/salidas             - Registrar salida

GET    /api/proveedores         - Listar proveedores
POST   /api/proveedores         - Crear proveedor
```

### Caja
```
GET    /api/caja/cajas                              - Listar cajas
POST   /api/caja/cajas                              - Abrir caja
GET    /api/caja/cajas/:id                          - Obtener caja
POST   /api/caja/cajas/:id/cerrar                   - Cerrar caja
GET    /api/caja/cajas/usuario/:usuario_id/abierta  - Caja abierta del usuario

GET    /api/caja/ventas         - Listar ventas
POST   /api/caja/ventas         - Registrar venta
PUT    /api/caja/ventas/:id     - Actualizar venta
DELETE /api/caja/ventas/:id     - Eliminar venta

GET    /api/caja/gastos         - Listar gastos
POST   /api/caja/gastos         - Registrar gasto
PUT    /api/caja/gastos/:id     - Actualizar gasto
DELETE /api/caja/gastos/:id     - Eliminar gasto

GET    /api/caja/categorias     - Listar categorías
GET    /api/caja/reportes/diario   - Reporte diario
GET    /api/caja/reportes/mensual  - Reporte mensual
```

Ver documentación completa en:
- [CAJA-API-DOCS.md](./CAJA-API-DOCS.md) - Documentación detallada del módulo de caja
- `http://localhost:3000/api-docs` - Swagger UI (cuando el servidor esté corriendo)
- `http://localhost:3000/` - Página principal con todas las rutas

## 🔐 Roles y Permisos

### Roles Disponibles
- `administrador` - Acceso completo al sistema
- `cajero` - Gestión de caja (ventas y gastos)
- `gestion_inventario` - Gestión de inventario
- `gestion_ingresos` - Solo entradas de inventario
- `gestion_egresos` - Solo salidas de inventario

## 📊 Flujo de Trabajo

### Flujo de Caja Diario

1. **Inicio de Jornada**
   ```bash
   POST /api/caja/cajas
   {
     "usuario_id": 1,
     "jornada": "mañana",
     "monto_inicial": 100000
   }
   ```

2. **Registrar Ventas**
   ```bash
   POST /api/caja/ventas
   {
     "caja_id": 1,
     "factura": "F-001",
     "valor": 50000,
     "metodo_pago": "EFECTIVO"
   }
   ```

3. **Registrar Gastos**
   ```bash
   POST /api/caja/gastos
   {
     "caja_id": 1,
     "descripcion": "Pago de luz",
     "valor": 80000
   }
   ```

4. **Fin de Jornada**
   ```bash
   POST /api/caja/cajas/1/cerrar
   {
     "monto_final": 170000,
     "notas_cierre": "Cierre normal"
   }
   ```

### Flujo de Inventario

1. **Registrar Entrada**
   ```bash
   POST /api/entradas
   {
     "CB": "100001",
     "CANTIDAD": 10,
     "COSTO": 5000
   }
   ```
   → El stock se actualiza automáticamente

2. **Registrar Salida (Venta)**
   ```bash
   POST /api/salidas
   {
     "cb": "100001",
     "cantidad": 2,
     "valor": 12000
   }
   ```
   → El stock se reduce automáticamente

3. **Vincular con Caja**
   ```bash
   POST /api/caja/ventas
   {
     "salida_id": 123,  # ID de la salida
     "caja_id": 1,
     "valor": 12000
   }
   ```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon

# JWT
JWT_SECRET=tu-secreto-jwt

# Server
PORT=3000
NODE_ENV=development
```

## 📈 Reportes Disponibles

### Reportes de Caja
- Reporte diario de ventas y gastos
- Reporte mensual consolidado
- Ventas por método de pago
- Gastos por categoría
- Diferencias de caja

### Reportes de Inventario
- Stock actual
- Productos con stock bajo
- Historial de movimientos
- Comparativa de proveedores
- Estadísticas por producto

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar con coverage
npm run test:coverage
```

## 📝 Notas de Desarrollo

### Triggers Automáticos
- ✅ Actualización de stock en entradas
- ✅ Actualización de stock en salidas
- ✅ Actualización de stock en devoluciones
- ✅ Cálculo de totales de caja
- ✅ Actualización de fechas de modificación

### Validaciones
- ✅ No se puede abrir dos cajas simultáneamente
- ✅ Solo se pueden registrar ventas/gastos en cajas abiertas
- ✅ Verificación de stock antes de salidas
- ✅ Validación de métodos de pago
- ✅ Validación de roles de usuario

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial de Mazda Japón.

## 👥 Contacto

- **Desarrollador:** Julian Rosales
- **Email:** julianrosales0703@hotmail.com

---

**Última actualización:** Diciembre 2024
