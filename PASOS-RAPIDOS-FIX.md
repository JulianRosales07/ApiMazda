# 🚀 Solución Rápida - Error 500 Caja Fuerte

## ❌ Error Actual
```
Error: Could not find the function public.registrar_movimiento_caja_fuerte(p_monto) in the schema cache
Status: 500
```

---

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Abrir Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** (menú izquierdo)
4. Click en **New Query**

---

### PASO 2: Ejecutar Script de Reparación

Copia y pega TODO el contenido del archivo `recrear-funcion-caja-fuerte.sql` en el editor SQL.

O copia esto directamente:

```sql
-- ELIMINAR FUNCIONES ANTIGUAS
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(DECIMAL);
DROP FUNCTION IF EXISTS public.registrar_movimiento_caja_fuerte CASCADE;
DROP FUNCTION IF EXISTS obtener_saldo_caja_fuerte();

-- CREAR FUNCIÓN DE SALDO
CREATE OR REPLACE FUNCTION obtener_saldo_caja_fuerte()
RETURNS DECIMAL(15, 2) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- CREAR FUNCIÓN DE REGISTRO
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- DAR PERMISOS
GRANT EXECUTE ON FUNCTION obtener_saldo_caja_fuerte() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT) TO anon, authenticated;

-- VERIFICAR
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%caja_fuerte%';
```

**Click en RUN** (o presiona Ctrl+Enter)

---

### PASO 3: Verificar que Funcionó

Ejecuta esta prueba en el mismo SQL Editor:

```sql
-- Probar depósito
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    50000,
    'Prueba de función',
    1,
    NULL,
    'Test'
);

-- Ver saldo
SELECT obtener_saldo_caja_fuerte();
```

**Resultado esperado:**
```
id_movimiento | saldo_anterior | saldo_nuevo
1             | 0              | 50000
```

Si ves esto, ¡funcionó! ✅

---

## 🎯 Probar desde Frontend

Ahora intenta registrar un movimiento desde tu aplicación. El error 500 debería desaparecer.

---

## ⚠️ Si Aún Falla

1. **Verifica que las funciones existen:**
   ```sql
   SELECT routine_name, routine_type 
   FROM information_schema.routines
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%caja_fuerte%';
   ```
   
   Deberías ver 2 funciones:
   - `obtener_saldo_caja_fuerte`
   - `registrar_movimiento_caja_fuerte`

2. **Verifica permisos:**
   ```sql
   SELECT * FROM information_schema.routine_privileges
   WHERE routine_name LIKE '%caja_fuerte%';
   ```

3. **Reinicia el servidor backend:**
   ```bash
   # Detener (Ctrl+C)
   # Iniciar de nuevo
   pnpm start
   ```

---

## 📋 Checklist

- [ ] Ejecuté el script en Supabase SQL Editor
- [ ] Vi el mensaje de éxito (2 funciones creadas)
- [ ] Probé la función con el SELECT de prueba
- [ ] El frontend ya no muestra error 500
- [ ] Puedo registrar depósitos y retiros

---

**¿Listo?** Ejecuta el script y prueba desde tu aplicación. ¡Debería funcionar! 🚀
