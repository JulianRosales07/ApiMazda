-- ============================================
-- ESQUEMA INTEGRADO POSTGRESQL - SISTEMA DE INVENTARIO Y CAJA
-- MAZDA JAPON
-- ============================================

-- ============================================
-- MÓDULO 1: USUARIOS (COMPARTIDO)
-- ============================================

-- Eliminar tablas existentes (en orden inverso por dependencias)
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS subcategorias_gastos CASCADE;
DROP TABLE IF EXISTS categorias_gastos CASCADE;
DROP TABLE IF EXISTS cajas CASCADE;
DROP TABLE IF EXISTS devoluciones CASCADE;
DROP TABLE IF EXISTS salidas CASCADE;
DROP TABLE IF EXISTS entradas CASCADE;
DROP TABLE IF EXISTS producto_proveedor CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS marcas CASCADE;
DROP TABLE IF EXISTS repuestos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- TABLA: usuarios (compartida entre inventario y caja)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'usuario' CHECK (rol IN (
        'administrador',
        'usuario',
        'administrador_general',
        'gestion_ingresos',
        'gestion_egresos',
        'gestion_inventario',
        'cajero'
    )),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Julian Rosales', 'julianrosales0703@hotmail.com', '1193051330', 'administrador');

-- ============================================
-- MÓDULO 2: INVENTARIO
-- ============================================

