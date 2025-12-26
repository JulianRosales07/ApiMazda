# 🔧 Instrucciones para Implementar Caja Fuerte

## ❌ Error Actual

```
Error: Could not find the function public.registrar_movimiento_caja_fuerte
```

**Causa:** La función no existe en la base de datos porque el schema no se ha ejecutado.

---

## ✅ Solución - Ejecutar Migración

### Paso 1: Abrir Supabase SQL Editor

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**

### Paso 2: Copiar y Ejecutar el Script

1. Abre el archivo: `migration-caja-fuerte.sql`
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** (o presiona Ctrl+Enter)

### Paso 3: Verificar que se Ejecutó Correctamente

Deberías ver mensajes como:
```
✓ Tabla caja_fuerte creada
✓ Función obtener_saldo_caja_fuerte creada
✓ Función registrar_movimiento_caja_fuerte creada
✓ Políticas RLS creadas
✓ saldo_inicial: 0
```

---

## 🧪 Probar que Funciona

### Opción 1: Desde Supabase SQL Editor

```sql
-- Probar registrar un depósito
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    100000,
    'Depósito inicial de prueba',
    1,
    NULL,
    'Prueba desde SQL'
);

-- Ver el saldo
SELECT obtener_saldo_caja_fuerte();

-- Ver todos los movimientos
SELECT * FROM caja_fuerte ORDER BY fecha DESC;
```

### Opción 2: Desde tu Frontend

```javascript
const BASE_URL = 'https://apimazda.onrender.com';

// 1. Verificar saldo
const saldoRes = await fetch(`${BASE_URL}/api/caja/caja-fuerte/saldo`);
const saldo = await saldoRes.json();
console.log('Saldo:', saldo);

// 2. Registrar depósito
const depositoRes = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo_movimiento: 'DEPOSITO',
    monto: 100000,
    descripcion: 'Depósito de prueba',
    usuario_registro: 1
  })
});
const resultado = await depositoRes.json();
console.log('Resultado:', resultado);
```

### Opción 3: Desde cURL

```bash
# Verificar saldo
curl https://apimazda.onrender.com/api/caja/caja-fuerte/saldo

# Registrar depósito
curl -X POST https://apimazda.onrender.com/api/caja/caja-fuerte/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_movimiento": "DEPOSITO",
    "monto": 100000,
    "descripcion": "Depósito de prueba",
    "usuario_registro": 1
  }'
```

---

## 🔍 Verificar que la Tabla Existe

Ejecuta en Supabase SQL Editor:

```sql
-- Ver si la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'caja_fuerte';

-- Ver las columnas de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'caja_fuerte'
ORDER BY ordinal_position;

-- Ver las funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%caja_fuerte%';
```

---

## ⚠️ Problemas Comunes

### Problema 1: "relation caja_fuerte already exists"

**Solución:** La tabla ya existe. Ejecuta solo las funciones:

