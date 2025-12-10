# 📊 Sistema de Historial de Precios

Sistema completo para rastrear y gestionar el historial de cambios de precios de repuestos por proveedor.

## 🎯 Características

- ✅ Registro automático de cambios de precio mediante triggers
- ✅ Consulta de historial con múltiples filtros
- ✅ Estadísticas de precios (mínimo, máximo, promedio)
- ✅ Comparación de precios entre proveedores
- ✅ CRUD completo para gestión manual
- ✅ Soft delete para mantener integridad histórica

## 📦 Archivos Creados

1. **migration_historial_precios.sql** - Schema de base de datos
2. **src/models/historialPrecios.model.js** - Lógica de datos
3. **src/controllers/historialPrecios.controller.js** - Controladores
4. **src/routes/historialPrecios.routes.js** - Endpoints API

## 🗄️ Estructura de la Base de Datos

### Tabla: `historial_precios`

```sql
- id_historial (SERIAL PRIMARY KEY)
- producto_cb (VARCHAR) - FK a repuestos
- proveedor_id (INTEGER) - FK a proveedores
- precio_anterior (DECIMAL) - Precio antes del cambio
- precio_nuevo (DECIMAL) - Precio después del cambio
- fecha_cambio (TIMESTAMP) - Fecha del cambio
- usuario_modificacion (VARCHAR) - Usuario que hizo el cambio
- motivo_cambio (TEXT) - Razón del cambio
- activo (BOOLEAN) - Para soft delete
```

### Trigger Automático

El sistema registra automáticamente cambios de precio cuando:
- Se actualiza el precio en `producto_proveedor`
- Se crea una nueva relación producto-proveedor

## 🚀 Instalación

### 1. Ejecutar la migración

```bash
# Conectarse a PostgreSQL/Supabase y ejecutar:
psql -U usuario -d database -f migration_historial_precios.sql
```

O desde Supabase Dashboard:
- SQL Editor → Pegar contenido de `migration_historial_precios.sql` → Run

### 2. Verificar instalación

```sql
-- Verificar que la tabla existe
SELECT * FROM historial_precios LIMIT 1;

-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_cambio_precio';

-- Verificar que la función RPC existe
SELECT * FROM pg_proc WHERE proname = 'get_historial_precios_completo';
```

## 📡 Endpoints API

### 1. Obtener Historial con Filtros

```http
GET /api/historial-precios?producto_cb=1000001&proveedor_id=1&limit=50
```

**Query Parameters:**
- `producto_cb` (opcional) - Filtrar por producto
- `proveedor_id` (opcional) - Filtrar por proveedor
- `fecha_desde` (opcional) - Fecha inicio (YYYY-MM-DD)
- `fecha_hasta` (opcional) - Fecha fin (YYYY-MM-DD)
- `limit` (opcional) - Límite de resultados (default: 100)

**Respuesta:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id_historial": 1,
      "producto_cb": "1000001",
      "producto_nombre": "Filtro de Aceite",
      "proveedor_id": 1,
      "proveedor_nombre": "Proveedor ABC",
      "proveedor_cp": "P001",
      "precio_anterior": 150.00,
      "precio_nuevo": 175.00,
      "diferencia": 25.00,
      "porcentaje_cambio": 16.67,
      "fecha_cambio": "2024-12-10T10:30:00",
      "usuario_modificacion": "admin",
      "motivo_cambio": "Ajuste por inflación"
    }
  ]
}
```

### 2. Historial por Producto

```http
GET /api/historial-precios/producto/1000001?limit=20
```

### 3. Historial por Proveedor

```http
GET /api/historial-precios/proveedor/1?limit=20
```

### 4. Historial Producto-Proveedor Específico

```http
GET /api/historial-precios/producto/1000001/proveedor/1
```

### 5. Estadísticas de Precios

```http
GET /api/historial-precios/estadisticas/1000001/1
```

**Respuesta:**
```json
{
  "success": true,
  "producto_cb": "1000001",
  "proveedor_id": 1,
  "data": {
    "precio_actual": 175.00,
    "precio_minimo": 120.00,
    "precio_maximo": 180.00,
    "precio_promedio": 155.50,
    "total_cambios": 8
  }
}
```

### 6. Comparar Proveedores

```http
GET /api/historial-precios/comparar/1000001?fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

**Respuesta:**
```json
{
  "success": true,
  "producto_cb": "1000001",
  "periodo": {
    "desde": "2024-01-01",
    "hasta": "2024-12-31"
  },
  "count": 3,
  "data": [
    {
      "proveedor_id": 1,
      "precio_nuevo": 175.00,
      "fecha_cambio": "2024-12-10",
      "proveedores": {
        "nombre_proveedor": "Proveedor ABC",
        "cp": "P001"
      }
    }
  ]
}
```

### 7. Crear Registro Manual

```http
POST /api/historial-precios
Content-Type: application/json

{
  "producto_cb": "1000001",
  "proveedor_id": 1,
  "precio_anterior": 150.00,
  "precio_nuevo": 175.00,
  "motivo_cambio": "Ajuste manual por error en sistema"
}
```

### 8. Actualizar Registro

```http
PUT /api/historial-precios/1
Content-Type: application/json

{
  "motivo_cambio": "Corrección: Ajuste por inflación anual",
  "usuario_modificacion": "admin"
}
```

### 9. Eliminar Registro (Soft Delete)

