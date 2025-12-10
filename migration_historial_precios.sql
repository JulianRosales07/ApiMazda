-- Migración: Tabla de historial de precios de productos por proveedor
-- Descripción: Almacena el historial de cambios de precios de cada repuesto por proveedor

-- Crear tabla historial_precios
CREATE TABLE IF NOT EXISTS historial_precios (
  id_historial SERIAL PRIMARY KEY,
  producto_cb VARCHAR(50) NOT NULL,
  proveedor_id INTEGER NOT NULL,
  precio_anterior DECIMAL(10, 2),
  precio_nuevo DECIMAL(10, 2) NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_modificacion VARCHAR(100),
  motivo_cambio TEXT,
  activo BOOLEAN DEFAULT TRUE,
  
  -- Foreign keys
  CONSTRAINT fk_producto FOREIGN KEY (producto_cb) 
    REFERENCES repuestos(cb) ON DELETE CASCADE,
  CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_id) 
    REFERENCES proveedores(id_proveedor) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_historial_producto_cb ON historial_precios(producto_cb);
CREATE INDEX idx_historial_proveedor_id ON historial_precios(proveedor_id);
CREATE INDEX idx_historial_fecha_cambio ON historial_precios(fecha_cambio DESC);
CREATE INDEX idx_historial_activo ON historial_precios(activo);

-- Función para registrar automáticamente cambios de precio en producto_proveedor
CREATE OR REPLACE FUNCTION registrar_cambio_precio()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el precio cambió
  IF (TG_OP = 'UPDATE' AND OLD.precio_proveedor IS DISTINCT FROM NEW.precio_proveedor) THEN
    INSERT INTO historial_precios (
      producto_cb,
      proveedor_id,
      precio_anterior,
      precio_nuevo,
      usuario_modificacion,
      motivo_cambio
    ) VALUES (
      NEW.producto_cb,
      NEW.proveedor_id,
      OLD.precio_proveedor,
      NEW.precio_proveedor,
      current_user,
      'Actualización automática'
    );
  END IF;
  
  -- Si es INSERT, registrar el precio inicial
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historial_precios (
      producto_cb,
      proveedor_id,
      precio_anterior,
      precio_nuevo,
      usuario_modificacion,
      motivo_cambio
    ) VALUES (
      NEW.producto_cb,
      NEW.proveedor_id,
      NULL,
      NEW.precio_proveedor,
      current_user,
      'Precio inicial'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios automáticamente
DROP TRIGGER IF EXISTS trigger_cambio_precio ON producto_proveedor;
CREATE TRIGGER trigger_cambio_precio
AFTER INSERT OR UPDATE ON producto_proveedor
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_precio();

-- Función para obtener historial de precios con información completa
CREATE OR REPLACE FUNCTION get_historial_precios_completo(
  p_producto_cb VARCHAR DEFAULT NULL,
  p_proveedor_id INTEGER DEFAULT NULL,
  p_fecha_desde TIMESTAMP DEFAULT NULL,
  p_fecha_hasta TIMESTAMP DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id_historial INTEGER,
  producto_cb VARCHAR,
  producto_nombre VARCHAR,
  proveedor_id INTEGER,
  proveedor_nombre VARCHAR,
  proveedor_cp VARCHAR,
  precio_anterior DECIMAL,
  precio_nuevo DECIMAL,
  diferencia DECIMAL,
  porcentaje_cambio DECIMAL,
  fecha_cambio TIMESTAMP,
  usuario_modificacion VARCHAR,
  motivo_cambio TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id_historial,
    h.producto_cb,
    r.producto AS producto_nombre,
    h.proveedor_id,
    p.nombre_proveedor AS proveedor_nombre,
    p.cp AS proveedor_cp,
    h.precio_anterior,
    h.precio_nuevo,
    (h.precio_nuevo - COALESCE(h.precio_anterior, 0)) AS diferencia,
    CASE 
      WHEN h.precio_anterior IS NULL OR h.precio_anterior = 0 THEN NULL
      ELSE ROUND(((h.precio_nuevo - h.precio_anterior) / h.precio_anterior * 100)::NUMERIC, 2)
    END AS porcentaje_cambio,
    h.fecha_cambio,
    h.usuario_modificacion,
    h.motivo_cambio
  FROM historial_precios h
  INNER JOIN repuestos r ON h.producto_cb = r.cb
  INNER JOIN proveedores p ON h.proveedor_id = p.id_proveedor
  WHERE h.activo = TRUE
    AND (p_producto_cb IS NULL OR h.producto_cb = p_producto_cb)
    AND (p_proveedor_id IS NULL OR h.proveedor_id = p_proveedor_id)
    AND (p_fecha_desde IS NULL OR h.fecha_cambio >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR h.fecha_cambio <= p_fecha_hasta)
  ORDER BY h.fecha_cambio DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE historial_precios IS 'Historial de cambios de precios de productos por proveedor';
COMMENT ON COLUMN historial_precios.precio_anterior IS 'Precio antes del cambio (NULL si es el primer registro)';
COMMENT ON COLUMN historial_precios.precio_nuevo IS 'Precio después del cambio';
COMMENT ON COLUMN historial_precios.motivo_cambio IS 'Razón del cambio de precio';
