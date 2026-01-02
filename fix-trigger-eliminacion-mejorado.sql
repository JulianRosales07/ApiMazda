-- =====================================================
-- FIX: Trigger de Eliminación Mejorado
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- ============================================
-- ELIMINAR TRIGGERS ANTERIORES
-- ============================================

DROP TRIGGER IF EXISTS trigger_eliminar_fisicamente_venta ON ventas;
DROP TRIGGER IF EXISTS trigger_eliminar_fisicamente_gasto ON gastos;
DROP FUNCTION IF EXISTS eliminar_fisicamente_soft_delete_venta();
DROP FUNCTION IF EXISTS eliminar_fisicamente_soft_delete_gasto();

SELECT '✅ Triggers anteriores eliminados' as status;

-- ============================================
-- NUEVO ENFOQUE: AFTER UPDATE
-- ============================================

-- Función para ventas - Se ejecuta DESPUÉS del UPDATE
CREATE OR REPLACE FUNCTION eliminar_fisicamente_venta_after()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si se marcó como inactivo, eliminar físicamente
    IF NEW.activo = false AND OLD.activo = true THEN
        -- Eliminar el registro físicamente
        DELETE FROM ventas WHERE id_venta = NEW.id_venta;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_eliminar_fisicamente_venta_after
    AFTER UPDATE ON ventas
    FOR EACH ROW
    WHEN (NEW.activo = false AND OLD.activo = true)
    EXECUTE FUNCTION eliminar_fisicamente_venta_after();

-- Función para gastos - Se ejecuta DESPUÉS del UPDATE
CREATE OR REPLACE FUNCTION eliminar_fisicamente_gasto_after()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si se marcó como inactivo, eliminar físicamente
    IF NEW.activo = false AND OLD.activo = true THEN
        -- Eliminar el registro físicamente
        DELETE FROM gastos WHERE id_gasto = NEW.id_gasto;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_eliminar_fisicamente_gasto_after
    AFTER UPDATE ON gastos
    FOR EACH ROW
    WHEN (NEW.activo = false AND OLD.activo = true)
    EXECUTE FUNCTION eliminar_fisicamente_gasto_after();

SELECT '✅ Nuevos triggers AFTER UPDATE creados' as status;

-- ============================================
-- PRUEBAS
-- ============================================

SELECT '🧪 PRUEBA: Eliminación con AFTER UPDATE' as test;

-- Limpiar
DELETE FROM ventas WHERE factura_descripcion LIKE 'PRUEBA-AFTER-%';

-- Insertar 3 ventas
INSERT INTO ventas (caja_id, factura_descripcion, venta_por, valor, metodo_pago, usuario_registro)
VALUES 
    (13, 'PRUEBA-AFTER-001', 'ALMACEN', 10000, 'EFECTIVO', 4),
    (13, 'PRUEBA-AFTER-002', 'ALMACEN', 20000, 'EFECTIVO', 4),
    (13, 'PRUEBA-AFTER-003', 'ALMACEN', 30000, 'EFECTIVO', 4);

SELECT 'Ventas creadas:' as info;
SELECT id_venta, factura_descripcion, activo FROM ventas WHERE factura_descripcion LIKE 'PRUEBA-AFTER-%' ORDER BY id_venta;

-- Hacer soft delete (debería devolver el registro Y LUEGO eliminarlo físicamente)
UPDATE ventas SET activo = false WHERE factura_descripcion = 'PRUEBA-AFTER-002' RETURNING *;

SELECT 'Después de soft delete (debería estar eliminado físicamente):' as info;
SELECT id_venta, factura_descripcion, activo FROM ventas WHERE factura_descripcion LIKE 'PRUEBA-AFTER-%' ORDER BY id_venta;

-- Verificar que el ID 2 está disponible
SELECT 'Próximo ID disponible:' as info, obtener_proximo_id_venta() as proximo_id;

-- Insertar nueva venta (debería tomar ID 2)
INSERT INTO ventas (caja_id, factura_descripcion, venta_por, valor, metodo_pago, usuario_registro)
VALUES (13, 'PRUEBA-AFTER-004 (debería ser ID 2)', 'ALMACEN', 40000, 'EFECTIVO', 4);

SELECT 'Después de insertar nueva venta:' as info;
SELECT id_venta, factura_descripcion, activo FROM ventas WHERE factura_descripcion LIKE 'PRUEBA-AFTER-%' ORDER BY id_venta;

-- Limpiar
DELETE FROM ventas WHERE factura_descripcion LIKE 'PRUEBA-AFTER-%';

SELECT '✅ Pruebas completadas' as status;

-- ============================================
-- RESULTADO
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ✅ TRIGGER AFTER UPDATE CONFIGURADO                       ║
║                                                            ║
║  Comportamiento:                                           ║
║  1. Backend hace: UPDATE activo = false                   ║
║  2. UPDATE se completa y devuelve el registro             ║
║  3. Trigger AFTER se ejecuta y elimina físicamente        ║
║  4. Backend recibe el registro eliminado (sin error)      ║
║                                                            ║
║  Ventajas:                                                 ║
║  ✅ No hay error 500                                       ║
║  ✅ Backend recibe confirmación                           ║
║  ✅ IDs se reutilizan automáticamente                     ║
║  ✅ Funciona transparentemente                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
' as "RESULTADO";
