-- ============================================
-- ESQUEMA POSTGRESQL - SISTEMA DE INVENTARIO
-- ============================================

-- Eliminar tablas existentes (en orden inverso por dependencias)
DROP TABLE IF EXISTS devoluciones CASCADE;
DROP TABLE IF EXISTS salidas CASCADE;
DROP TABLE IF EXISTS entradas CASCADE;
DROP TABLE IF EXISTS repuestos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('administrador', 'usuario')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN (
    'administrador',
    'usuario',
    'administrador_general',
    'gestion_ingresos',
    'gestion_egresos',
    'gestion_inventario'
  ));

INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Julian Rosales', 'julianrosales0703@hotmail.com', '1193051330', 'administrador');

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================
-- TABLA: repuestos
-- ============================================
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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para repuestos
CREATE INDEX idx_repuestos_ci ON repuestos(CI);
CREATE INDEX idx_repuestos_producto ON repuestos(PRODUCTO);
CREATE INDEX idx_repuestos_tipo ON repuestos(TIPO);
CREATE INDEX idx_repuestos_marca ON repuestos(MARCA);
CREATE INDEX idx_repuestos_stock ON repuestos(STOCK);
CREATE INDEX idx_repuestos_referencia ON repuestos(REFERENCIA);

-- ============================================
-- TABLA: entradas
-- ============================================
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

ALTER TABLE entradas
DROP CONSTRAINT fk_entradas_repuesto;

ALTER TABLE entradas
ADD CONSTRAINT fk_entradas_repuesto
FOREIGN KEY (CB) REFERENCES repuestos(CB) ON DELETE RESTRICT;


-- Índices para entradas
CREATE INDEX idx_entradas_factura ON entradas(N_FACTURA);
CREATE INDEX idx_entradas_proveedor ON entradas(PROVEEDOR);
CREATE INDEX idx_entradas_fecha ON entradas(FECHA);
CREATE INDEX idx_entradas_cb ON entradas(CB);
CREATE INDEX idx_entradas_ci ON entradas(CI);
CREATE INDEX idx_entradas_siigo ON entradas(SIIGO);

-- ============================================
-- TABLA: salidas
-- ============================================
CREATE TABLE salidas (
    n_factura INTEGER PRIMARY KEY,
    fecha DATE NOT NULL,
    cb VARCHAR(50) NOT NULL,
    ci VARCHAR(50),
    descripcion VARCHAR(255) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL,
    columna1 TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_registro INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    CONSTRAINT fk_salidas_repuesto FOREIGN KEY (cb) REFERENCES repuestos(CB) ON DELETE RESTRICT
);
UPDATE repuestos
SET stock = 9999
WHERE CB = '1000362';
ALTER TABLE salidas DISABLE TRIGGER USER;

-- Índices para salidas
CREATE INDEX idx_salidas_fecha ON salidas(fecha);
CREATE INDEX idx_salidas_cb ON salidas(cb);
CREATE INDEX idx_salidas_ci ON salidas(ci);
CREATE INDEX idx_salidas_descripcion ON salidas(descripcion);

-- ============================================
-- TABLA: devoluciones
-- ============================================
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

-- Índices para devoluciones
CREATE INDEX idx_devoluciones_tipo ON devoluciones(tipo);
CREATE INDEX idx_devoluciones_producto_cb ON devoluciones(producto_cb);
CREATE INDEX idx_devoluciones_fecha ON devoluciones(fecha);
CREATE INDEX idx_devoluciones_usuario ON devoluciones(usuario_id);
CREATE INDEX idx_devoluciones_factura ON devoluciones(factura_referencia);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para repuestos
CREATE TRIGGER trigger_repuestos_actualizacion
    BEFORE UPDATE ON repuestos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- ============================================
-- FUNCIÓN: Actualizar stock automáticamente en entradas
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_stock_entrada()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el stock del repuesto sumando la cantidad de entrada
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

-- ============================================
-- FUNCIÓN: Actualizar stock automáticamente en salidas
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_stock_salida()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que hay suficiente stock
    IF (SELECT STOCK FROM repuestos WHERE CB = NEW.cb) < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.cb;
    END IF;
    
    -- Actualizar el stock del repuesto restando la cantidad de salida
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

-- ============================================
-- FUNCIÓN: Actualizar stock automáticamente en devoluciones
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_stock_devolucion()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es devolución de cliente, aumentar stock
    IF NEW.tipo = 'cliente' THEN
        UPDATE repuestos
        SET STOCK = STOCK + NEW.cantidad
        WHERE CB = NEW.producto_cb;
    
    -- Si es devolución a proveedor, disminuir stock
    ELSIF NEW.tipo = 'proveedor' THEN
        -- Verificar que hay suficiente stock
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

-- ============================================
-- VISTAS ÚTILES
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

-- Vista: Productos con stock bajo (menos de 10 unidades)
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

-- Vista: Movimientos recientes (últimos 30 días)
CREATE OR REPLACE VIEW vista_movimientos_recientes AS
SELECT 
    'ENTRADA' AS tipo_movimiento,
    e.ID AS id_movimiento,
    e.FECHA AS fecha,
    e.CB,
    e.DESCRIPCION,
    e.CANTIDAD,
    e.COSTO AS valor,
    e.PROVEEDOR AS origen_destino,
    e.N_FACTURA AS factura
FROM entradas e
WHERE e.FECHA >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    'SALIDA' AS tipo_movimiento,
    s.n_factura AS id_movimiento,
    s.fecha AS fecha,
    s.cb AS CB,
    s.descripcion AS DESCRIPCION,
    -s.cantidad AS CANTIDAD,
    s.valor AS valor,
    NULL AS origen_destino,
    s.n_factura::TEXT AS factura
FROM salidas s
WHERE s.fecha >= CURRENT_DATE - INTERVAL '30 days'

ORDER BY fecha DESC;

-- Vista: Estadísticas por producto
CREATE OR REPLACE VIEW vista_estadisticas_producto AS
SELECT 
    r.CB,
    r.PRODUCTO,
    r.STOCK,
    COUNT(DISTINCT e.ID) AS num_entradas,
    COALESCE(SUM(e.CANTIDAD), 0) AS total_cantidad_entradas,
    COUNT(DISTINCT s.n_factura) AS num_salidas,
    COALESCE(SUM(s.cantidad), 0) AS total_cantidad_salidas,
    COALESCE(AVG(e.COSTO), 0) AS costo_promedio,
    r.PRECIO AS precio_venta
