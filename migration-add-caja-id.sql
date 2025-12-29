-- =====================================================
-- MIGRACIÓN: Agregar caja_id a ventas y gastos
-- =====================================================

-- Agregar columna caja_id a ventas (opcional, puede ser NULL)
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS caja_id INTEGER REFERENCES cajas(id_caja);

-- Agregar columna caja_id a gastos (opcional, puede ser NULL)
ALTER TABLE gastos 
ADD COLUMN IF NOT EXISTS caja_id INTEGER REFERENCES cajas(id_caja);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_caja_id ON ventas(caja_id);
CREATE INDEX IF NOT EXISTS idx_gastos_caja_id ON gastos(caja_id);

-- Comentarios
COMMENT ON COLUMN ventas.caja_id IS 'Referencia opcional a la caja donde se registró la venta';
COMMENT ON COLUMN gastos.caja_id IS 'Referencia opcional a la caja donde se registró el gasto';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
    v_ventas_caja_id BOOLEAN;
    v_gastos_caja_id BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'caja_id'
    ) INTO v_ventas_caja_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gastos' AND column_name = 'caja_id'
    ) INTO v_gastos_caja_id;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Columna ventas.caja_id: %', CASE WHEN v_ventas_caja_id THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Columna gastos.caja_id: %', CASE WHEN v_gastos_caja_id THEN '✅' ELSE '❌' END;
    RAISE NOTICE '========================================';
    
    IF v_ventas_caja_id AND v_gastos_caja_id THEN
        RAISE NOTICE '✅ MIGRACIÓN EXITOSA';
    ELSE
        RAISE NOTICE '⚠️ MIGRACIÓN INCOMPLETA';
    END IF;
END $$;
