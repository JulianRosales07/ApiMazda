-- =====================================================
-- SCHEMA PARA SISTEMA DE CAJA - MAZDA JAPON
-- PostgreSQL / Supabase
-- =====================================================

-- Tabla de Cajas (Aperturas y Cierres)
CREATE TABLE IF NOT EXISTS cajas (
    id_caja SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    jornada VARCHAR(20) NOT NULL CHECK (jornada IN ('mañana', 'tarde')),
    monto_inicial DECIMAL(15, 2) NOT NULL,
    monto_final DECIMAL(15, 2),
    total_ventas DECIMAL(15, 2) DEFAULT 0,
    total_gastos DECIMAL(15, 2) DEFAULT 0,
    diferencia DECIMAL(15, 2),
    notas_apertura TEXT,
    notas_cierre TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
    id_venta SERIAL PRIMARY KEY,
    caja_id INTEGER NOT NULL REFERENCES cajas(id_caja) ON DELETE CASCADE,
    factura VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    venta_por VARCHAR(20) NOT NULL CHECK (venta_por IN ('REDES', 'ALMACEN')),
    valor DECIMAL(15, 2) NOT NULL CHECK (valor >= 0),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO')),
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    observaciones TEXT,
    usuario_registro INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Categorías de Gastos
CREATE TABLE IF NOT EXISTS categorias_gastos (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Subcategorías de Gastos
CREATE TABLE IF NOT EXISTS subcategorias_gastos (
    id_subcategoria SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias_gastos(id_categoria) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(categoria_id, nombre)
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id_gasto SERIAL PRIMARY KEY,
    caja_id INTEGER NOT NULL REFERENCES cajas(id_caja) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    subcategoria_id INTEGER REFERENCES subcategorias_gastos(id_subcategoria),
    categoria_id INTEGER NOT NULL REFERENCES categorias_gastos(id_categoria),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO')),
    valor DECIMAL(15, 2) NOT NULL CHECK (valor >= 0),
    usuario_registro INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX idx_cajas_usuario ON cajas(usuario_id);
CREATE INDEX idx_cajas_fecha_apertura ON cajas(fecha_apertura);
CREATE INDEX idx_cajas_estado ON cajas(estado);
CREATE INDEX idx_cajas_jornada ON cajas(jornada);

CREATE INDEX idx_ventas_caja ON ventas(caja_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_registro);

CREATE INDEX idx_gastos_caja ON gastos(caja_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_subcategoria ON gastos(subcategoria_id);
CREATE INDEX idx_gastos_usuario ON gastos(usuario_registro);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_cajas
    BEFORE UPDATE ON cajas
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

-- Función para calcular totales de caja
CREATE OR REPLACE FUNCTION calcular_totales_caja(p_caja_id INTEGER)
RETURNS TABLE(
    total_ventas DECIMAL(15, 2),
    total_gastos DECIMAL(15, 2),
    diferencia DECIMAL(15, 2)
) AS $$
DECLARE
    v_total_ventas DECIMAL(15, 2);
    v_total_gastos DECIMAL(15, 2);
    v_monto_inicial DECIMAL(15, 2);
BEGIN
    -- Obtener monto inicial
    SELECT monto_inicial INTO v_monto_inicial
    FROM cajas
    WHERE id_caja = p_caja_id;

    -- Calcular total de ventas
    SELECT COALESCE(SUM(valor), 0) INTO v_total_ventas
    FROM ventas
    WHERE caja_id = p_caja_id AND activo = TRUE;

    -- Calcular total de gastos
    SELECT COALESCE(SUM(valor), 0) INTO v_total_gastos
    FROM gastos
    WHERE caja_id = p_caja_id AND activo = TRUE;

    -- Retornar resultados
    RETURN QUERY SELECT 
        v_total_ventas,
        v_total_gastos,
        (v_monto_inicial + v_total_ventas - v_total_gastos) AS diferencia;
END;
$$ LANGUAGE plpgsql;

-- Función para cerrar caja
CREATE OR REPLACE FUNCTION cerrar_caja(
    p_caja_id INTEGER,
    p_monto_final DECIMAL(15, 2),
    p_notas_cierre TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_totales RECORD;
BEGIN
    -- Calcular totales
    SELECT * INTO v_totales FROM calcular_totales_caja(p_caja_id);

    -- Actualizar caja
    UPDATE cajas
    SET 
        fecha_cierre = NOW(),
        monto_final = p_monto_final,
        total_ventas = v_totales.total_ventas,
        total_gastos = v_totales.total_gastos,
        diferencia = p_monto_final - v_totales.diferencia,
        notas_cierre = p_notas_cierre,
        estado = 'cerrada'
    WHERE id_caja = p_caja_id AND estado = 'abierta';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reporte diario
CREATE OR REPLACE FUNCTION obtener_reporte_diario(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    fecha DATE,
    total_ventas DECIMAL(15, 2),
    total_gastos DECIMAL(15, 2),
    balance DECIMAL(15, 2)
) AS $$
BEGIN
    -- Si no se especifican fechas, usar el mes actual
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    RETURN QUERY
    SELECT 
        DATE(c.fecha_apertura) as fecha,
        COALESCE(SUM(c.total_ventas), 0) as total_ventas,
        COALESCE(SUM(c.total_gastos), 0) as total_gastos,
        COALESCE(SUM(c.total_ventas - c.total_gastos), 0) as balance
    FROM cajas c
    WHERE DATE(c.fecha_apertura) BETWEEN p_fecha_inicio AND p_fecha_fin
        AND c.activo = TRUE
    GROUP BY DATE(c.fecha_apertura)
    ORDER BY fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reporte mensual
CREATE OR REPLACE FUNCTION obtener_reporte_mensual(
    p_anio INTEGER DEFAULT NULL,
    p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE(
    mes TEXT,
    total_ventas DECIMAL(15, 2),
    total_gastos DECIMAL(15, 2),
    balance DECIMAL(15, 2)
) AS $$
BEGIN
    -- Si no se especifica año/mes, usar el actual
    IF p_anio IS NULL THEN
        p_anio := EXTRACT(YEAR FROM CURRENT_DATE);
    END IF;
    
    IF p_mes IS NULL THEN
        p_mes := EXTRACT(MONTH FROM CURRENT_DATE);
    END IF;

    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', c.fecha_apertura), 'Month YYYY') as mes,
        COALESCE(SUM(c.total_ventas), 0) as total_ventas,
        COALESCE(SUM(c.total_gastos), 0) as total_gastos,
        COALESCE(SUM(c.total_ventas - c.total_gastos), 0) as balance
    FROM cajas c
    WHERE EXTRACT(YEAR FROM c.fecha_apertura) = p_anio
        AND (p_mes IS NULL OR EXTRACT(MONTH FROM c.fecha_apertura) = p_mes)
        AND c.activo = TRUE
    GROUP BY DATE_TRUNC('month', c.fecha_apertura)
    ORDER BY DATE_TRUNC('month', c.fecha_apertura) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security) - SUPABASE
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias_gastos ENABLE ROW LEVEL SECURITY;

-- Políticas para cajas
CREATE POLICY "Usuarios pueden ver sus propias cajas" ON cajas
    FOR SELECT USING (auth.uid()::text = usuario_id::text OR 
                      EXISTS (SELECT 1 FROM usuarios WHERE id_usuario::text = auth.uid()::text AND rol = 'administrador'));

CREATE POLICY "Usuarios pueden crear cajas" ON cajas
    FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuarios pueden actualizar sus propias cajas" ON cajas
    FOR UPDATE USING (auth.uid()::text = usuario_id::text OR 
                      EXISTS (SELECT 1 FROM usuarios WHERE id_usuario::text = auth.uid()::text AND rol = 'administrador'));

-- Políticas para ventas
CREATE POLICY "Usuarios pueden ver ventas de sus cajas" ON ventas
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = ventas.caja_id 
        AND (cajas.usuario_id::text = auth.uid()::text OR 
             EXISTS (SELECT 1 FROM usuarios WHERE id_usuario::text = auth.uid()::text AND rol = 'administrador'))
    ));

CREATE POLICY "Usuarios pueden crear ventas en sus cajas" ON ventas
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = ventas.caja_id 
        AND cajas.usuario_id::text = auth.uid()::text
        AND cajas.estado = 'abierta'
    ));

CREATE POLICY "Usuarios pueden actualizar ventas de sus cajas" ON ventas
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = ventas.caja_id 
        AND cajas.usuario_id::text = auth.uid()::text
    ));