FROM repuestos r
LEFT JOIN entradas e ON r.CB = e.CB
LEFT JOIN salidas s ON r.CB = s.cb
WHERE r.activo = TRUE
GROUP BY r.CB, r.PRODUCTO, r.STOCK, r.PRECIO;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@inventario.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXO', 'administrador'),
('Usuario Demo', 'usuario@inventario.com', '$2a$10$XQKvvXQKvvXQKvvXQKvvXO', 'usuario');

-- Insertar algunos productos de ejemplo
INSERT INTO repuestos (CB, CI, PRODUCTO, TIPO, MARCA, EXISTENCIAS_INICIALES, STOCK, PRECIO, usuario_creacion) VALUES
('100001', '100001', 'ABRAZADERA', 'SUJECION', 'GENERICA', 50, 50, 5000, 1),
('100002', '100002', 'FILTRO DE ACEITE', 'FILTROS', 'MANN', 30, 30, 25000, 1),
('100003', '100003', 'PASTILLAS DE FRENO', 'FRENOS', 'BREMBO', 20, 20, 85000, 1),
('100004', '100004', 'BUJIA', 'ENCENDIDO', 'NGK', 100, 100, 12000, 1),
('100005', '100005', 'CORREA DE DISTRIBUCION', 'MOTOR', 'GATES', 15, 15, 120000, 1);

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema con roles de administrador y usuario';
COMMENT ON TABLE repuestos IS 'Catálogo de repuestos y productos del inventario';
COMMENT ON TABLE entradas IS 'Registro de entradas de productos al inventario';
COMMENT ON TABLE salidas IS 'Registro de salidas de productos del inventario';
COMMENT ON TABLE devoluciones IS 'Registro de devoluciones de clientes y a proveedores';

COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: administrador o usuario';
COMMENT ON COLUMN repuestos.CB IS 'Código de barras - Identificador principal del producto';
COMMENT ON COLUMN repuestos.CI IS 'Código interno del producto';
COMMENT ON COLUMN repuestos.STOCK IS 'Cantidad actual en inventario';
COMMENT ON COLUMN entradas.SIIGO IS 'Indica si la entrada fue registrada en SIIGO (SI/NO)';
COMMENT ON COLUMN devoluciones.tipo IS 'Tipo de devolución: cliente (aumenta stock) o proveedor (disminuye stock)';

-- ============================================
-- PERMISOS (OPCIONAL - ajustar según necesidad)
-- ============================================

-- Crear rol para la aplicación
-- CREATE ROLE app_inventario WITH LOGIN PASSWORD 'tu_password_seguro';
-- GRANT CONNECT ON DATABASE tu_base_datos TO app_inventario;
-- GRANT USAGE ON SCHEMA public TO app_inventario;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_inventario;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_inventario;

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================




-- ============================================
-- TABLA: marcas
-- ============================================
CREATE TABLE marcas (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    pais_origen VARCHAR(100),
    sitio_web VARCHAR(255),
    contacto VARCHAR(150),
    telefono VARCHAR(50),
    email VARCHAR(150),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);
ALTER TABLE marcas
DROP COLUMN descripcion,
DROP COLUMN pais_origen,
DROP COLUMN sitio_web,
DROP COLUMN contacto,
DROP COLUMN telefono,
DROP COLUMN email;

-- Índices para marcas
CREATE INDEX idx_marcas_nombre ON marcas(nombre);
CREATE INDEX idx_marcas_activo ON marcas(activo);

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    razon_social VARCHAR(255),
    nit VARCHAR(50),
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(150),
    contacto_principal VARCHAR(150),
    telefono_contacto VARCHAR(50),
    email_contacto VARCHAR(150),
    terminos_pago VARCHAR(100),
    dias_credito INTEGER DEFAULT 0,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para proveedores
CREATE INDEX idx_proveedores_nombre ON proveedores(nombre);
CREATE INDEX idx_proveedores_nit ON proveedores(nit);
CREATE INDEX idx_proveedores_ciudad ON proveedores(ciudad);
CREATE INDEX idx_proveedores_activo ON proveedores(activo);




ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN (
    'administrador',
    'gestion_ingresos',
    'gestion_egresos',
    'gestion_inventario'
  ));


INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
    'Usuario Inventario',
    'inventario@tuservidor.com',
    '$2a$10$hD8v7Ai4P0.eEjNhvEOGEetvO5E0f7LzK9s0hCaB6M4XpgjG7O0yW', -- contraseña: Inventario123
    'gestion_inventario'
);
SELECT DISTINCT rol FROM usuarios;


ALTER TABLE repuestos
ADD COLUMN ESTANTE VARCHAR(20),
ADD COLUMN NIVEL VARCHAR(20);

DELETE FROM marcas;


ALTER TABLE public.salidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_salidas"
ON public.salidas
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.devoluciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_devoluciones"
ON public.devoluciones
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_usuarios"
ON public.usuarios
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_marcas"
ON public.marcas
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_proveedores"
ON public.proveedores
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE public.repuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_repuestos"
ON public.repuestos
FOR ALL
USING (true)
WITH CHECK (true);


ALTER VIEW public.vista_movimientos_recientes
  SET (security_invoker = true);

ALTER VIEW public.vista_estadisticas_producto
  SET (security_invoker = true);

ALTER VIEW public.vista_stock_bajo
  SET (security_invoker = true);

ALTER VIEW public.vista_resumen_inventario
  SET (security_invoker = true);


ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;


SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;



-- ============================================
-- SOLUCIÓN RÁPIDA: Políticas RLS Permisivas
-- ============================================
-- Este script soluciona el error 401 Unauthorized
-- permitiendo todas las operaciones en las tablas

-- PASO 1: Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir lectura pública de usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserción de usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir actualización de usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir eliminación de usuarios" ON usuarios;

DROP POLICY IF EXISTS "Permitir lectura pública de repuestos" ON repuestos;
DROP POLICY IF EXISTS "Permitir inserción de repuestos" ON repuestos;
DROP POLICY IF EXISTS "Permitir actualización de repuestos" ON repuestos;
DROP POLICY IF EXISTS "Permitir eliminación de repuestos" ON repuestos;

DROP POLICY IF EXISTS "Permitir lectura pública de entradas" ON entradas;
DROP POLICY IF EXISTS "Permitir inserción de entradas" ON entradas;
DROP POLICY IF EXISTS "Permitir actualización de entradas" ON entradas;
DROP POLICY IF EXISTS "Permitir eliminación de entradas" ON entradas;

