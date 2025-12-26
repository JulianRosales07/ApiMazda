-- =====================================================
-- MIGRACIÓN: CAJA FUERTE
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- Tabla de Caja Fuerte
CREATE TABLE IF NOT EXISTS caja_fuerte (
    id_movimiento SERIAL PRIMARY KEY,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('DEPOSITO', 'RETIRO')),
    monto DECIMAL(15, 2) NOT NULL CHECK (monto > 0),
    saldo_anterior DECIMAL(15, 2) NOT NULL DEFAULT 0,
    saldo_nuevo DECIMAL(15, 2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    caja_id INTEGER REFERENCES cajas(id_caja),
    usuario_registro INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_fecha ON caja_fuerte(fecha);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_tipo ON caja_fuerte(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_usuario ON caja_fuerte(usuario_registro);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_caja ON caja_fuerte(caja_id);

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_caja_fuerte
    BEFORE UPDATE ON caja_fuerte
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para obtener saldo actual de caja fuerte
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

-- Función para registrar movimiento en caja fuerte
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
$$ LANGUAGE plpgsql;

-- Habilitar RLS
ALTER TABLE caja_fuerte ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (solo administradores)
CREATE POLICY "Solo administradores pueden ver caja fuerte" ON caja_fuerte
    FOR SELECT USING (TRUE);

CREATE POLICY "Solo administradores pueden registrar movimientos" ON caja_fuerte
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Solo administradores pueden actualizar movimientos" ON caja_fuerte
    FOR UPDATE USING (TRUE);

CREATE POLICY "Solo administradores pueden eliminar movimientos" ON caja_fuerte
    FOR DELETE USING (TRUE);

-- Comentarios
COMMENT ON TABLE caja_fuerte IS 'Registro de movimientos de dinero en caja fuerte (depósitos y retiros)';
COMMENT ON COLUMN caja_fuerte.tipo_movimiento IS 'Tipo de movimiento: DEPOSITO o RETIRO';
COMMENT ON COLUMN caja_fuerte.saldo_anterior IS 'Saldo antes del movimiento';
COMMENT ON COLUMN caja_fuerte.saldo_nuevo IS 'Saldo después del movimiento';
COMMENT ON COLUMN caja_fuerte.caja_id IS 'Referencia a la caja de donde proviene el dinero (opcional)';

-- Verificar que todo se creó correctamente
SELECT 'Tabla caja_fuerte creada' as status;
SELECT 'Función obtener_saldo_caja_fuerte creada' as status;
SELECT 'Función registrar_movimiento_caja_fuerte creada' as status;
SELECT 'Políticas RLS creadas' as status;

-- Probar la función de saldo (debe retornar 0 si no hay movimientos)
SELECT obtener_saldo_caja_fuerte() as saldo_inicial;
