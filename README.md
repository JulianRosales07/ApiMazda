# 🚗 Sistema de Inventario Mazda

Sistema de gestión de inventario de repuestos para Mazda, migrado a Supabase (PostgreSQL).

## 🎯 Características

- ✅ Gestión de repuestos (CRUD completo)
- ✅ Control de entradas y salidas
- ✅ Gestión de usuarios con roles
- ✅ Actualización automática de stock mediante triggers
- ✅ Marcas y proveedores
- ✅ Devoluciones (clientes y proveedores)
- ✅ Vistas de reportes y estadísticas
- ✅ Row Level Security (RLS) configurado

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Supabase Client
- **Autenticación**: bcryptjs

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm (o npm)
- Cuenta de Supabase

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con:

```env
PORT=3000
VITE_SUPABASE_URL=https://sjllenxfoowyhiyeabxh.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui
```

### 3. Ejecutar el esquema SQL en Supabase

**IMPORTANTE**: Debes hacer esto antes de iniciar la aplicación.

1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto: `sjllenxfoowyhiyeabxh`
3. Ve a **SQL Editor**
4. Copia el contenido de `entradas_full_corregidas.sql`
5. Pégalo y ejecuta (Run)

### 4. Probar la conexión

```bash
pnpm run test:db
```

Deberías ver:
```
✅ Conexión exitosa a Supabase
📊 Verificando tablas:
   ✅ usuarios: OK
   ✅ repuestos: OK
   ✅ entradas: OK
   ✅ salidas: OK
   ✅ marcas: OK
   ✅ proveedores: OK
```

### 5. Iniciar el servidor

```bash
# Modo producción
pnpm start

# Modo desarrollo (con auto-reload)
pnpm dev
```

El servidor estará disponible en: http://localhost:3000

## 📡 API Endpoints

### Usuarios
- `GET /api/usuarios` - Listar todos
- `GET /api/usuarios/:id` - Obtener uno
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar (soft delete)

### Repuestos
- `GET /api/repuestos` - Listar todos
- `GET /api/repuestos/:cb` - Obtener por código de barras
- `POST /api/repuestos` - Crear
- `PUT /api/repuestos/:cb` - Actualizar
- `DELETE /api/repuestos/:cb` - Eliminar (soft delete)

### Entradas
- `GET /api/entradas` - Listar todas
- `GET /api/entradas/:id` - Obtener una
- `POST /api/entradas` - Crear (actualiza stock automáticamente)
- `PUT /api/entradas/:id` - Actualizar
- `DELETE /api/entradas/:id` - Eliminar

### Salidas
- `GET /api/salidas` - Listar todas
- `GET /api/salidas/:n_factura` - Obtener una
- `POST /api/salidas` - Crear (reduce stock automáticamente)
- `PUT /api/salidas/:n_factura` - Actualizar
- `DELETE /api/salidas/:n_factura` - Eliminar

## 📊 Estructura de Base de Datos

### Tablas Principales

- **usuarios** - Gestión de usuarios del sistema
- **repuestos** - Catálogo de productos
- **entradas** - Registro de compras/ingresos
- **salidas** - Registro de ventas/egresos
- **marcas** - Catálogo de marcas
- **proveedores** - Información de proveedores
- **devoluciones** - Registro de devoluciones

### Triggers Automáticos

El sistema incluye triggers que:
- Actualizan el stock al crear entradas (+)
- Actualizan el stock al crear salidas (-)
- Validan stock suficiente antes de salidas
- Actualizan `fecha_actualizacion` automáticamente

### Vistas Útiles

- `vista_resumen_inventario` - Resumen completo
- `vista_stock_bajo` - Productos con stock < 10
- `vista_movimientos_recientes` - Últimos 30 días
- `vista_estadisticas_producto` - Estadísticas por producto

## 📚 Documentación Adicional

- **PROXIMOS_PASOS.md** - Guía paso a paso para completar la migración
- **MIGRACION_SUPABASE.md** - Detalles técnicos de la migración
- **COMANDOS_RAPIDOS.md** - Comandos útiles y ejemplos de API
- **RESUMEN_MIGRACION.md** - Resumen de cambios realizados

## 🔐 Roles de Usuario

El sistema soporta los siguientes roles:

- `administrador` - Acceso completo
- `gestion_ingresos` - Gestión de entradas
- `gestion_egresos` - Gestión de salidas
- `gestion_inventario` - Gestión de productos

## 🧪 Ejemplos de Uso

### Crear un repuesto

```bash
curl -X POST http://localhost:3000/api/repuestos \
  -H "Content-Type: application/json" \
  -d '{
    "CB": "100999",
    "PRODUCTO": "FILTRO DE AIRE",
    "TIPO": "FILTROS",
    "MARCA": "MANN",
    "STOCK": 50,
    "PRECIO": 35000
  }'
```

### Registrar una entrada (aumenta stock)

```bash
curl -X POST http://localhost:3000/api/entradas \
  -H "Content-Type: application/json" \
  -d '{
    "N_FACTURA": "F-001",
    "PROVEEDOR": "Proveedor XYZ",
    "FECHA": "2024-01-15",
    "CB": "100999",
    "DESCRIPCION": "Compra de filtros",
    "CANTIDAD": 10,
    "COSTO": 30000
  }'
```

### Registrar una salida (reduce stock)

```bash
curl -X POST http://localhost:3000/api/salidas \
  -H "Content-Type: application/json" \
  -d '{
    "n_factura": 1001,
    "fecha": "2024-01-15",
    "cb": "100999",
    "descripcion": "Venta a cliente",
    "cantidad": 5,
    "valor": 175000
  }'
```

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- No ejecutaste el SQL en Supabase
- Ve a SQL Editor y ejecuta `entradas_full_corregidas.sql`

### Error: "Invalid API key"
- Verifica las credenciales en `.env`
- Asegúrate de que no haya espacios extra

### Error: "permission denied"
- Las políticas RLS están bloqueando
- Ve a Supabase → Authentication → Policies
- Verifica que las políticas "allow_all_*" estén activas

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la documentación en los archivos MD
2. Verifica los logs en Supabase Dashboard
3. Ejecuta `pnpm run test:db` para diagnosticar

## 📄 Licencia

ISC

---

**Desarrollado para Mazda** 🚗

