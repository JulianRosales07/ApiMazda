-- =====================================================
-- SCRIPT DE VERIFICACIÓN - Caja Fuerte
-- Ejecutar en Supabase SQL Editor para diagnosticar
-- =====================================================

-- ============================================
-- PASO 1: Verificar si la tabla existe
-- ============================================

SELECT '📋 PASO 1: Verificar tabla caja_fuerte' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'caja_fuerte';

-- Resultado esperado: 1 fila con table_name = 'caja_fuerte'
-- Si no aparece nada, ejecutar primero: schema-caja.sql

-- ============================================
-- PASO 2: Verificar si las funciones existen
-- ============================================

SELECT '📋 PASO 2: Verificar funciones PostgreSQL' as info;

SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname LIKE '%caja_fuerte%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Resultado esperado: 2 funciones
-- 1. obtener_saldo_caja_fuerte()
-- 2. registrar_movimiento_caja_fuerte(p_tipo_movimiento, p_monto, p_descripcion, p_usuario_registro, p_caja_id, p_observaciones)

-- Si no aparecen, ejecutar: FIX-COMPLETO-CAJA-FUERTE.sql

-- ============================================
-- PASO 3: Verificar permisos de las funciones
-- ============================================

SELECT '📋 PASO 3: Verificar permisos' as info;

SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name LIKE '%caja_fuerte%'
AND routine_schema = 'public'
ORDER BY routine_name, grantee;

-- Resultado esperado: Permisos EXECUTE para anon y authenticated

-- ============================================
-- PASO 4: Verificar políticas RLS
-- ============================================

SELECT '📋 PASO 4: Verificar políticas RLS' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'caja_fuerte'
ORDER BY policyname;

-- Resultado esperado: 4 políticas permisivas (allow_all_*)

-- ============================================
-- PASO 5: Probar función obtener_saldo_caja_fuerte
-- ============================================

SELECT '🧪 PASO 5: Probar obtener_saldo_caja_fuerte()' as test;

SELECT obtener_saldo_caja_fuerte() as saldo_actual;

-- Resultado esperado: Un número (puede ser 0 si no hay movimientos)
-- Si falla: La función no existe, ejecutar FIX-COMPLETO-CAJA-FUERTE.sql

-- ============================================
-- PASO 6: Probar función registrar_movimiento_caja_fuerte
-- ============================================

SELECT '🧪 PASO 6: Probar registrar_movimiento_caja_fuerte()' as test;

SELECT * FROM registrar_movimiento_caja_fuerte(
    'DEPOSITO',           -- p_tipo_movimiento
    10000.00,             -- p_monto
    'Prueba de verificación', -- p_descripcion
    1,                    -- p_usuario_registro
    NULL,                 -- p_caja_id
    'Test de diagnóstico' -- p_observaciones
);

-- Resultado esperado: 
-- id_movimiento | saldo_anterior | saldo_nuevo
-- 1             | 0              | 10000

-- Si falla: La función no existe o tiene errores

-- ============================================
-- PASO 7: Verificar el movimiento creado
-- ============================================

SELECT '🧪 PASO 7: Verificar movimiento en tabla' as test;

SELECT 
    id_movimiento,
    tipo_movimiento,
    monto,
    saldo_anterior,
    saldo_nuevo,
    descripcion,
    fecha,
    activo
FROM caja_fuerte
WHERE descripcion LIKE '%verificación%'
ORDER BY fecha DESC
LIMIT 1;

-- Resultado esperado: El movimiento de prueba que acabamos de crear

-- ============================================
-- PASO 8: Verificar saldo actualizado
-- ============================================

SELECT '🧪 PASO 8: Verificar saldo actualizado' as test;

SELECT obtener_saldo_caja_fuerte() as saldo_final;

-- Resultado esperado: 10000 (o más si ya había movimientos)

-- ============================================
-- DIAGNÓSTICO FINAL
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║                  DIAGNÓSTICO COMPLETO                      ║
╚════════════════════════════════════════════════════════════╝

Si todos los pasos anteriores funcionaron:
✅ La tabla existe
✅ Las funciones existen
✅ Los permisos están configurados
✅ Las políticas RLS están activas
✅ Las funciones funcionan correctamente

Si algún paso falló:
❌ Ejecutar FIX-COMPLETO-CAJA-FUERTE.sql

Después de ejecutar el fix:
1. Esperar 1-2 minutos (cache de Supabase)
2. Ejecutar este script de nuevo
3. Probar desde el backend/frontend

' as "RESULTADO DEL DIAGNÓSTICO";

-- ============================================
-- OPCIONAL: Limpiar movimiento de prueba
-- ============================================

-- Descomenta la siguiente línea para eliminar el movimiento de prueba:
-- DELETE FROM caja_fuerte WHERE descripcion LIKE '%verificación%';

-- ============================================
-- INFORMACIÓN ADICIONAL
-- ============================================

SELECT '📊 INFORMACIÓN ADICIONAL' as info;

-- Contar movimientos totales
SELECT 
    'Total de movimientos' as metrica,
    COUNT(*) as valor
FROM caja_fuerte
WHERE activo = true

UNION ALL

-- Contar depósitos
SELECT 
    'Total depósitos' as metrica,
    COUNT(*) as valor
FROM caja_fuerte
WHERE activo = true AND tipo_movimiento = 'DEPOSITO'

UNION ALL

-- Contar retiros
SELECT 
    'Total retiros' as metrica,
    COUNT(*) as valor
FROM caja_fuerte
WHERE activo = true AND tipo_movimiento = 'RETIRO'

UNION ALL

-- Saldo actual
SELECT 
    'Saldo actual' as metrica,
    obtener_saldo_caja_fuerte() as valor;

-- =====================================================
-- FIN DEL DIAGNÓSTICO
-- =====================================================
