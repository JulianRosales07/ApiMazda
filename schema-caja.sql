-- =====================================================
-- SCHEMA CAJA FUERTE - VENTAS Y GASTOS
-- PostgreSQL / Supabase
-- Sistema completo para gestión de caja fuerte
-- =====================================================

-- =====================================================
-- PASO 1: CREAR TABLA PRINCIPAL CAJA FUERTE
-- =====================================================

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

-- =====================================================
-- PASO 2: CREAR TABLA DE CATEGORÍAS Y SUBCATEGORÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS categorias_gastos (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategorias_gastos (
    id_subcategoria SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categorias_gastos(id_categoria) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_categoria, nombre)
);

-- =====================================================
-- PASO 3: CREAR TABLA DE VENTAS (INDEPENDIENTE)
-- =====================================================

CREATE TABLE IF NOT EXISTS ventas (
    id_venta SERIAL PRIMARY KEY,
    factura_descripcion TEXT NOT NULL,
    venta_por VARCHAR(50) NOT NULL CHECK (venta_por IN ('REDES', 'ALMACEN')),
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO')),
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    observaciones TEXT,
    usuario_registro INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 4: CREAR TABLA DE GASTOS (INDEPENDIENTE)
-- =====================================================

CREATE TABLE IF NOT EXISTS gastos (
    id_gasto SERIAL PRIMARY KEY,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    id_subcategoria INTEGER REFERENCES subcategorias_gastos(id_subcategoria),
    id_categoria INTEGER NOT NULL REFERENCES categorias_gastos(id_categoria),
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO')),
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    usuario_registro INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 5: CREAR TABLA DE REPORTE VENTAS Y GASTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS reporte_ventas_gastos (
    id_reporte SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_ventas DECIMAL(15, 2) DEFAULT 0,
    total_gastos DECIMAL(15, 2) DEFAULT 0,
    diferencia DECIMAL(15, 2) DEFAULT 0,
    usuario_registro INTEGER REFERENCES usuarios(id_usuario),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 5: CREAR ÍNDICES
-- =====================================================

-- Índices para caja_fuerte
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_fecha ON caja_fuerte(fecha);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_tipo ON caja_fuerte(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_usuario ON caja_fuerte(usuario_registro);
CREATE INDEX IF NOT EXISTS idx_caja_fuerte_caja ON caja_fuerte(caja_id);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_registro);
CREATE INDEX IF NOT EXISTS idx_ventas_venta_por ON ventas(venta_por);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago);

-- Índices para gastos
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_usuario ON gastos(usuario_registro);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_subcategoria ON gastos(id_subcategoria);
CREATE INDEX IF NOT EXISTS idx_gastos_metodo_pago ON gastos(metodo_pago);

-- Índices para reporte_ventas_gastos
CREATE INDEX IF NOT EXISTS idx_reporte_fecha ON reporte_ventas_gastos(fecha);

-- =====================================================
-- PASO 6: CREAR FUNCIONES PRINCIPALES
-- =====================================================

-- Eliminar funciones antiguas si existen
DROP FUNCTION IF EXISTS obtener_saldo_caja_fuerte() CASCADE;
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT, VARCHAR) CASCADE;

-- Función para obtener saldo actual
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
    
    -- Calcular nuevo saldo según tipo
    IF p_tipo_movimiento = 'DEPOSITO' THEN
        v_nuevo_saldo := v_saldo_actual + p_monto;
    ELSIF p_tipo_movimiento = 'RETIRO' THEN
        IF v_saldo_actual < p_monto THEN
            RAISE EXCEPTION 'Saldo insuficiente. Saldo: %, Solicitado: %', v_saldo_actual, p_monto;
        END IF;
        v_nuevo_saldo := v_saldo_actual - p_monto;
    ELSE
        RAISE EXCEPTION 'Tipo de movimiento inválido: %', p_tipo_movimiento;
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
$$;

-- =====================================================
-- PASO 7: FUNCIONES ESPECÍFICAS PARA VENTAS
-- =====================================================

DROP FUNCTION IF EXISTS registrar_venta CASCADE;
DROP FUNCTION IF EXISTS registrar_venta(DECIMAL, TEXT, INTEGER, VARCHAR, VARCHAR, VARCHAR, DECIMAL, DECIMAL, DECIMAL, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION registrar_venta(
    p_factura_descripcion TEXT,
    p_venta_por VARCHAR,
    p_valor DECIMAL(15, 2),
    p_metodo_pago VARCHAR,
    p_usuario_registro INTEGER,
    p_observaciones TEXT DEFAULT NULL
)
RETURNS TABLE(
    id_venta INTEGER,
    valor DECIMAL(15, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_venta INTEGER;
BEGIN
    -- Validar venta_por
    IF p_venta_por NOT IN ('REDES', 'ALMACEN') THEN
        RAISE EXCEPTION 'venta_por debe ser REDES o ALMACEN';
    END IF;
    
    -- Validar metodo_pago
    IF p_metodo_pago NOT IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO') THEN
        RAISE EXCEPTION 'metodo_pago inválido';
    END IF;
    
    -- Registrar venta
    INSERT INTO ventas (
        factura_descripcion, venta_por, valor, metodo_pago,
        usuario_registro, observaciones
    ) VALUES (
        p_factura_descripcion, p_venta_por, p_valor, p_metodo_pago,
        p_usuario_registro, p_observaciones
    ) RETURNING ventas.id_venta INTO v_id_venta;
    
    RETURN QUERY SELECT v_id_venta, p_valor;
END;
$$;

-- =====================================================
-- PASO 8: FUNCIONES ESPECÍFICAS PARA GASTOS
-- =====================================================

DROP FUNCTION IF EXISTS registrar_gasto CASCADE;
DROP FUNCTION IF EXISTS registrar_gasto(DECIMAL, TEXT, INTEGER, INTEGER, VARCHAR, VARCHAR, DATE, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION registrar_gasto(
    p_descripcion TEXT,
    p_id_categoria INTEGER,
    p_id_subcategoria INTEGER,
    p_metodo_pago VARCHAR,
    p_valor DECIMAL(15, 2),
    p_usuario_registro INTEGER
)
RETURNS TABLE(
    id_gasto INTEGER,
    valor DECIMAL(15, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_gasto INTEGER;
BEGIN
    -- Validar metodo_pago
    IF p_metodo_pago NOT IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO') THEN
        RAISE EXCEPTION 'metodo_pago inválido';
    END IF;
    
    -- Registrar gasto
    INSERT INTO gastos (
        descripcion, id_subcategoria, id_categoria, metodo_pago, valor, usuario_registro
    ) VALUES (
        p_descripcion, p_id_subcategoria, p_id_categoria, p_metodo_pago, p_valor, p_usuario_registro
    ) RETURNING gastos.id_gasto INTO v_id_gasto;
    
    RETURN QUERY SELECT v_id_gasto, p_valor;
END;
$$;

-- =====================================================
-- PASO 9: VISTAS PARA REPORTES
-- =====================================================

-- Vista de resumen de ventas
CREATE OR REPLACE VIEW vista_ventas AS
SELECT 
    v.id_venta,
    v.factura_descripcion,
    v.venta_por,
    v.valor,
    v.metodo_pago,
    v.fecha,
    v.observaciones,
    u.nombre as usuario
FROM ventas v
JOIN usuarios u ON v.usuario_registro = u.id_usuario
WHERE v.activo = TRUE
ORDER BY v.fecha DESC;

-- Vista de resumen de gastos
CREATE OR REPLACE VIEW vista_gastos AS
SELECT 
    g.id_gasto,
    g.fecha,
    g.descripcion,
    sc.nombre as subcategoria,
    cg.nombre as categoria,
    g.metodo_pago,
    g.valor,
    u.nombre as usuario
FROM gastos g
JOIN categorias_gastos cg ON g.id_categoria = cg.id_categoria
LEFT JOIN subcategorias_gastos sc ON g.id_subcategoria = sc.id_subcategoria
JOIN usuarios u ON g.usuario_registro = u.id_usuario
WHERE g.activo = TRUE
ORDER BY g.fecha DESC;

-- Vista de resumen de caja fuerte
CREATE OR REPLACE VIEW vista_caja_fuerte AS
SELECT 
    cf.id_movimiento,
    cf.tipo_movimiento,
    cf.monto,
    cf.saldo_anterior,
    cf.saldo_nuevo,
    cf.fecha,
    cf.descripcion,
    cf.observaciones,
    u.nombre as usuario,
    cf.caja_id
FROM caja_fuerte cf
JOIN usuarios u ON cf.usuario_registro = u.id_usuario
WHERE cf.activo = TRUE
ORDER BY cf.fecha DESC;

-- Vista de reporte diario (Fecha, Total Ventas, Total Gastos)
CREATE OR REPLACE VIEW vista_reporte_diario AS
SELECT 
    DATE(COALESCE(v.fecha, g.fecha)) as fecha,
    COALESCE(SUM(v.valor), 0) as total_ventas,
    COALESCE(SUM(g.valor), 0) as total_gastos,
    COALESCE(SUM(v.valor), 0) - COALESCE(SUM(g.valor), 0) as diferencia
FROM ventas v
FULL OUTER JOIN gastos g ON DATE(v.fecha) = DATE(g.fecha) AND g.activo = TRUE
WHERE v.activo = TRUE OR g.activo = TRUE
GROUP BY DATE(COALESCE(v.fecha, g.fecha))
ORDER BY fecha DESC;

-- =====================================================
-- PASO 10: FUNCIONES DE REPORTES
-- =====================================================

-- Eliminar funciones antiguas si existen
DROP FUNCTION IF EXISTS reporte_ventas_periodo(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS reporte_ventas_metodo_pago(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS reporte_gastos_categoria(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS reporte_gastos_metodo_pago(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS flujo_caja_diario(DATE) CASCADE;
DROP FUNCTION IF EXISTS reporte_diario_ventas_gastos(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS actualizar_reporte_diario(DATE, INTEGER) CASCADE;

-- Reporte de ventas por período
CREATE OR REPLACE FUNCTION reporte_ventas_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    total_ventas BIGINT,
    valor_total DECIMAL(15, 2),
    ventas_redes BIGINT,
    valor_redes DECIMAL(15, 2),
    ventas_almacen BIGINT,
    valor_almacen DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COALESCE(SUM(v.valor), 0),
        COUNT(CASE WHEN v.venta_por = 'REDES' THEN 1 END)::BIGINT,
        COALESCE(SUM(CASE WHEN v.venta_por = 'REDES' THEN v.valor END), 0),
        COUNT(CASE WHEN v.venta_por = 'ALMACEN' THEN 1 END)::BIGINT,
        COALESCE(SUM(CASE WHEN v.venta_por = 'ALMACEN' THEN v.valor END), 0)
    FROM ventas v
    WHERE v.activo = TRUE
    AND DATE(v.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;
END;
$$;

-- Reporte de ventas por método de pago
CREATE OR REPLACE FUNCTION reporte_ventas_metodo_pago(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    metodo_pago VARCHAR,
    total_ventas BIGINT,
    valor_total DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.metodo_pago,
        COUNT(*)::BIGINT,
        COALESCE(SUM(v.valor), 0)
    FROM ventas v
    WHERE v.activo = TRUE
    AND DATE(v.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.metodo_pago
    ORDER BY SUM(v.valor) DESC;
END;
$$;

-- Reporte de gastos por categoría
CREATE OR REPLACE FUNCTION reporte_gastos_categoria(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    categoria VARCHAR,
    subcategoria VARCHAR,
    total_gastos BIGINT,
    valor_total DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cg.nombre,
        COALESCE(sc.nombre, 'Sin subcategoría'),
        COUNT(*)::BIGINT,
        COALESCE(SUM(g.valor), 0)
    FROM gastos g
    JOIN categorias_gastos cg ON g.id_categoria = cg.id_categoria
    LEFT JOIN subcategorias_gastos sc ON g.id_subcategoria = sc.id_subcategoria
    WHERE g.activo = TRUE
    AND DATE(g.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY cg.nombre, sc.nombre
    ORDER BY SUM(g.valor) DESC;
END;
$$;

-- Reporte de gastos por método de pago
CREATE OR REPLACE FUNCTION reporte_gastos_metodo_pago(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    metodo_pago VARCHAR,
    total_gastos BIGINT,
    valor_total DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.metodo_pago,
        COUNT(*)::BIGINT,
        COALESCE(SUM(g.valor), 0)
    FROM gastos g
    WHERE g.activo = TRUE
    AND DATE(g.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY g.metodo_pago
    ORDER BY SUM(g.valor) DESC;
END;
$$;

-- Flujo de caja diario (solo caja fuerte)
CREATE OR REPLACE FUNCTION flujo_caja_diario(
    p_fecha DATE
)
RETURNS TABLE(
    depositos DECIMAL(15, 2),
    retiros DECIMAL(15, 2),
    neto DECIMAL(15, 2),
    saldo_final DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_depositos DECIMAL(15, 2);
    v_retiros DECIMAL(15, 2);
    v_saldo DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(monto), 0) INTO v_depositos
    FROM caja_fuerte
    WHERE tipo_movimiento = 'DEPOSITO'
    AND DATE(fecha) = p_fecha
    AND activo = TRUE;
    
    SELECT COALESCE(SUM(monto), 0) INTO v_retiros
    FROM caja_fuerte
    WHERE tipo_movimiento = 'RETIRO'
    AND DATE(fecha) = p_fecha
    AND activo = TRUE;
    
    v_saldo := obtener_saldo_caja_fuerte();
    
    RETURN QUERY SELECT v_depositos, v_retiros, v_depositos - v_retiros, v_saldo;
END;
$$;

-- Reporte diario de ventas vs gastos
CREATE OR REPLACE FUNCTION reporte_diario_ventas_gastos(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE(
    fecha DATE,
    total_ventas DECIMAL(15, 2),
    total_gastos DECIMAL(15, 2),
    diferencia DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(d.fecha) as fecha,
        COALESCE(SUM(CASE WHEN d.tipo = 'VENTA' THEN d.valor END), 0) as total_ventas,
        COALESCE(SUM(CASE WHEN d.tipo = 'GASTO' THEN d.valor END), 0) as total_gastos,
        COALESCE(SUM(CASE WHEN d.tipo = 'VENTA' THEN d.valor END), 0) - 
        COALESCE(SUM(CASE WHEN d.tipo = 'GASTO' THEN d.valor END), 0) as diferencia
    FROM (
        SELECT fecha, valor, 'VENTA' as tipo FROM ventas WHERE activo = TRUE
        UNION ALL
        SELECT fecha, valor, 'GASTO' as tipo FROM gastos WHERE activo = TRUE
    ) d
    WHERE DATE(d.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY DATE(d.fecha)
    ORDER BY fecha DESC;
END;
$$;

-- Función para actualizar o crear reporte diario
CREATE OR REPLACE FUNCTION actualizar_reporte_diario(
    p_fecha DATE,
    p_usuario_registro INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id_reporte INTEGER,
    fecha DATE,
    total_ventas DECIMAL(15, 2),
    total_gastos DECIMAL(15, 2),
    diferencia DECIMAL(15, 2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_ventas DECIMAL(15, 2);
    v_total_gastos DECIMAL(15, 2);
    v_diferencia DECIMAL(15, 2);
    v_id_reporte INTEGER;
BEGIN
    -- Calcular total de ventas del día
    SELECT COALESCE(SUM(valor), 0) INTO v_total_ventas
    FROM ventas
    WHERE DATE(fecha) = p_fecha AND activo = TRUE;
    
    -- Calcular total de gastos del día
    SELECT COALESCE(SUM(valor), 0) INTO v_total_gastos
    FROM gastos
    WHERE DATE(fecha) = p_fecha AND activo = TRUE;
    
    -- Calcular diferencia
    v_diferencia := v_total_ventas - v_total_gastos;
    
    -- Insertar o actualizar reporte
    INSERT INTO reporte_ventas_gastos (fecha, total_ventas, total_gastos, diferencia, usuario_registro)
    VALUES (p_fecha, v_total_ventas, v_total_gastos, v_diferencia, p_usuario_registro)
    ON CONFLICT (fecha) 
    DO UPDATE SET 
        total_ventas = EXCLUDED.total_ventas,
        total_gastos = EXCLUDED.total_gastos,
        diferencia = EXCLUDED.diferencia,
        fecha_actualizacion = NOW()
    RETURNING reporte_ventas_gastos.id_reporte INTO v_id_reporte;
    
    -- Retornar el reporte actualizado
    RETURN QUERY
    SELECT 
        r.id_reporte,
        r.fecha,
        r.total_ventas,
        r.total_gastos,
        r.diferencia
    FROM reporte_ventas_gastos r
    WHERE r.id_reporte = v_id_reporte;
END;
$$;

-- =====================================================
-- PASO 11: TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS trigger_actualizar_caja_fuerte ON caja_fuerte;
DROP TRIGGER IF EXISTS trigger_actualizar_ventas ON ventas;
DROP TRIGGER IF EXISTS trigger_actualizar_gastos ON gastos;
DROP TRIGGER IF EXISTS trigger_actualizar_reporte ON reporte_ventas_gastos;

CREATE TRIGGER trigger_actualizar_caja_fuerte
    BEFORE UPDATE ON caja_fuerte
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_ventas
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_gastos
    BEFORE UPDATE ON gastos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_reporte
    BEFORE UPDATE ON reporte_ventas_gastos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- =====================================================
-- PASO 12: PERMISOS Y RLS
-- =====================================================

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION obtener_saldo_caja_fuerte() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_movimiento_caja_fuerte TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_venta TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_gasto TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reporte_ventas_periodo TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reporte_ventas_metodo_pago TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reporte_gastos_categoria TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reporte_gastos_metodo_pago TO anon, authenticated;
GRANT EXECUTE ON FUNCTION flujo_caja_diario TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reporte_diario_ventas_gastos TO anon, authenticated;
GRANT EXECUTE ON FUNCTION actualizar_reporte_diario TO anon, authenticated;

-- Habilitar RLS
ALTER TABLE caja_fuerte ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_ventas_gastos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "allow_all_select_caja_fuerte" ON caja_fuerte;
DROP POLICY IF EXISTS "allow_all_insert_caja_fuerte" ON caja_fuerte;
DROP POLICY IF EXISTS "allow_all_update_caja_fuerte" ON caja_fuerte;
DROP POLICY IF EXISTS "allow_all_delete_caja_fuerte" ON caja_fuerte;

-- Crear políticas permisivas
CREATE POLICY "allow_all_select_caja_fuerte" ON caja_fuerte FOR SELECT USING (TRUE);
CREATE POLICY "allow_all_insert_caja_fuerte" ON caja_fuerte FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "allow_all_update_caja_fuerte" ON caja_fuerte FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_delete_caja_fuerte" ON caja_fuerte FOR DELETE USING (TRUE);

CREATE POLICY "allow_all_categorias" ON categorias_gastos FOR ALL USING (TRUE);
CREATE POLICY "allow_all_subcategorias" ON subcategorias_gastos FOR ALL USING (TRUE);
CREATE POLICY "allow_all_ventas" ON ventas FOR ALL USING (TRUE);
CREATE POLICY "allow_all_gastos" ON gastos FOR ALL USING (TRUE);
CREATE POLICY "allow_all_reporte" ON reporte_ventas_gastos FOR ALL USING (TRUE);

-- =====================================================
-- PASO 13: COMENTARIOS
-- =====================================================

COMMENT ON TABLE caja_fuerte IS 'Registro de movimientos de caja fuerte (depósitos y retiros)';
COMMENT ON TABLE categorias_gastos IS 'Categorías principales para clasificar gastos';
COMMENT ON TABLE subcategorias_gastos IS 'Subcategorías para clasificar gastos con más detalle';
COMMENT ON TABLE ventas IS 'Registro de ventas independiente';
COMMENT ON TABLE gastos IS 'Registro de gastos independiente';
COMMENT ON TABLE reporte_ventas_gastos IS 'Reporte diario de ventas vs gastos';
COMMENT ON FUNCTION obtener_saldo_caja_fuerte() IS 'Obtiene el saldo actual de caja fuerte';
COMMENT ON FUNCTION registrar_venta IS 'Registra una venta';
COMMENT ON FUNCTION registrar_gasto IS 'Registra un gasto';
COMMENT ON FUNCTION actualizar_reporte_diario IS 'Actualiza o crea el reporte diario de ventas y gastos';

-- =====================================================
-- PASO 14: VERIFICACIÓN Y PRUEBAS
-- =====================================================

DO $$
DECLARE
    v_tabla_caja BOOLEAN;
    v_tabla_categorias BOOLEAN;
    v_tabla_subcategorias BOOLEAN;
    v_tabla_ventas BOOLEAN;
    v_tabla_gastos BOOLEAN;
    v_tabla_reporte BOOLEAN;
    v_funciones INTEGER;
    v_vistas INTEGER;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'caja_fuerte') INTO v_tabla_caja;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_gastos') INTO v_tabla_categorias;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subcategorias_gastos') INTO v_tabla_subcategorias;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ventas') INTO v_tabla_ventas;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gastos') INTO v_tabla_gastos;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reporte_ventas_gastos') INTO v_tabla_reporte;
    
    SELECT COUNT(*) INTO v_funciones FROM pg_proc WHERE proname IN ('obtener_saldo_caja_fuerte', 'registrar_movimiento_caja_fuerte', 'registrar_venta', 'registrar_gasto', 'reporte_ventas_periodo', 'reporte_ventas_metodo_pago', 'reporte_gastos_categoria', 'reporte_gastos_metodo_pago', 'flujo_caja_diario', 'reporte_diario_ventas_gastos', 'actualizar_reporte_diario');
    SELECT COUNT(*) INTO v_vistas FROM information_schema.views WHERE table_name IN ('vista_ventas', 'vista_gastos', 'vista_caja_fuerte', 'vista_reporte_diario');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE INSTALACIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabla caja_fuerte: %', CASE WHEN v_tabla_caja THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Tabla categorias_gastos: %', CASE WHEN v_tabla_categorias THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Tabla subcategorias_gastos: %', CASE WHEN v_tabla_subcategorias THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Tabla ventas: %', CASE WHEN v_tabla_ventas THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Tabla gastos: %', CASE WHEN v_tabla_gastos THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Tabla reporte_ventas_gastos: %', CASE WHEN v_tabla_reporte THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Funciones creadas: %', v_funciones;
    RAISE NOTICE 'Vistas creadas: %', v_vistas;
    RAISE NOTICE '========================================';
    
    IF v_tabla_caja AND v_tabla_categorias AND v_tabla_subcategorias AND v_tabla_ventas AND v_tabla_gastos AND v_tabla_reporte THEN
        RAISE NOTICE '✅ INSTALACIÓN EXITOSA';
    ELSE
        RAISE NOTICE '⚠️ INSTALACIÓN INCOMPLETA';
    END IF;
END $$;

-- Probar saldo inicial
SELECT 'Saldo inicial:' as test, obtener_saldo_caja_fuerte() as saldo;

-- Listar categorías de gastos
SELECT 'Categorías de gastos disponibles:' as info;
SELECT id_categoria, nombre, descripcion FROM categorias_gastos WHERE activo = TRUE;

-- Listar subcategorías de gastos
SELECT 'Subcategorías de gastos disponibles:' as info;
SELECT sc.id_subcategoria, cg.nombre as categoria, sc.nombre as subcategoria 
FROM subcategorias_gastos sc
JOIN categorias_gastos cg ON sc.id_categoria = cg.id_categoria
WHERE sc.activo = TRUE;

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Registrar una venta
-- SELECT * FROM registrar_venta(
--     'Factura #001 - Venta de repuestos',  -- factura_descripcion
--     'ALMACEN',                             -- venta_por (REDES o ALMACEN)
--     150000.00,                             -- valor
--     'EFECTIVO',                            -- metodo_pago
--     1,                                     -- usuario_registro
--     'Venta al contado'                     -- observaciones
-- );

-- Ejemplo 2: Registrar un gasto
-- SELECT * FROM registrar_gasto(
--     'Pago de luz del mes',        -- descripcion
--     1,                             -- id_categoria
--     3,                             -- id_subcategoria
--     'EFECTIVO',                    -- metodo_pago
--     50000.00,                      -- valor
--     1                              -- usuario_registro
-- );

-- Ejemplo 3: Registrar depósito en caja fuerte
-- SELECT * FROM registrar_movimiento_caja_fuerte(
--     'DEPOSITO',                   -- tipo_movimiento
--     200000.00,                    -- monto
--     'Depósito de efectivo',       -- descripcion
--     1,                            -- usuario_registro
--     7,                            -- caja_id
--     'Cierre de caja'              -- observaciones
-- );

-- Ejemplo 4: Ver reporte de ventas del día
-- SELECT * FROM reporte_ventas_periodo(CURRENT_DATE, CURRENT_DATE);

-- Ejemplo 5: Ver gastos por categoría del mes
-- SELECT * FROM reporte_gastos_categoria(
--     DATE_TRUNC('month', CURRENT_DATE)::DATE,
--     CURRENT_DATE
-- );

-- Ejemplo 6: Ver flujo de caja del día
-- SELECT * FROM flujo_caja_diario(CURRENT_DATE);

-- Ejemplo 7: Ver reporte diario de ventas vs gastos
-- SELECT * FROM reporte_diario_ventas_gastos(
--     '2025-01-01',                 -- fecha_inicio
--     CURRENT_DATE                  -- fecha_fin
-- );

-- Ejemplo 8: Ver reporte diario usando la vista
-- SELECT * FROM vista_reporte_diario 
-- WHERE fecha >= '2025-01-01' 
-- ORDER BY fecha DESC;

-- Ejemplo 9: Actualizar reporte del día actual
-- SELECT * FROM actualizar_reporte_diario(CURRENT_DATE, 1);

-- Ejemplo 10: Ver todos los reportes almacenados
-- SELECT * FROM reporte_ventas_gastos 
-- WHERE activo = TRUE 
-- ORDER BY fecha DESC;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