-- Políticas para gastos
CREATE POLICY "Usuarios pueden ver gastos de sus cajas" ON gastos
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = gastos.caja_id 
        AND (cajas.usuario_id::text = auth.uid()::text OR 
             EXISTS (SELECT 1 FROM usuarios WHERE id_usuario::text = auth.uid()::text AND rol = 'administrador'))
    ));

CREATE POLICY "Usuarios pueden crear gastos en sus cajas" ON gastos
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = gastos.caja_id 
        AND cajas.usuario_id::text = auth.uid()::text
        AND cajas.estado = 'abierta'
    ));

CREATE POLICY "Usuarios pueden actualizar gastos de sus cajas" ON gastos
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM cajas 
        WHERE cajas.id_caja = gastos.caja_id 
        AND cajas.usuario_id::text = auth.uid()::text
    ));

-- Políticas para categorías (todos pueden leer)
CREATE POLICY "Todos pueden ver categorías" ON categorias_gastos
    FOR SELECT USING (TRUE);

CREATE POLICY "Todos pueden ver subcategorías" ON subcategorias_gastos
    FOR SELECT USING (TRUE);

-- =====================================================
-- COMENTARIOS EN LAS TABLAS
-- =====================================================

COMMENT ON TABLE cajas IS 'Registro de aperturas y cierres de caja';
COMMENT ON TABLE ventas IS 'Registro de ventas realizadas en cada caja';
COMMENT ON TABLE gastos IS 'Registro de gastos realizados en cada caja';
COMMENT ON TABLE categorias_gastos IS 'Categorías principales de gastos';
COMMENT ON TABLE subcategorias_gastos IS 'Subcategorías de gastos';

COMMENT ON COLUMN cajas.jornada IS 'Jornada de trabajo: mañana o tarde';
COMMENT ON COLUMN cajas.diferencia IS 'Diferencia entre monto esperado y monto final';
COMMENT ON COLUMN ventas.venta_por IS 'Canal de venta: REDES o ALMACEN';
COMMENT ON COLUMN ventas.metodo_pago IS 'Método de pago utilizado';