```sql
-- Solo ejecutar las funciones
CREATE OR REPLACE FUNCTION obtener_saldo_caja_fuerte()
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    v_saldo DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(saldo_nuevo, 0) INTO v_saldo
    FROM caja_fuerte
    WHERE activo = TRUE
    ORDER BY fecha DESC, id_movimiento DESC
    LIMIT 1;
    
    RETURN COALESCE(v_saldo, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION registrar_movimiento_caja_fuerte(
    p_tipo_movimiento VARCHAR(20),
    p_monto DECIMAL(15, 2),
    p_descripcion TEXT,
    p_usuario_registro INTEGER,
    p_caja_id INTEGER DEFAULT NULL,
    p_observaciones TEXT DEFAULT NULL
)
RETURNS TABLE(
    id_movimiento INTEGER,
    saldo_anterior DECIMAL(15, 2),
    saldo_nuevo DECIMAL(15, 2)
) AS $$
DECLARE
    v_saldo_actual DECIMAL(15, 2);
    v_nuevo_saldo DECIMAL(15, 2);
    v_id_movimiento INTEGER;
BEGIN
    v_saldo_actual := obtener_saldo_caja_fuerte();
    
    IF p_tipo_movimiento = 'DEPOSITO' THEN
        v_nuevo_saldo := v_saldo_actual + p_monto;
    ELSIF p_tipo_movimiento = 'RETIRO' THEN
        IF v_saldo_actual < p_monto THEN
            RAISE EXCEPTION 'Saldo insuficiente en caja fuerte. Saldo actual: %, Retiro solicitado: %', v_saldo_actual, p_monto;
        END IF;
        v_nuevo_saldo := v_saldo_actual - p_monto;
    ELSE
        RAISE EXCEPTION 'Tipo de movimiento inválido: %', p_tipo_movimiento;
    END IF;
    
    INSERT INTO caja_fuerte (
        tipo_movimiento,
        monto,
        saldo_anterior,
        saldo_nuevo,
        descripcion,
        caja_id,
        usuario_registro,
        observaciones
    ) VALUES (
        p_tipo_movimiento,
        p_monto,
        v_saldo_actual,
        v_nuevo_saldo,
        p_descripcion,
        p_caja_id,
        p_usuario_registro,
        p_observaciones
    ) RETURNING caja_fuerte.id_movimiento INTO v_id_movimiento;
    
    RETURN QUERY SELECT 
        v_id_movimiento,
        v_saldo_actual,
        v_nuevo_saldo;
END;
$$ LANGUAGE plpgsql;
```

### Problema 2: "function actualizar_fecha_actualizacion does not exist"

**Solución:** Crear la función primero:

```sql
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Problema 3: Error de permisos RLS

**Solución:** Cambiar las políticas a permisivas temporalmente:

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Solo administradores pueden ver caja fuerte" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden registrar movimientos" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar movimientos" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar movimientos" ON caja_fuerte;

-- Crear políticas permisivas (para desarrollo)
CREATE POLICY "allow_all_caja_fuerte" ON caja_fuerte
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);
```

---

## 📋 Checklist de Verificación

Después de ejecutar la migración, verifica:

- [ ] La tabla `caja_fuerte` existe
- [ ] La función `obtener_saldo_caja_fuerte()` existe
- [ ] La función `registrar_movimiento_caja_fuerte()` existe
- [ ] Las políticas RLS están activas
- [ ] Puedes consultar el saldo desde la API
- [ ] Puedes registrar un depósito desde la API
- [ ] El frontend ya no muestra el error 500

---

## 🆘 Si Aún No Funciona

1. **Verifica la conexión a Supabase:**
   ```javascript
   // En tu código
   console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
   console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Configurada' : 'NO configurada');
   ```

2. **Verifica que el backend esté actualizado:**
   - Asegúrate de que `src/models/caja.model.js` tenga las funciones de caja fuerte
   - Asegúrate de que `src/routes/caja.routes.js` tenga las rutas de caja fuerte
   - Reinicia el servidor: `pnpm start`

3. **Revisa los logs del servidor:**
   - Busca errores en la consola del servidor
   - Verifica que las rutas se estén registrando correctamente

4. **Prueba directamente en Supabase:**
   ```sql
   -- Esto debe funcionar sin errores
   SELECT * FROM registrar_movimiento_caja_fuerte(
       'DEPOSITO',
       50000,
       'Prueba',
       1,
       NULL,
       NULL
   );
   ```

---

## ✅ Resultado Esperado

Después de seguir estos pasos, deberías poder:

1. ✅ Consultar el saldo de caja fuerte
2. ✅ Registrar depósitos
3. ✅ Registrar retiros
4. ✅ Ver historial de movimientos
5. ✅ Sin errores 500 en el frontend

---

**¿Necesitas ayuda?** Revisa los logs del servidor y de Supabase para más detalles del error.