DROP POLICY IF EXISTS "Permitir lectura pública de salidas" ON salidas;
DROP POLICY IF EXISTS "Permitir inserción de salidas" ON salidas;
DROP POLICY IF EXISTS "Permitir actualización de salidas" ON salidas;
DROP POLICY IF EXISTS "Permitir eliminación de salidas" ON salidas;

-- PASO 2: Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salidas ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear políticas permisivas (permitir todo)
-- NOTA: Esto es para desarrollo. En producción deberías usar políticas más restrictivas.

-- Políticas para Usuarios
CREATE POLICY "Permitir todo en usuarios" 
    ON usuarios 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Políticas para Repuestos
CREATE POLICY "Permitir todo en repuestos" 
    ON repuestos 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Políticas para Entradas
CREATE POLICY "Permitir todo en entradas" 
    ON entradas 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Políticas para Salidas
CREATE POLICY "Permitir todo en salidas" 
    ON salidas 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- PASO 4: Verificar que las políticas se crearon
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;






-- ============================================
-- CONFIGURAR SUPABASE AUTH
-- ============================================

-- Paso 1: Agregar columna para vincular con auth.users
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Paso 2: Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);

-- Paso 3: Crear función para crear usuario automáticamente cuando se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_user_id, nombre, email, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'rol', 'usuario')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 4: Crear trigger para ejecutar la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Paso 5: Verificar configuración
SELECT 
    'Usuarios en auth.users' as tabla,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'Usuarios en public.usuarios',
    COUNT(*)
FROM public.usuarios;

-- ============================================
-- CREAR USUARIOS DE PRUEBA EN SUPABASE AUTH
-- ============================================
-- IMPORTANTE: Esto NO se puede hacer con SQL directamente.
-- Debes crear usuarios usando el Dashboard de Supabase o la API.
-- 
-- Opción 1: Dashboard de Supabase
-- 1. Ve a Authentication → Users
-- 2. Haz clic en "Add user"
-- 3. Ingresa email y contraseña
-- 
-- Opción 2: Usar la función de registro desde tu app
-- (Ver código en auth-service.ts)



-- ============================================
-- ACTUALIZAR CONTRASEÑAS CON BCRYPT HASH
-- ============================================
-- Ejecuta esto en Supabase SQL Editor

-- Administrador (contraseña: admin123)
UPDATE usuarios SET password = '$2b$10$KulKVMYXK4blCAX0py3usOdpysLvhmzz95JlGEiQJv5DC5GEz8Ge.' WHERE nombre = 'Administrador';

-- Usuario Demo (contraseña: demo123)
UPDATE usuarios SET password = '$2b$10$ce/oj6cE.IACdtybWjsxlephTEoCUuheNhjQvxWcwCv0MdnAleb26' WHERE nombre = 'Usuario Demo';

-- Prueba Egresos (contraseña: 123)
UPDATE usuarios SET password = '$2b$10$xerl8Cbe60kEzeTYKTjFVuipJhU1sZoQ2OQYfXukGkNjvCa/wo496' WHERE nombre = 'Prueba Egresos';

-- Julian Rosales (contraseña: 1193051330)
UPDATE usuarios SET password = '$2b$10$t43hLjAOBCkEMY29G.4eCO2aXZHmAFzKF85y1cV1LV2b3YvrG92V.' WHERE nombre = 'Julian Rosales';

-- Verificar cambios
SELECT 
    nombre, 
    LEFT(password, 30) || '...' as password_hash, 
    rol,
    CASE 
        WHEN password LIKE '$2%' THEN '✓ Hasheada con bcrypt'
        ELSE '✗ Texto plano'
    END as estado
FROM usuarios
ORDER BY id_usuario;

-- ============================================
-- CREDENCIALES PARA LOGIN
-- ============================================
-- Usuario: Administrador    | Contraseña: admin123
-- Usuario: Usuario Demo     | Contraseña: demo123
-- Usuario: Prueba Egresos   | Contraseña: 123
-- Usuario: Julian Rosales   | Contraseña: 1193051330


SELECT DISTINCT rol FROM usuarios;

-- ============================================
-- MIGRACIÓN: Simplificar tabla proveedores
-- ============================================
-- Este script modifica la tabla proveedores existente
-- para que solo tenga: CI, CP, nombre_proveedor, costo

-- PASO 1: Eliminar columnas innecesarias
ALTER TABLE proveedores
DROP COLUMN IF EXISTS razon_social,
DROP COLUMN IF EXISTS nit,
DROP COLUMN IF EXISTS direccion,
DROP COLUMN IF EXISTS ciudad,
DROP COLUMN IF EXISTS pais,
DROP COLUMN IF EXISTS telefono,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS contacto_principal,
DROP COLUMN IF EXISTS telefono_contacto,
DROP COLUMN IF EXISTS email_contacto,
DROP COLUMN IF EXISTS terminos_pago,
DROP COLUMN IF EXISTS dias_credito,
DROP COLUMN IF EXISTS observaciones;

-- PASO 2: Eliminar constraint UNIQUE de la columna nombre
ALTER TABLE proveedores
DROP CONSTRAINT IF EXISTS proveedores_nombre_key;

-- PASO 3: Renombrar columna 'nombre' a 'nombre_proveedor'
ALTER TABLE proveedores
RENAME COLUMN nombre TO nombre_proveedor;

-- PASO 4: Agregar nuevas columnas
ALTER TABLE proveedores
ADD COLUMN IF NOT EXISTS CI VARCHAR(50),
ADD COLUMN IF NOT EXISTS CP VARCHAR(50),
ADD COLUMN IF NOT EXISTS costo NUMERIC(12, 2) DEFAULT 0;

-- PASO 5: Hacer CP único (después de agregar la columna)
ALTER TABLE proveedores
ADD CONSTRAINT proveedores_cp_unique UNIQUE (CP);

-- PASO 6: Hacer CI y CP NOT NULL (después de que tengan datos)
-- NOTA: Comenta estas líneas si necesitas migrar datos primero
-- ALTER TABLE proveedores
-- ALTER COLUMN CI SET NOT NULL,
-- ALTER COLUMN CP SET NOT NULL;

-- PASO 7: Eliminar índices antiguos si existen
DROP INDEX IF EXISTS idx_proveedores_nit;
DROP INDEX IF EXISTS idx_proveedores_ciudad;

-- PASO 8: Crear nuevos índices
CREATE INDEX IF NOT EXISTS idx_proveedores_ci ON proveedores(CI);
CREATE INDEX IF NOT EXISTS idx_proveedores_cp ON proveedores(CP);