-- TABLA: marcas
CREATE TABLE marcas (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_marcas_nombre ON marcas(nombre);
CREATE INDEX idx_marcas_activo ON marcas(activo);

-- TABLA: proveedores
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    ci VARCHAR(50),
    cp VARCHAR(50) NOT NULL UNIQUE,
    nombre_proveedor VARCHAR(255) NOT NULL,
    costo NUMERIC(12, 2) DEFAULT 0,
    saldo_a_favor NUMERIC(10, 2) DEFAULT 0,
    saldo_en_contra NUMERIC(10, 2) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_proveedores_cp ON proveedores(cp);
CREATE INDEX idx_proveedores_ci ON proveedores(ci);
CREATE INDEX idx_proveedores_nombre_proveedor ON proveedores(nombre_proveedor);
CREATE INDEX idx_proveedores_activo ON proveedores(activo);

-- TABLA: repuestos
CREATE TABLE repuestos (
    CB VARCHAR(50) PRIMARY KEY,
    CI VARCHAR(50),
    PRODUCTO VARCHAR(255) NOT NULL,
    TIPO VARCHAR(100),
    MODELO_ESPECIFICACION VARCHAR(255),
    REFERENCIA VARCHAR(100),
    MARCA VARCHAR(100),
    EXISTENCIAS_INICIALES NUMERIC(10, 2) DEFAULT 0,
    STOCK NUMERIC(10, 2) DEFAULT 0,
    PRECIO NUMERIC(12, 2) DEFAULT 0,
    DESCRIPCION_LARGA TEXT,
    ESTANTE VARCHAR(20),
    NIVEL VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_repuestos_ci ON repuestos(CI);
CREATE INDEX idx_repuestos_producto ON repuestos(PRODUCTO);
CREATE INDEX idx_repuestos_tipo ON repuestos(TIPO);
CREATE INDEX idx_repuestos_marca ON repuestos(MARCA);
CREATE INDEX idx_repuestos_stock ON repuestos(STOCK);
CREATE INDEX idx_repuestos_referencia ON repuestos(REFERENCIA);

-- TABLA: producto_proveedor
CREATE TABLE producto_proveedor (
    id_producto_proveedor SERIAL PRIMARY KEY,
    producto_cb VARCHAR(50) NOT NULL,
    proveedor_id INTEGER NOT NULL,
    precio_proveedor NUMERIC(12, 2) NOT NULL DEFAULT 0,
    es_proveedor_principal BOOLEAN DEFAULT FALSE,
    fecha_ultima_compra DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_producto_proveedor_producto FOREIGN KEY (producto_cb) REFERENCES repuestos(CB) ON DELETE CASCADE,
    CONSTRAINT fk_producto_proveedor_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    CONSTRAINT uq_producto_proveedor UNIQUE (producto_cb, proveedor_id)
);

CREATE INDEX idx_producto_proveedor_producto ON producto_proveedor(producto_cb);
CREATE INDEX idx_producto_proveedor_proveedor ON producto_proveedor(proveedor_id);
CREATE INDEX idx_producto_proveedor_precio ON producto_proveedor(precio_proveedor);
CREATE INDEX idx_producto_proveedor_principal ON producto_proveedor(es_proveedor_principal);
CREATE INDEX idx_producto_proveedor_activo ON producto_proveedor(activo);

-- TABLA: entradas
CREATE TABLE entradas (
    ID SERIAL PRIMARY KEY,
    N_FACTURA VARCHAR(50) NOT NULL,
    PROVEEDOR VARCHAR(150) NOT NULL,
    FECHA DATE NOT NULL,
    CB VARCHAR(50) NOT NULL,
    CI VARCHAR(50),
    DESCRIPCION VARCHAR(255) NOT NULL,
    CANTIDAD NUMERIC(10, 2) NOT NULL,
    COSTO NUMERIC(12, 2) NOT NULL,
    VALOR_VENTA NUMERIC(12, 2),
    SIIGO VARCHAR(10) DEFAULT 'NO' CHECK (SIIGO IN ('SI', 'NO')),
    Columna1 TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_registro INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    CONSTRAINT fk_entradas_repuesto FOREIGN KEY (CB) REFERENCES repuestos(CB) ON DELETE RESTRICT
);

CREATE INDEX idx_entradas_factura ON entradas(N_FACTURA);
CREATE INDEX idx_entradas_proveedor ON entradas(PROVEEDOR);
CREATE INDEX idx_entradas_fecha ON entradas(FECHA);
CREATE INDEX idx_entradas_cb ON entradas(CB);
CREATE INDEX idx_entradas_ci ON entradas(CI);
CREATE INDEX idx_entradas_siigo ON entradas(SIIGO);

-- TABLA: salidas
CREATE TABLE salidas (
    n_factura INTEGER PRIMARY KEY,
    fecha DATE NOT NULL,
    cb VARCHAR(50),
    ci VARCHAR(50),
    descripcion VARCHAR(255) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL,
    columna1 TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_registro INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    CONSTRAINT fk_salidas_repuesto FOREIGN KEY (cb) REFERENCES repuestos(CB) ON DELETE RESTRICT
);

CREATE INDEX idx_salidas_fecha ON salidas(fecha);
CREATE INDEX idx_salidas_cb ON salidas(cb);
CREATE INDEX idx_salidas_ci ON salidas(ci);
CREATE INDEX idx_salidas_descripcion ON salidas(descripcion);

-- TABLA: devoluciones
CREATE TABLE devoluciones (
    id_devolucion SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cliente', 'proveedor')),
    producto_cb VARCHAR(50) NOT NULL,
    producto_nombre VARCHAR(255),
    cantidad NUMERIC(10, 2) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    observaciones TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    factura_referencia VARCHAR(50),
    CONSTRAINT fk_devoluciones_repuesto FOREIGN KEY (producto_cb) REFERENCES repuestos(CB) ON DELETE RESTRICT
);

CREATE INDEX idx_devoluciones_tipo ON devoluciones(tipo);
CREATE INDEX idx_devoluciones_producto_cb ON devoluciones(producto_cb);
CREATE INDEX idx_devoluciones_fecha ON devoluciones(fecha);
CREATE INDEX idx_devoluciones_usuario ON devoluciones(usuario_id);
CREATE INDEX idx_devoluciones_factura ON devoluciones(factura_referencia);

-- ============================================
-- MÓDULO 3: SISTEMA DE CAJA
-- ============================================

-- TABLA: cajas
CREATE TABLE cajas (
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

CREATE INDEX idx_cajas_usuario ON cajas(usuario_id);
CREATE INDEX idx_cajas_fecha_apertura ON cajas(fecha_apertura);
CREATE INDEX idx_cajas_estado ON cajas(estado);
CREATE INDEX idx_cajas_jornada ON cajas(jornada);

-- TABLA: categorias_gastos
CREATE TABLE categorias_gastos (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: subcategorias_gastos
CREATE TABLE subcategorias_gastos (
    id_subcategoria SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias_gastos(id_categoria) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(categoria_id, nombre)
);

-- TABLA: ventas (integrada con salidas de inventario)
CREATE TABLE ventas (
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
    salida_id INTEGER REFERENCES salidas(n_factura),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ventas_caja ON ventas(caja_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_registro);
CREATE INDEX idx_ventas_salida ON ventas(salida_id);

-- TABLA: gastos
CREATE TABLE gastos (
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

CREATE INDEX idx_gastos_caja ON gastos(caja_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);
CREATE INDEX idx_gastos_subcategoria ON gastos(subcategoria_id);
CREATE INDEX idx_gastos_usuario ON gastos(usuario_registro);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualización de fecha
CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_repuestos_actualizacion
    BEFORE UPDATE ON repuestos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_proveedores_actualizacion
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_producto_proveedor_actualizacion
    BEFORE UPDATE ON producto_proveedor
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_cajas
    BEFORE UPDATE ON cajas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_ventas
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_gastos
    BEFORE UPDATE ON gastos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función: Actualizar stock en entradas
CREATE OR REPLACE FUNCTION actualizar_stock_entrada()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE repuestos
    SET STOCK = STOCK + NEW.CANTIDAD
    WHERE CB = NEW.CB;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock_entrada
    AFTER INSERT ON entradas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_entrada();

-- Función: Actualizar stock en salidas (permite devoluciones con cantidad negativa)
CREATE OR REPLACE FUNCTION actualizar_stock_salida()
RETURNS TRIGGER AS $$
BEGIN
    -- Si no hay CB (Venta externa), no hacer nada con el stock
    IF NEW.cb IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Solo verificar stock si la cantidad es positiva (salida normal)
    IF NEW.cantidad > 0 THEN
        IF (SELECT STOCK FROM repuestos WHERE CB = NEW.cb) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.cb;
        END IF;
    END IF;
    
    -- Actualizar el stock (si cantidad es negativa, suma al stock)
    UPDATE repuestos
    SET STOCK = STOCK - NEW.cantidad
    WHERE CB = NEW.cb;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock_salida
    AFTER INSERT ON salidas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_salida();

-- Función: Actualizar stock en devoluciones
CREATE OR REPLACE FUNCTION actualizar_stock_devolucion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'cliente' THEN
        UPDATE repuestos
        SET STOCK = STOCK + NEW.cantidad
        WHERE CB = NEW.producto_cb;
    
    ELSIF NEW.tipo = 'proveedor' THEN
        IF (SELECT STOCK FROM repuestos WHERE CB = NEW.producto_cb) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para devolver el producto %', NEW.producto_cb;
        END IF;
        
        UPDATE repuestos
        SET STOCK = STOCK - NEW.cantidad
        WHERE CB = NEW.producto_cb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock_devolucion
    AFTER INSERT ON devoluciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_devolucion();

-- Función: Asegurar un solo proveedor principal por producto
CREATE OR REPLACE FUNCTION asegurar_un_proveedor_principal()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_proveedor_principal = TRUE THEN
        UPDATE producto_proveedor
        SET es_proveedor_principal = FALSE
        WHERE producto_cb = NEW.producto_cb
        AND proveedor_id != NEW.proveedor_id
        AND es_proveedor_principal = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_asegurar_un_proveedor_principal
    BEFORE INSERT OR UPDATE ON producto_proveedor
    FOR EACH ROW
    WHEN (NEW.es_proveedor_principal = TRUE)
    EXECUTE FUNCTION asegurar_un_proveedor_principal();

-- Función: Calcular totales de caja
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
    SELECT monto_inicial INTO v_monto_inicial
    FROM cajas
    WHERE id_caja = p_caja_id;

    SELECT COALESCE(SUM(valor), 0) INTO v_total_ventas
    FROM ventas
    WHERE caja_id = p_caja_id AND activo = TRUE;

    SELECT COALESCE(SUM(valor), 0) INTO v_total_gastos
    FROM gastos
    WHERE caja_id = p_caja_id AND activo = TRUE;

    RETURN QUERY SELECT 
        v_total_ventas,
        v_total_gastos,
        (v_monto_inicial + v_total_ventas - v_total_gastos) AS diferencia;
END;
$$ LANGUAGE plpgsql;

-- Función: Cerrar caja
CREATE OR REPLACE FUNCTION cerrar_caja(
    p_caja_id INTEGER,
    p_monto_final DECIMAL(15, 2),
    p_notas_cierre TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_totales RECORD;
BEGIN
    SELECT * INTO v_totales FROM calcular_totales_caja(p_caja_id);

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

-- Función: Obtener códigos máximos
CREATE OR REPLACE FUNCTION get_max_codes()
RETURNS TABLE (max_ci INTEGER, max_cb INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      MAX(
        CASE 
          WHEN ci ~ '^[0-9]+$' THEN CAST(ci AS INTEGER)
          ELSE NULL
        END
      ), 
      100000
    ) as max_ci,
    COALESCE(
      MAX(
        CASE 
          WHEN cb ~ '^[0-9]+$' THEN CAST(cb AS INTEGER)
          ELSE NULL
        END
      ), 
      1000000
    ) as max_cb
  FROM repuestos
  WHERE activo = true
    AND ci IS NOT NULL 
    AND cb IS NOT NULL;
END;
$$;

-- ============================================
-- VISTAS
-- ============================================

-- Vista: Resumen de inventario
CREATE OR REPLACE VIEW vista_resumen_inventario AS
SELECT 
    r.CB,
    r.CI,
    r.PRODUCTO,
    r.TIPO,
    r.MARCA,
    r.STOCK,
    r.PRECIO,
    r.STOCK * r.PRECIO AS valor_total_stock,
    COALESCE(SUM(e.CANTIDAD), 0) AS total_entradas,
    COALESCE(SUM(s.cantidad), 0) AS total_salidas,
    r.fecha_creacion,
    r.fecha_actualizacion
FROM repuestos r
LEFT JOIN entradas e ON r.CB = e.CB
LEFT JOIN salidas s ON r.CB = s.cb
WHERE r.activo = TRUE
GROUP BY r.CB, r.CI, r.PRODUCTO, r.TIPO, r.MARCA, r.STOCK, r.PRECIO, r.fecha_creacion, r.fecha_actualizacion;

-- Vista: Stock bajo
CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT 
    CB,
    CI,
    PRODUCTO,
    TIPO,
    MARCA,
    STOCK,
    PRECIO
FROM repuestos
WHERE STOCK < 10 AND activo = TRUE
ORDER BY STOCK ASC;

-- Vista: Comparativa de proveedores
CREATE OR REPLACE VIEW vista_comparativa_proveedores AS
SELECT 
    r.CB,
    r.CI,
    r.PRODUCTO,
    r.TIPO,
    r.MARCA,
    r.REFERENCIA,
    r.PRECIO AS precio_venta_actual,
    pp.proveedor_id,
    prov.cp AS codigo_proveedor,
    prov.nombre_proveedor,
    pp.precio_proveedor,
    pp.es_proveedor_principal,
    pp.fecha_ultima_compra,
    pp.fecha_actualizacion AS fecha_actualizacion_precio,
    RANK() OVER (PARTITION BY r.CB ORDER BY pp.precio_proveedor ASC) AS ranking_precio
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
INNER JOIN proveedores prov ON pp.proveedor_id = prov.id_proveedor
WHERE r.activo = TRUE AND pp.activo = TRUE AND prov.activo = TRUE
ORDER BY r.CB, pp.precio_proveedor ASC;

-- Vista: Reporte diario de caja
CREATE OR REPLACE VIEW vista_reporte_diario_caja AS
SELECT 
    DATE(c.fecha_apertura) as fecha,
    c.id_caja,
    u.nombre as cajero,
    c.jornada,
    c.monto_inicial,
    c.total_ventas,
    c.total_gastos,
    c.monto_final,
    c.diferencia,
    c.estado
FROM cajas c
INNER JOIN usuarios u ON c.usuario_id = u.id_usuario
WHERE c.activo = TRUE
ORDER BY c.fecha_apertura DESC;

-- Vista: Ventas por método de pago
CREATE OR REPLACE VIEW vista_ventas_por_metodo_pago AS
SELECT 
    DATE(v.fecha) as fecha,
    v.metodo_pago,
    COUNT(*) as num_ventas,
    SUM(v.valor) as total_ventas
FROM ventas v
WHERE v.activo = TRUE
GROUP BY DATE(v.fecha), v.metodo_pago
ORDER BY fecha DESC, total_ventas DESC;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias_gastos ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para todas las tablas
CREATE POLICY "allow_all_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_repuestos" ON repuestos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_entradas" ON entradas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_salidas" ON salidas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_devoluciones" ON devoluciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_marcas" ON marcas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_proveedores" ON proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_producto_proveedor" ON producto_proveedor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cajas" ON cajas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_gastos" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_categorias_gastos" ON categorias_gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_subcategorias_gastos" ON subcategorias_gastos FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías de gastos predeterminadas
INSERT INTO categorias_gastos (nombre, descripcion) VALUES
('SERVICIOS', 'Servicios públicos y básicos'),
('PERSONAL', 'Gastos relacionados con personal'),
('OPERACIÓN', 'Gastos operativos del negocio'),
('MANTENIMIENTO', 'Mantenimiento y reparaciones'),
('OTROS', 'Otros gastos varios')
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de gastos
INSERT INTO subcategorias_gastos (categoria_id, nombre) VALUES
(1, 'Luz'),
(1, 'Agua'),
(1, 'Internet'),
(1, 'Teléfono'),
(2, 'Salarios'),
(2, 'Prestaciones'),
(2, 'Transporte'),
(3, 'Papelería'),
(3, 'Limpieza'),
(3, 'Seguridad'),
(4, 'Reparaciones'),
(4, 'Repuestos'),
(5, 'Varios')
ON CONFLICT (categoria_id, nombre) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema (compartido entre inventario y caja)';
COMMENT ON TABLE cajas IS 'Registro de aperturas y cierres de caja';
COMMENT ON TABLE ventas IS 'Registro de ventas (integrado con salidas de inventario)';
COMMENT ON TABLE gastos IS 'Registro de gastos por caja';
COMMENT ON TABLE repuestos IS 'Catálogo de productos del inventario';
COMMENT ON TABLE entradas IS 'Registro de entradas de productos';
COMMENT ON TABLE salidas IS 'Registro de salidas de productos';

COMMENT ON COLUMN usuarios.rol IS 'Rol: administrador, cajero, gestion_inventario, etc.';
COMMENT ON COLUMN ventas.salida_id IS 'Referencia a la salida de inventario (si aplica)';
COMMENT ON COLUMN cajas.diferencia IS 'Diferencia entre monto esperado y monto final';

-- ============================================
-- FIN DEL ESQUEMA INTEGRADO
-- ============================================
