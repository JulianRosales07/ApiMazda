# Implementación de Saldos en Proveedores

## ✅ Cambios Realizados en el Backend

### 1. Modelo de Proveedor (`src/models/proveedor.model.js`)

Se actualizaron las funciones para incluir los campos `saldo_a_favor` y `saldo_en_contra`:

- **`createProveedor`**: Ahora acepta y guarda los campos de saldo al crear un proveedor
- **`updateProveedor`**: Ahora acepta y actualiza los campos de saldo (solo si están presentes en la petición)

### 2. Controlador de Proveedor (`src/controllers/proveedor.controller.js`)

- **`actualizarProveedor`**: Ahora devuelve el proveedor actualizado con todos sus campos (incluyendo los saldos)

## 📋 Pasos para Completar la Implementación

### Paso 1: Ejecutar la Migración en Supabase

1. Abre tu proyecto en Supabase (https://supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `migration_add_saldos_proveedores.sql`
5. Ejecuta la query (botón "Run" o Ctrl+Enter)

Esto agregará las columnas:
- `saldo_a_favor` (DECIMAL 10,2) - Saldo que el proveedor nos debe
- `saldo_en_contra` (DECIMAL 10,2) - Saldo que nosotros le debemos al proveedor

### Paso 2: Verificar la Migración

Ejecuta esta query en Supabase para verificar que las columnas se crearon:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
AND column_name IN ('saldo_a_favor', 'saldo_en_contra');
```

### Paso 3: Reiniciar el Servidor Backend

```bash
# Detener el servidor si está corriendo (Ctrl+C)
# Luego reiniciarlo
node server.js
```

### Paso 4: Probar la Funcionalidad

1. **Crear un proveedor con saldos:**
```bash
curl -X POST http://localhost:3000/api/proveedores \
  -H "Content-Type: application/json" \
  -d '{
    "cp": "TEST001",
    "nombre_proveedor": "Proveedor Test",
    "ci": "12345678",
    "costo": 100,
    "saldo_a_favor": 5000,
    "saldo_en_contra": 2000
  }'
```

2. **Actualizar un proveedor existente:**
```bash
curl -X PUT http://localhost:3000/api/proveedores/20 \
  -H "Content-Type: application/json" \
  -d '{
    "cp": "ABIN",
    "nombre_proveedor": "ABIN",
    "saldo_a_favor": 5000,
    "saldo_en_contra": 2000
  }'
```

3. **Obtener todos los proveedores (verificar que incluyan los saldos):**
```bash
curl http://localhost:3000/api/proveedores
```

## 🔍 Verificación en el Frontend

Una vez completados los pasos anteriores:

1. Abre el frontend
2. Ve a la sección de Proveedores
3. Edita un proveedor (por ejemplo ABIN)
4. Llena los campos:
   - Saldo a Favor: 5000
   - Saldo en Contra: 2000
5. Guarda
6. Verifica en la consola del navegador los logs:
   - `💾 Datos a guardar:` - Debe mostrar los campos saldo_a_favor y saldo_en_contra
   - `✅ Proveedor actualizado:` - Debe mostrar el proveedor con los saldos guardados
7. Recarga la página y verifica que los saldos se muestren correctamente en la tabla

## 📊 Estructura de Datos

### Request (Crear/Actualizar):
```json
{
  "cp": "ABIN",
  "nombre_proveedor": "ABIN",
  "ci": "12345678",
  "costo": 100,
  "saldo_a_favor": 5000,
  "saldo_en_contra": 2000
}
```

### Response:
```json
{
  "success": true,
  "message": "Proveedor actualizado correctamente",
  "data": {
    "id_proveedor": 20,
    "cp": "ABIN",
    "nombre_proveedor": "ABIN",
    "ci": "12345678",
    "costo": 100,
    "saldo_a_favor": 5000,
    "saldo_en_contra": 2000,
    "activo": true,
    "fecha_creacion": "2025-11-21T20:26:37.188662",
    "fecha_actualizacion": "2025-12-09T17:05:32.057979"
  }
}
```

## ⚠️ Notas Importantes

1. Los campos de saldo son opcionales al actualizar. Si no se envían, no se modificarán.
2. Los valores por defecto son 0 para ambos campos.
3. Los saldos se almacenan como DECIMAL(10,2) para permitir hasta 99,999,999.99
4. El backend ahora devuelve el proveedor actualizado completo en la respuesta.

## 🐛 Troubleshooting

### Si los saldos no aparecen en el frontend:
1. Verifica que la migración se ejecutó correctamente en Supabase
2. Reinicia el servidor backend
3. Limpia la caché del navegador (Ctrl+Shift+R)
4. Verifica los logs de la consola del navegador

### Si hay errores al guardar:
1. Verifica que los valores sean números válidos
2. Revisa los logs del servidor backend
3. Verifica que las columnas existan en la tabla de Supabase