-- PASO 9: Actualizar índice de nombre
DROP INDEX IF EXISTS idx_proveedores_nombre;
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre_proveedor ON proveedores(nombre_proveedor);

-- PASO 10: Verificar estructura final
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'proveedores'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- id_proveedor (SERIAL PRIMARY KEY)
-- CI (VARCHAR(50))
-- CP (VARCHAR(50) UNIQUE)
-- nombre_proveedor (VARCHAR(150))
-- costo (NUMERIC(12, 2))
-- fecha_creacion (TIMESTAMP)
-- fecha_actualizacion (TIMESTAMP)
-- usuario_creacion (INTEGER)
-- activo (BOOLEAN)


-- ============================================
-- INSERTAR DATOS DE PROVEEDORES
-- ============================================
-- Ejecutar DESPUÉS de migrate-proveedores-simple.sql

-- Limpiar datos existentes (opcional)
-- DELETE FROM proveedores;

-- Insertar proveedores
INSERT INTO proveedores (CP, nombre_proveedor) VALUES
('CP-0001', 'ABIN'),
('CP-0002', 'ACEDELCO'),
('CP-0003', 'ALCIA TULIO'),
('CP-0004', 'ALVARO BULIRA'),
('CP-0005', 'AMG'),
('CP-0006', 'ATLANTIS'),
('CP-0007', 'AUTOP ARANGO'),
('CP-0008', 'AUTOPARTES ZG'),
('CP-0009', 'AUTOPERNOS'),
('CP-0010', 'BEX USA'),
('CP-0011', 'BOLIVARIANA DE CAMPEROS'),
('CP-0012', 'BONAPARTE'),
('CP-0013', 'BRAKE PAK'),
('CP-0014', 'BULIRA'),
('CP-0015', 'CASTELMOTORS'),
('CP-0016', 'CDR'),
('CP-0017', 'CIA'),
('CP-0018', 'CJR 1'),
('CP-0019', 'CJR 2'),
('CP-0020', 'COLSAISA'),
('CP-0021', 'COSMOPARTES'),
('CP-0022', 'DEPO'),
('CP-0023', 'DISCAMARGO'),
('CP-0024', 'DISPARTES'),
('CP-0025', 'DISRAMFORD'),
('CP-0026', 'DYD'),
('CP-0027', 'EAGLE'),
('CP-0028', 'ESCARABAJO'),
('CP-0029', 'FALCON'),
('CP-0030', 'FANAPARTS'),
('CP-0031', 'FARALLONES'),
('CP-0032', 'FENIX'),
('CP-0033', 'FLORIDA'),
('CP-0034', 'FRENITECA'),
('CP-0035', 'GOMENAL'),
('CP-0036', 'GUAYACOL'),
('CP-0037', 'GUIAS Y VALVULAS'),
('CP-0038', 'HERMAGU'),
('CP-0039', 'HZ AUTOPARTES'),
('CP-0040', 'IMP JAPON S.A'),
('CP-0041', 'IMP JAPON USA'),
('CP-0042', 'IMP KOREAN CARS'),
('CP-0043', 'IMP REY PAR'),
('CP-0044', 'IMP SUR ALPINE'),
('CP-0045', 'IMP USA'),
('CP-0046', 'IMP VILLA'),
('CP-0047', 'IMPALL'),
('CP-0048', 'INCOLCA'),
('CP-0049', 'INDUFAROS'),
('CP-0050', 'INT-IPS'),
('CP-0051', 'IRAMAC'),
('CP-0052', 'JAPONESA DE REPUESTOS'),
('CP-0053', 'JARBEL'),
('CP-0054', 'KOTRAKO'),
('CP-0055', 'LEIRU'),
('CP-0056', 'LUBEMOTOR'),
('CP-0057', 'MACRO PARTES'),
('CP-0058', 'MAXPARTES'),
('CP-0059', 'MERTEL'),
('CP-0060', 'MIC'),
('CP-0061', 'MJ'),
('CP-0062', 'MLC'),
('CP-0063', 'MONROE'),
('CP-0064', 'MOTOR JAPON'),
('CP-0065', 'MUNDIAL DE FILTROS Y ACEITES'),
('CP-0066', 'MUNDIAL DE REPUESTOS'),
('CP-0067', 'NIFASA'),
('CP-0068', 'NIKKO'),
('CP-0069', 'NIPON USA'),
('CP-0070', 'OBYCO'),
('CP-0071', 'OKLA'),
('CP-0072', 'OMAR GARCIA'),
('CP-0073', 'OMNIPARTS'),
('CP-0074', 'PARRALES'),
('CP-0075', 'PELAEZ'),
('CP-0076', 'PFI'),
('CP-0077', 'PLANET MARKET'),
('CP-0078', 'PLASTI REPUESTOS'),
('CP-0079', 'PRODIJAPON'),
('CP-0080', 'PUNTO AZUL'),
('CP-0081', 'R CALI'),
('CP-0082', 'REDPARTES'),
('CP-0083', 'REUNIDOS'),
('CP-0084', 'RODA SUR'),
('CP-0085', 'RODAMUNDI'),
('CP-0086', 'SAFRENOS'),
('CP-0087', 'SINTECO'),
('CP-0088', 'SURTI EMBLEMAS'),
('CP-0089', 'TNK'),
('CP-0090', 'TOP GLOBAL'),
('CP-0091', 'CASA TORO'),
('CP-0092', 'TRACTORES Y PARTES'),
('CP-0093', 'TYC'),
('CP-0094', 'TYM'),
('CP-0095', 'VASTELMOTORS'),
('CP-0096', 'VEHINYECCION'),
('CP-0097', 'YADAS'),
('CP-0098', 'YAMATO'),
('CP-0099', 'WORLD-P'),
('CP-0100', 'TAKEDO'),
('CP-0101', 'TELLEZ'),
('CP-0102', 'DISTRICOL'),
('CP-0103', 'MG AUTOP'),
('CP-0104', 'COMERCIALIZADORA R CALI'),
('CP-0105', 'MP'),
('CP-0106', 'IMP SUPER JAPON'),
('CP-0107', 'JAIME TABORDA'),
('CP-0108', 'NIPONAUTOS'),
('CP-0109', 'IMPORTVILLA')
('CP-0110', 'FRACO')
ON CONFLICT (CP) DO NOTHING;

-- Insertar proveedores
INSERT INTO proveedores (CP, nombre_proveedor) VALUES
('CP-0110', 'FRACO')
ON CONFLICT (CP) DO NOTHING;