```http
DELETE /api/historial-precios/1
```

## 💡 Casos de Uso

### Caso 1: Ver historial completo de un repuesto

```javascript
// Obtener todos los cambios de precio de un repuesto
const response = await fetch('/api/historial-precios/producto/1000001');
const data = await response.json();
```

### Caso 2: Comparar precios entre proveedores en el último mes

```javascript
const fechaHasta = new Date().toISOString().split('T')[0];
const fechaDesde = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];

const response = await fetch(
  `/api/historial-precios/comparar/1000001?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`
);
```

### Caso 3: Ver estadísticas de un producto con un proveedor

```javascript
const response = await fetch('/api/historial-precios/estadisticas/1000001/1');
const stats = await response.json();

console.log(`Precio actual: $${stats.data.precio_actual}`);
console.log(`Precio mínimo histórico: $${stats.data.precio_minimo}`);
console.log(`Precio máximo histórico: $${stats.data.precio_maximo}`);
```

### Caso 4: Registrar cambio manual de precio

```javascript
// Cuando se actualiza manualmente un precio
const response = await fetch('/api/historial-precios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    producto_cb: '1000001',
    proveedor_id: 1,
    precio_anterior: 150.00,
    precio_nuevo: 175.00,
    motivo_cambio: 'Negociación con proveedor'
  })
});
```

## 🔄 Funcionamiento Automático

El sistema registra automáticamente cambios cuando:

### Al actualizar precio en producto_proveedor:

```javascript
// Esto automáticamente crea un registro en historial_precios
await fetch('/api/producto-proveedor/1', {
  method: 'PUT',
  body: JSON.stringify({
    precio_proveedor: 175.00  // Cambio de 150 a 175
  })
});
```

### Al crear nueva relación producto-proveedor:

```javascript
// Esto registra el precio inicial en el historial
await fetch('/api/producto-proveedor', {
  method: 'POST',
  body: JSON.stringify({
    producto_cb: '1000001',
    proveedor_id: 1,
    precio_proveedor: 150.00
  })
});
```

## 📊 Consultas SQL Útiles

### Ver últimos 10 cambios de precio

```sql
SELECT * FROM get_historial_precios_completo(NULL, NULL, NULL, NULL, 10);
```

### Ver cambios de un producto específico

```sql
SELECT * FROM get_historial_precios_completo('1000001', NULL, NULL, NULL, 50);
```

### Ver cambios en un rango de fechas

```sql
SELECT * FROM get_historial_precios_completo(
  NULL, 
  NULL, 
  '2024-01-01'::timestamp, 
  '2024-12-31'::timestamp, 
  100
);
```

### Productos con más cambios de precio

```sql
SELECT 
  producto_cb,
  COUNT(*) as total_cambios,
  MAX(precio_nuevo) as precio_max,
  MIN(precio_nuevo) as precio_min
FROM historial_precios
WHERE activo = true
GROUP BY producto_cb
ORDER BY total_cambios DESC
LIMIT 10;
```

## 🔐 Seguridad

- Todas las rutas requieren autenticación (token JWT)
- Soft delete mantiene integridad histórica
- Triggers automáticos previenen pérdida de datos
- Índices optimizan consultas frecuentes

## 🎨 Integración con Frontend

### Ejemplo de componente React para mostrar historial:

```jsx
function HistorialPrecios({ productoCB, proveedorId }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    fetch(`/api/historial-precios/producto/${productoCB}/proveedor/${proveedorId}`)
      .then(res => res.json())
      .then(data => setHistorial(data.data));
  }, [productoCB, proveedorId]);

  return (
    <div>
      <h3>Historial de Precios</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Precio Anterior</th>
            <th>Precio Nuevo</th>
            <th>Cambio</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {historial.map(h => (
            <tr key={h.id_historial}>
              <td>{new Date(h.fecha_cambio).toLocaleDateString()}</td>
              <td>${h.precio_anterior || '-'}</td>
              <td>${h.precio_nuevo}</td>
              <td className={h.diferencia > 0 ? 'aumento' : 'disminucion'}>
                {h.porcentaje_cambio ? `${h.porcentaje_cambio}%` : '-'}
              </td>
              <td>{h.motivo_cambio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## ✅ Testing

### Probar la instalación:

```bash
# 1. Ejecutar migración
psql -f migration_historial_precios.sql

# 2. Iniciar servidor
npm start

# 3. Probar endpoint
curl http://localhost:3000/api/historial-precios
```

## 🐛 Troubleshooting

### Error: "función get_historial_precios_completo no existe"
- Ejecutar nuevamente la migración SQL
- Verificar permisos de usuario en PostgreSQL

### No se registran cambios automáticamente
- Verificar que el trigger está activo: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_cambio_precio'`
- Verificar que la función `registrar_cambio_precio()` existe

### Consultas lentas
- Los índices ya están creados en la migración
- Para grandes volúmenes, considerar particionamiento por fecha

## 📝 Notas Importantes

1. El historial se registra automáticamente, no necesitas llamar manualmente al crear/actualizar precios
2. Los registros nunca se eliminan físicamente (soft delete)
3. El campo `precio_anterior` es NULL para el primer registro de cada producto-proveedor
4. Las estadísticas se calculan en tiempo real
5. Todos los endpoints requieren autenticación JWT

## 🎉 ¡Listo!

El sistema de historial de precios está completamente implementado y listo para usar.
