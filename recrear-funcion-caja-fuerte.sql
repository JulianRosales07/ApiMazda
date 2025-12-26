-- =====================================================
-- RECREAR FUNCIÓN: registrar_movimiento_caja_fuerte
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- PASO 1: Eliminar la función si existe (con todos los parámetros posibles)
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(DECIMAL);
DROP FUNCTION IF EXISTS public.registrar_movimiento_caja_fuerte CASCADE;

-- PASO 2: Recrear la función obtener_saldo_caja_fuerte
DROP FUNCTION IF EXISTS obtener_saldo_caja_fuerte();

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

-- PASO 3: Recrear la función registrar_movimiento_caja_fuerte
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
    -- Obtener saldo actual
    v_saldo_actual := obtener_saldo_caja_fuerte();
    
    -- Calcular nuevo saldo
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
    
    -- Insertar movimiento
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
    
    -- Retornar información del movimiento
    RETURN QUERY SELECT 
        v_id_movimiento,
        v_saldo_actual,
        v_nuevo_saldo;
END;
$$;

-- PASO 4: Dar permisos públicos a las funciones
GRANT EXECUTE ON FUNCTION obtener_saldo_caja_fuerte() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT) TO anon, authenticated;

-- PASO 5: Verificar que las funciones se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%caja_fuerte%'
ORDER BY routine_name;

-- PASO 6: Probar la función
SELECT 'Probando función obtener_saldo_caja_fuerte...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_actual;

SELECT 'Probando función registrar_movimiento_caja_fuerte...' as test;
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    50000,
    'Prueba después de recrear función',
    1,
    NULL,
    'Test'
);

-- PASO 7: Verificar el resultado
SELECT 'Verificando movimiento creado...' as test;
SELECT * FROM caja_fuerte ORDER BY fecha DESC LIMIT 1;

SELECT 'Verificando nuevo saldo...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_final;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Deberías ver:
-- 1. Lista de funciones creadas
-- 2. Saldo actual
-- 3. Resultado del depósito (id_movimiento, saldo_anterior, saldo_nuevo)
-- 4. Movimiento en la tabla
-- 5. Nuevo saldo

SELECT '✅ Funciones recreadas correctamente' as status;