-- Verificar inserción
SELECT COUNT(*) as total_proveedores FROM proveedores;

-- Ver primeros 10 registros
SELECT * FROM proveedores ORDER BY CP LIMIT 10;


-- ============================================
-- ESQUEMA COMPLEMENTARIO - SISTEMA DE PROVEEDORES Y COMPARATIVAS
-- ============================================
-- Este script agrega las tablas necesarias para la funcionalidad de
-- comparativa de proveedores al esquema existente

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    ci VARCHAR(50),
    cp VARCHAR(50) NOT NULL UNIQUE,
    nombre_proveedor VARCHAR(255) NOT NULL,
    costo NUMERIC(12, 2) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_cp ON proveedores(cp);
CREATE INDEX IF NOT EXISTS idx_proveedores_ci ON proveedores(ci);
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(nombre_proveedor);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);

-- ============================================
-- TABLA: producto_proveedor (Relación N:N con precios)
-- ============================================
CREATE TABLE IF NOT EXISTS producto_proveedor (
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

-- Índices para producto_proveedor
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_producto ON producto_proveedor(producto_cb);
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_proveedor ON producto_proveedor(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_precio ON producto_proveedor(precio_proveedor);
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_principal ON producto_proveedor(es_proveedor_principal);
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_activo ON producto_proveedor(activo);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Trigger para proveedores (usa la función existente actualizar_fecha_modificacion)
DROP TRIGGER IF EXISTS trigger_proveedores_actualizacion ON proveedores;
CREATE TRIGGER trigger_proveedores_actualizacion
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para producto_proveedor
DROP TRIGGER IF EXISTS trigger_producto_proveedor_actualizacion ON producto_proveedor;
CREATE TRIGGER trigger_producto_proveedor_actualizacion
    BEFORE UPDATE ON producto_proveedor
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- ============================================
-- FUNCIÓN: Asegurar solo un proveedor principal por producto
-- ============================================
CREATE OR REPLACE FUNCTION asegurar_un_proveedor_principal()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando como proveedor principal
    IF NEW.es_proveedor_principal = TRUE THEN
        -- Desmarcar todos los demás proveedores principales para este producto
        UPDATE producto_proveedor
        SET es_proveedor_principal = FALSE
        WHERE producto_cb = NEW.producto_cb
        AND proveedor_id != NEW.proveedor_id
        AND es_proveedor_principal = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_asegurar_un_proveedor_principal ON producto_proveedor;
CREATE TRIGGER trigger_asegurar_un_proveedor_principal
    BEFORE INSERT OR UPDATE ON producto_proveedor
    FOR EACH ROW
    WHEN (NEW.es_proveedor_principal = TRUE)
    EXECUTE FUNCTION asegurar_un_proveedor_principal();

-- ============================================
-- VISTAS PARA COMPARATIVAS DE PROVEEDORES
-- ============================================

-- Vista: Comparativa de proveedores por producto
CREATE OR REPLACE VIEW vista_comparativa_proveedores AS
SELECT 
    r.CB,
    r.CI,
    r.PRODUCTO,
    r.TIPO,
    r.MARCA,
    r.REFERENCIA,
    r.PRECIO AS precio_venta_actual,
    pp.id_producto_proveedor,
    pp.proveedor_id,
    prov.cp AS codigo_proveedor,
    prov.nombre_proveedor,
    pp.precio_proveedor,
    pp.es_proveedor_principal,
    pp.fecha_ultima_compra,
    pp.fecha_actualizacion AS fecha_actualizacion_precio,
    RANK() OVER (PARTITION BY r.CB ORDER BY pp.precio_proveedor ASC) AS ranking_precio,
    CASE 
        WHEN RANK() OVER (PARTITION BY r.CB ORDER BY pp.precio_proveedor ASC) = 1 
        THEN TRUE 
        ELSE FALSE 
    END AS es_mas_barato
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
INNER JOIN proveedores prov ON pp.proveedor_id = prov.id_proveedor
WHERE r.activo = TRUE AND pp.activo = TRUE AND prov.activo = TRUE
ORDER BY r.CB, pp.precio_proveedor ASC;

-- Vista: Proveedor más barato por producto
CREATE OR REPLACE VIEW vista_proveedor_mas_barato AS
SELECT DISTINCT ON (CB)
    CB,
    CI,
    PRODUCTO,
    proveedor_id,
    codigo_proveedor,
    nombre_proveedor,
    precio_proveedor AS precio_mas_barato,
    fecha_ultima_compra,
    ROUND(((precio_venta_actual - precio_proveedor) / NULLIF(precio_proveedor, 0) * 100), 2) AS margen_ganancia_porcentaje
FROM vista_comparativa_proveedores
WHERE ranking_precio = 1
ORDER BY CB, precio_proveedor ASC;

-- Vista: Productos con múltiples proveedores
CREATE OR REPLACE VIEW vista_productos_multiples_proveedores AS
SELECT 
    r.CB,
    r.CI,
    r.PRODUCTO,
    r.TIPO,
    r.MARCA,
    COUNT(pp.proveedor_id) AS num_proveedores,
    MIN(pp.precio_proveedor) AS precio_minimo,
    MAX(pp.precio_proveedor) AS precio_maximo,
    AVG(pp.precio_proveedor) AS precio_promedio,
    MAX(pp.precio_proveedor) - MIN(pp.precio_proveedor) AS diferencia_precio,
    ROUND(((MAX(pp.precio_proveedor) - MIN(pp.precio_proveedor)) / NULLIF(MIN(pp.precio_proveedor), 0) * 100), 2) AS diferencia_porcentaje
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
WHERE r.activo = TRUE AND pp.activo = TRUE
GROUP BY r.CB, r.CI, r.PRODUCTO, r.TIPO, r.MARCA
HAVING COUNT(pp.proveedor_id) > 1
ORDER BY diferencia_porcentaje DESC;

-- Vista: Historial de cambios de proveedor principal
CREATE OR REPLACE VIEW vista_proveedores_principales AS
SELECT 
    r.CB,
    r.CI,
    r.PRODUCTO,
    prov.id_proveedor,
    prov.cp AS codigo_proveedor,
    prov.nombre_proveedor,
    pp.precio_proveedor,
    pp.fecha_ultima_compra,
    pp.fecha_actualizacion
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
INNER JOIN proveedores prov ON pp.proveedor_id = prov.id_proveedor
WHERE pp.es_proveedor_principal = TRUE
AND r.activo = TRUE 
AND pp.activo = TRUE 
AND prov.activo = TRUE
ORDER BY r.CB;

-- ============================================
-- FUNCIONES ÚTILES PARA COMPARATIVAS
-- ============================================

-- Función: Obtener el proveedor más barato para un producto
CREATE OR REPLACE FUNCTION obtener_proveedor_mas_barato(p_producto_cb VARCHAR)
RETURNS TABLE (
    proveedor_id INTEGER,
    nombre_proveedor VARCHAR,
    precio_proveedor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.proveedor_id,
        prov.nombre_proveedor,
        pp.precio_proveedor
    FROM producto_proveedor pp
    INNER JOIN proveedores prov ON pp.proveedor_id = prov.id_proveedor
    WHERE pp.producto_cb = p_producto_cb
    AND pp.activo = TRUE
    AND prov.activo = TRUE
    ORDER BY pp.precio_proveedor ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función: Actualizar precio de venta basado en proveedor seleccionado
CREATE OR REPLACE FUNCTION actualizar_precio_por_proveedor(
    p_producto_cb VARCHAR,
    p_proveedor_id INTEGER,
    p_margen_porcentaje NUMERIC DEFAULT 30
)
RETURNS VOID AS $$
DECLARE
    v_precio_proveedor NUMERIC;
    v_nuevo_precio_venta NUMERIC;
BEGIN
    -- Obtener el precio del proveedor
    SELECT precio_proveedor INTO v_precio_proveedor
    FROM producto_proveedor
    WHERE producto_cb = p_producto_cb
    AND proveedor_id = p_proveedor_id
    AND activo = TRUE;
    
    IF v_precio_proveedor IS NULL THEN
        RAISE EXCEPTION 'No se encontró el precio del proveedor para el producto %', p_producto_cb;
    END IF;
    
    -- Calcular nuevo precio de venta con margen
    v_nuevo_precio_venta := v_precio_proveedor * (1 + p_margen_porcentaje / 100);
    
    -- Actualizar el precio del producto
    UPDATE repuestos
    SET PRECIO = v_nuevo_precio_venta
    WHERE CB = p_producto_cb;
    
    -- Marcar este proveedor como principal
    UPDATE producto_proveedor
    SET es_proveedor_principal = FALSE
    WHERE producto_cb = p_producto_cb;
    
    UPDATE producto_proveedor
    SET es_proveedor_principal = TRUE,
        fecha_ultima_compra = CURRENT_DATE
    WHERE producto_cb = p_producto_cb
    AND proveedor_id = p_proveedor_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================

COMMENT ON TABLE proveedores IS 'Catálogo de proveedores de productos';
COMMENT ON TABLE producto_proveedor IS 'Relación entre productos y proveedores con precios específicos para comparativas';

COMMENT ON COLUMN proveedores.cp IS 'Código de proveedor - Identificador único del proveedor';
COMMENT ON COLUMN proveedores.ci IS 'Código interno del producto asociado al proveedor';
COMMENT ON COLUMN proveedores.costo IS 'Costo base del proveedor (puede ser sobrescrito por producto_proveedor)';

COMMENT ON COLUMN producto_proveedor.precio_proveedor IS 'Precio específico que ofrece este proveedor para este producto';
COMMENT ON COLUMN producto_proveedor.es_proveedor_principal IS 'Indica si este es el proveedor principal/seleccionado para el producto';
COMMENT ON COLUMN producto_proveedor.fecha_ultima_compra IS 'Fecha de la última compra realizada a este proveedor para este producto';

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- NOTA: Estos datos de ejemplo solo se insertarán si existen los productos
-- correspondientes en la tabla repuestos. Si no existen, simplemente se omitirán.

-- Insertar proveedores de ejemplo
INSERT INTO proveedores (cp, ci, nombre_proveedor, costo, usuario_creacion) VALUES
('PROV-001', NULL, 'Repuestos del Norte S.A.', 0, 1),
('PROV-002', NULL, 'AutoPartes Colombia', 0, 1),
('PROV-003', NULL, 'Distribuidora Nacional', 0, 1),
('PROV-004', NULL, 'Importadora de Repuestos', 0, 1),
('PROV-005', NULL, 'Mayorista AutoParts', 0, 1)
ON CONFLICT (cp) DO NOTHING;

-- ============================================
-- INSERTAR RELACIONES PRODUCTO-PROVEEDOR DE EJEMPLO
-- ============================================
-- IMPORTANTE: Descomenta y ejecuta estas líneas SOLO si ya tienes productos
-- en la tabla repuestos con los códigos CB especificados.
-- De lo contrario, obtendrás un error de foreign key.

/*
-- Insertar relaciones producto-proveedor de ejemplo
-- (Requiere que existan productos con CB 100001, 100002, etc. en la tabla repuestos)

INSERT INTO producto_proveedor (producto_cb, proveedor_id, precio_proveedor, es_proveedor_principal) VALUES
-- Producto 100001 (ABRAZADERA) con 3 proveedores
('100001', 1, 4500, TRUE),   -- Proveedor 1: $4,500 (principal)
('100001', 2, 4800, FALSE),  -- Proveedor 2: $4,800
('100001', 3, 4200, FALSE),  -- Proveedor 3: $4,200 (más barato)

-- Producto 100002 (FILTRO DE ACEITE) con 3 proveedores
('100002', 1, 23000, FALSE), -- Proveedor 1: $23,000
('100002', 2, 22500, TRUE),  -- Proveedor 2: $22,500 (principal)
('100002', 4, 24000, FALSE), -- Proveedor 4: $24,000

-- Producto 100003 (PASTILLAS DE FRENO) con 2 proveedores
('100003', 2, 82000, TRUE),  -- Proveedor 2: $82,000 (principal)
('100003', 3, 80000, FALSE), -- Proveedor 3: $80,000 (más barato)

-- Producto 100004 (BUJIA) con 3 proveedores
('100004', 1, 11500, FALSE), -- Proveedor 1: $11,500
('100004', 4, 11000, TRUE),  -- Proveedor 4: $11,000 (principal y más barato)
('100004', 5, 12000, FALSE), -- Proveedor 5: $12,000

-- Producto 100005 (CORREA DE DISTRIBUCION) con 2 proveedores
('100005', 3, 115000, TRUE), -- Proveedor 3: $115,000 (principal)
('100005', 4, 118000, FALSE) -- Proveedor 4: $118,000
ON CONFLICT (producto_cb, proveedor_id) DO NOTHING;
*/

-- ============================================
-- SCRIPT ALTERNATIVO: Insertar relaciones para productos existentes
-- ============================================
-- Este script inserta relaciones solo para productos que realmente existen
-- Ejecuta esto después de tener productos en tu base de datos

/*
DO $$
DECLARE
    v_producto RECORD;
    v_proveedor_id INTEGER;
BEGIN
    -- Para cada producto existente, crear relaciones con 2-3 proveedores aleatorios
    FOR v_producto IN 
        SELECT CB FROM repuestos WHERE activo = TRUE LIMIT 10
    LOOP
        -- Insertar 3 proveedores con precios variados
        FOR v_proveedor_id IN 1..3 LOOP
            INSERT INTO producto_proveedor (
                producto_cb, 
                proveedor_id, 
                precio_proveedor, 
                es_proveedor_principal
            ) VALUES (
                v_producto.CB,
                v_proveedor_id,
                (SELECT PRECIO FROM repuestos WHERE CB = v_producto.CB) * (0.7 + (v_proveedor_id * 0.1)),
                v_proveedor_id = 1  -- El primer proveedor será el principal
            )
            ON CONFLICT (producto_cb, proveedor_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
*/

-- ============================================
-- CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ============================================

-- Ver todos los productos con sus proveedores y precios
-- SELECT * FROM vista_comparativa_proveedores;

-- Ver el proveedor más barato por producto
-- SELECT * FROM vista_proveedor_mas_barato;

-- Ver productos con múltiples proveedores y diferencias de precio
-- SELECT * FROM vista_productos_multiples_proveedores;

-- Ver proveedores principales actuales
-- SELECT * FROM vista_proveedores_principales;

-- Obtener el proveedor más barato para un producto específico
-- SELECT * FROM obtener_proveedor_mas_barato('100001');

-- Actualizar precio de venta basado en proveedor (con 30% de margen)
-- SELECT actualizar_precio_por_proveedor('100001', 3, 30);

-- ============================================
-- FIN DEL ESQUEMA COMPLEMENTARIO
-- ============================================


-- Habilitar RLS
ALTER TABLE producto_proveedor ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON producto_proveedor FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir escritura a usuarios autenticados
CREATE POLICY "Permitir escritura a usuarios autenticados" 
ON producto_proveedor FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 1. Make 'cb' nullable in 'salidas' table
ALTER TABLE salidas ALTER COLUMN cb DROP NOT NULL;
-- 2. Update the stock update trigger to ignore sales with no product (NULL cb)
CREATE OR REPLACE FUNCTION actualizar_stock_salida()
RETURNS TRIGGER AS $$
BEGIN
    -- Si no hay CB (Venta externa), no hacer nada con el stock
    IF NEW.cb IS NULL THEN
        RETURN NEW;
    END IF;
    -- Verificar que hay suficiente stock
    IF (SELECT STOCK FROM repuestos WHERE CB = NEW.cb) < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.cb;
    END IF;
    
    -- Actualizar el stock del repuesto restando la cantidad de salida
    UPDATE repuestos
    SET STOCK = STOCK - NEW.cantidad
    WHERE CB = NEW.cb;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Script para actualizar el trigger de salidas y permitir devoluciones
-- Ejecutar este script en Supabase SQL Editor

-- Eliminar el trigger existente
DROP TRIGGER IF EXISTS trigger_actualizar_stock_salida ON salidas;

-- Eliminar la función existente
DROP FUNCTION IF EXISTS actualizar_stock_salida();

-- Crear la función actualizada que maneja cantidades negativas (devoluciones)
CREATE OR REPLACE FUNCTION actualizar_stock_salida()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo verificar stock si la cantidad es positiva (salida normal)
    -- Si es negativa (devolución), no verificar porque estamos sumando al stock
    IF NEW.cantidad > 0 THEN
        IF (SELECT STOCK FROM repuestos WHERE CB = NEW.cb) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.cb;
        END IF;
    END IF;
    
    -- Actualizar el stock del repuesto restando la cantidad de salida
    -- Si cantidad es negativa, STOCK - (-cantidad) = STOCK + cantidad
    UPDATE repuestos
    SET STOCK = STOCK - NEW.cantidad
    WHERE CB = NEW.cb;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
CREATE TRIGGER trigger_actualizar_stock_salida
    AFTER INSERT ON salidas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_salida();

-- Verificar que el trigger se creó correctamente
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_actualizar_stock_salida';


-- ============================================
-- FIX: Enable RLS on all tables with policies
-- ============================================

-- Enable RLS on all tables that have policies but RLS is disabled
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FIX: Recreate views without SECURITY DEFINER
-- ============================================

-- Drop existing views (CASCADE to handle dependencies)
DROP VIEW IF EXISTS vista_proveedor_mas_barato CASCADE;
DROP VIEW IF EXISTS vista_productos_multiples_proveedores CASCADE;
DROP VIEW IF EXISTS vista_proveedores_principales CASCADE;
DROP VIEW IF EXISTS vista_comparativa_proveedores CASCADE;

-- Recreate vista_comparativa_proveedores (explicitly SECURITY INVOKER)
CREATE VIEW vista_comparativa_proveedores 
WITH (security_invoker = true) AS
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

-- Recreate vista_proveedor_mas_barato (explicitly SECURITY INVOKER)
CREATE VIEW vista_proveedor_mas_barato 
WITH (security_invoker = true) AS
SELECT DISTINCT ON (CB)
    CB,
    CI,
    PRODUCTO,
    proveedor_id,
    codigo_proveedor,
    nombre_proveedor,
    precio_proveedor AS precio_mas_barato,
    fecha_ultima_compra
FROM vista_comparativa_proveedores
WHERE ranking_precio = 1
ORDER BY CB, precio_proveedor ASC;

-- Recreate vista_proveedores_principales (explicitly SECURITY INVOKER)
CREATE VIEW vista_proveedores_principales 
WITH (security_invoker = true) AS
SELECT 
    r.CB,
    r.PRODUCTO,
    pp.proveedor_id,
    prov.nombre_proveedor,
    pp.precio_proveedor
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
INNER JOIN proveedores prov ON pp.proveedor_id = prov.id_proveedor
WHERE pp.es_proveedor_principal = TRUE
  AND r.activo = TRUE 
  AND pp.activo = TRUE 
  AND prov.activo = TRUE;

-- Recreate vista_productos_multiples_proveedores (explicitly SECURITY INVOKER)
CREATE VIEW vista_productos_multiples_proveedores 
WITH (security_invoker = true) AS
SELECT 
    r.CB,
    r.PRODUCTO,
    COUNT(pp.proveedor_id) AS num_proveedores
FROM repuestos r
INNER JOIN producto_proveedor pp ON r.CB = pp.producto_cb
WHERE r.activo = TRUE AND pp.activo = TRUE
GROUP BY r.CB, r.PRODUCTO
HAVING COUNT(pp.proveedor_id) > 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('devoluciones', 'entradas', 'marcas', 'producto_proveedor', 
                    'proveedores', 'repuestos', 'salidas', 'usuarios')
ORDER BY tablename;

-- Check views security settings
SELECT 
    schemaname,
    viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE 'vista_%'
ORDER BY viewname;


-- ============================================
-- FIX: Set search_path on functions for security
-- ============================================
-- This prevents search_path injection attacks by fixing the schema search order

-- Fix: asegurar_un_proveedor_principal
ALTER FUNCTION asegurar_un_proveedor_principal() 
SET search_path = public, pg_temp;

-- Fix: obtener_proveedor_mas_barato
ALTER FUNCTION obtener_proveedor_mas_barato(VARCHAR) 
SET search_path = public, pg_temp;

-- Fix: actualizar_precio_por_proveedor
ALTER FUNCTION actualizar_precio_por_proveedor(VARCHAR, INTEGER, NUMERIC) 
SET search_path = public, pg_temp;

-- Fix: actualizar_stock_salida
ALTER FUNCTION actualizar_stock_salida() 
SET search_path = public, pg_temp;

-- Fix: handle_new_user
ALTER FUNCTION handle_new_user() 
SET search_path = public, pg_temp;

-- ============================================
-- VERIFICATION: Check function search_path settings
-- ============================================
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    COALESCE(
        (SELECT setting 
         FROM unnest(p.proconfig) as setting 
         WHERE setting LIKE 'search_path=%'),
        'NOT SET'
    ) as search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'asegurar_un_proveedor_principal',
    'obtener_proveedor_mas_barato', 
    'actualizar_precio_por_proveedor',
    'actualizar_stock_salida',
    'handle_new_user'
  )
ORDER BY p.proname;


-- ============================================
-- FIX: Remove duplicate RLS policies
-- ============================================
-- Keep only one policy per table (the English named ones)
-- This will improve performance significantly

-- DEVOLUCIONES: Drop Spanish duplicate
DROP POLICY IF EXISTS "Permitir todo en devoluciones" ON devoluciones;

-- ENTRADAS: Drop Spanish duplicate (if exists)
DROP POLICY IF EXISTS "Permitir todo en entradas" ON entradas;

-- PROVEEDORES: Drop Spanish duplicate
DROP POLICY IF EXISTS "Permitir todo en proveedores" ON proveedores;

-- REPUESTOS: Drop Spanish duplicate
DROP POLICY IF EXISTS "Permitir todo en repuestos" ON repuestos;

-- SALIDAS: Drop Spanish duplicate
DROP POLICY IF EXISTS "Permitir todo en salidas" ON salidas;

-- USUARIOS: Drop Spanish duplicate
DROP POLICY IF EXISTS "Permitir todo en usuarios" ON usuarios;

-- MARCAS: Drop duplicate (if exists)
DROP POLICY IF EXISTS "Permitir todo en marcas" ON marcas;

-- PRODUCTO_PROVEEDOR: Drop all redundant policies, keep only one comprehensive policy
DROP POLICY IF EXISTS "Permitir actualización de producto_proveedor" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir eliminación de producto_proveedor" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir escritura a usuarios autenticados" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir inserción de producto_proveedor" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir lectura de producto_proveedor" ON producto_proveedor;
DROP POLICY IF EXISTS "Permitir todo en producto_proveedor" ON producto_proveedor;

-- Create single comprehensive policy for producto_proveedor
CREATE POLICY "allow_all_producto_proveedor" ON producto_proveedor
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- ============================================
-- FIX: Remove duplicate index
-- ============================================
-- Drop the duplicate index on proveedores
DROP INDEX IF EXISTS idx_proveedores_nombre;
-- Keep idx_proveedores_nombre_proveedor as it's more descriptive

-- ============================================
-- VERIFICATION: Check remaining policies
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('devoluciones', 'entradas', 'marcas', 'producto_proveedor', 
                    'proveedores', 'repuestos', 'salidas', 'usuarios')
ORDER BY tablename, policyname;

-- ============================================
-- VERIFICATION: Check indexes on proveedores
-- ============================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'proveedores'
ORDER BY indexname;






-- Primero verificar si existe
SELECT * FROM repuestos WHERE cb = '1009394';

-- Si existe, eliminarlo
DELETE FROM repuestos WHERE cb = '1009394';



-- Agregar columna saldo_a_favor (saldo que el proveedor nos debe)
ALTER TABLE proveedores 
ADD COLUMN saldo_a_favor NUMERIC(10, 2) DEFAULT 0;

-- Agregar columna saldo_en_contra (saldo que nosotros le debemos al proveedor)
ALTER TABLE proveedores 
ADD COLUMN saldo_en_contra NUMERIC(10, 2) DEFAULT 0;

-- Actualizar regist



-- Función RPC optimizada para obtener los valores máximos de CI y CB
-- Esta función se ejecuta directamente en la base de datos para máxima eficiencia

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

-- Comentario explicativo
COMMENT ON FUNCTION get_max_codes() IS 'Obtiene los valores máximos de CI y CB de forma optimizada. Retorna valores por defecto (100000 para CI, 1000000 para CB) si no hay datos.';

-- Índices recomendados para optimizar las consultas MAX
-- Solo crear si no existen
CREATE INDEX IF NOT EXISTS idx_repuestos_ci_numeric 
ON repuestos(CAST(ci AS INTEGER)) 
WHERE ci IS NOT NULL 
  AND ci ~ '^[0-9]+$' 
  AND activo = true;

CREATE INDEX IF NOT EXISTS idx_repuestos_cb_numeric 
ON repuestos(CAST(cb AS INTEGER)) 
WHERE cb IS NOT NULL 
  AND cb ~ '^[0-9]+$' 
  AND activo = true;

-- Verificar que la función se creó correctamente
SELECT get_max_codes();


-- Borrar todo el contenido de la tabla repuestos
DELETE FROM "public"."repuestos";

-- Si quieres reiniciar los contadores de secuencia (IDs), descomenta la siguiente línea:
-- ALTER SEQUENCE repuestos_id_seq RESTART WITH 1;
