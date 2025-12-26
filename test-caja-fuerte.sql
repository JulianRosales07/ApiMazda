-- =====================================================
-- PRUEBAS: Caja Fuerte
-- Ejecutar este script en Supabase SQL Editor para probar
-- =====================================================

-- 1. Verificar que la tabla existe
SELECT 'Verificando tabla...' as test;
SELECT COUNT(*) as registros_actuales FROM caja_fuerte;

-- 2. Verificar saldo inicial (debe ser 0 si no hay movimientos)
SELECT 'Verificando saldo inicial...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_actual;

-- 3. Registrar un depósito de prueba
SELECT 'Registrando depósito de prueba...' as test;
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    100000,
    'Depósito de prueba desde SQL',
    1,
    NULL,
    'Prueba inicial'
);

-- 4. Verificar nuevo saldo (debe ser 100000)
SELECT 'Verificando nuevo saldo...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_despues_deposito;

-- 5. Registrar otro depósito
SELECT 'Registrando segundo depósito...' as test;
SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',
    50000,
    'Segundo depósito de prueba',
    1,
    NULL,
    NULL
);

-- 6. Verificar saldo (debe ser 150000)
SELECT 'Verificando saldo después de segundo depósito...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_total;

-- 7. Registrar un retiro
SELECT 'Registrando retiro de prueba...' as test;
SELECT * FROM registrar_movimiento_caja_fuerte(
    'RETIRO',
    30000,
    'Retiro de prueba',
    1,
    NULL,
    'Prueba de retiro'
);

-- 8. Verificar saldo final (debe ser 120000)
SELECT 'Verificando saldo final...' as test;
SELECT obtener_saldo_caja_fuerte() as saldo_final;

-- 9. Ver todos los movimientos
SELECT 'Listando todos los movimientos...' as test;
SELECT 
    id_movimiento,
    tipo_movimiento,
    monto,
    saldo_anterior,
    saldo_nuevo,
    descripcion,
    fecha
FROM caja_fuerte
ORDER BY fecha DESC;

-- 10. Probar retiro con saldo insuficiente (debe fallar)
SELECT 'Probando retiro con saldo insuficiente (debe fallar)...' as test;
-- Esta consulta debe dar error
-- SELECT * FROM registrar_movimiento_caja_fuerte(
--     'RETIRO',
--     999999,
--     'Retiro que debe fallar',
--     1,
--     NULL,
--     NULL
-- );

-- 11. Resumen final
SELECT 'RESUMEN FINAL' as test;
SELECT 
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN tipo_movimiento = 'DEPOSITO' THEN monto ELSE 0 END) as total_depositos,
    SUM(CASE WHEN tipo_movimiento = 'RETIRO' THEN monto ELSE 0 END) as total_retiros,
    obtener_saldo_caja_fuerte() as saldo_actual
FROM caja_fuerte
WHERE activo = TRUE;

-- =====================================================
-- LIMPIAR DATOS DE PRUEBA (opcional)
-- =====================================================
-- Descomenta las siguientes líneas si quieres eliminar los datos de prueba

-- DELETE FROM caja_fuerte WHERE descripcion LIKE '%prueba%';
-- SELECT 'Datos de prueba eliminados' as status;
-- SELECT obtener_saldo_caja_fuerte() as saldo_despues_limpiar;
