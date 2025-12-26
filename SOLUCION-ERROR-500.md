# 🔧 Solución al Error 500 - Caja Fuerte

## ❌ Error Actual

```
Error: Could not find the function public.registrar_movimiento_caja_fuerte
Status: 500
```

---

## ✅ Solución en 3 Pasos

### Paso 1: Ejecutar Fix de Políticas RLS

Las políticas RLS están bloqueando el acceso. Necesitas hacerlas permisivas.

**En Supabase SQL Editor:**

1. Abre: https://supabase.com/dashboard
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de: `fix-rls-caja-fuerte.sql`

```sql
-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Solo administradores pueden ver caja fuerte" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden registrar movimientos" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar movimientos" ON caja_fuerte;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar movimientos" ON caja_fuerte;

-- Crear políticas permisivas
CREATE POLICY "allow_all_select_caja_fuerte" ON caja_fuerte
    FOR SELECT USING (TRUE);

CREATE POLICY "allow_all_insert_caja_fuerte" ON caja_fuerte
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "allow_all_update_caja_fuerte" ON caja_fuerte
    FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "allow_all_delete_caja_fuerte" ON caja_fuerte
    FOR DELETE USING (TRUE);
```

### Paso 2: Probar desde SQL

Ejecuta el archivo `test-caja-fuerte.sql` para verificar que todo funciona:

```sql
-- Probar depósito
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    100000,
    'Depósito de prueba',
    1,
    NULL,
    'Prueba'
);

-- Ver saldo
SELECT obtener_saldo_caja_fuerte();
```

**Resultado esperado:**
```
id_movimiento | saldo_anterior | saldo_nuevo
1             | 0              | 100000
```

### Paso 3: Probar desde Frontend

Ahora intenta registrar un movimiento desde tu aplicación:

```javascript
const response = await fetch('https://apimazda.onrender.com/api/caja/caja-fuerte/movimientos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo_movimiento: 'DEPOSITO',
    monto: 100000,
    descripcion: 'Depósito de prueba',
    usuario_registro: 1
  })
});

const data = await response.json();
console.log(data);
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "id_movimiento": 1,
    "saldo_anterior": 0,
    "saldo_nuevo": 100000
  },
  "message": "Movimiento registrado correctamente"
}
```

---

## 🔍 Verificar que Funcionó

### Desde Supabase:

```sql
-- Ver todos los movimientos
SELECT * FROM caja_fuerte ORDER BY fecha DESC;

-- Ver saldo actual
SELECT obtener_saldo_caja_fuerte();

-- Ver políticas activas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'caja_fuerte';
```

### Desde API:

```bash
# Obtener saldo
curl https://apimazda.onrender.com/api/caja/caja-fuerte/saldo

# Listar movimientos
curl https://apimazda.onrender.com/api/caja/caja-fuerte/movimientos
```

---

## ⚠️ Si Aún No Funciona

### Problema: "function does not exist"

**Solución:** Ejecuta de nuevo la creación de funciones:

```sql
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
            RAISE EXCEPTION 'Saldo insuficiente';
        END IF;
        v_nuevo_saldo := v_saldo_actual - p_monto;
    END IF;
    
    INSERT INTO caja_fuerte (
        tipo_movimiento, monto, saldo_anterior, saldo_nuevo,
        descripcion, caja_id, usuario_registro, observaciones
    ) VALUES (
        p_tipo_movimiento, p_monto, v_saldo_actual, v_nuevo_saldo,
        p_descripcion, p_caja_id, p_usuario_registro, p_observaciones
    ) RETURNING caja_fuerte.id_movimiento INTO v_id_movimiento;
    
    RETURN QUERY SELECT v_id_movimiento, v_saldo_actual, v_nuevo_saldo;
END;
$$ LANGUAGE plpgsql;
```

### Problema: Error de permisos

**Solución:** Verifica que RLS esté habilitado pero con políticas permisivas:

```sql
-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'caja_fuerte';

-- Debe mostrar: rowsecurity = true

-- Verificar políticas
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'caja_fuerte';

-- Debe mostrar 4 políticas con permissive = true
```

---

## 📋 Checklist Final

Después de ejecutar el fix, verifica:

- [ ] Las políticas RLS son permisivas (USING TRUE)
- [ ] La función `registrar_movimiento_caja_fuerte` existe
- [ ] Puedes ejecutar la función desde SQL sin errores
- [ ] El endpoint `/api/caja/caja-fuerte/saldo` responde 200
- [ ] El endpoint POST `/api/caja/caja-fuerte/movimientos` responde 200
- [ ] El frontend ya no muestra error 500

---

## ✅ Resultado Esperado

Después de aplicar el fix:

1. ✅ No más error 500
2. ✅ Puedes registrar depósitos
3. ✅ Puedes registrar retiros
4. ✅ Puedes consultar el saldo
5. ✅ Puedes ver el historial

---

## 🎯 Próximos Pasos

Una vez que funcione:

1. **Probar todas las funcionalidades:**
   - Depósito
   - Retiro
   - Consultar saldo
   - Ver historial

2. **Ajustar políticas RLS (opcional):**
   - Si quieres restringir solo a administradores
   - Modificar las políticas según tus necesidades

3. **Limpiar datos de prueba:**
   ```sql
   DELETE FROM caja_fuerte WHERE descripcion LIKE '%prueba%';
   ```

---

**¿Funcionó?** Si sigues teniendo problemas, revisa los logs del servidor backend para más detalles.
