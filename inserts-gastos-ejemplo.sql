-- =====================================================
-- INSERTS DE EJEMPLO - TABLA GASTOS
-- =====================================================

-- PASO 1: Primero necesitamos crear las categorías y subcategorías si no existen

-- Crear categoría "PRESTAMO ALMACEN" si no existe
INSERT INTO categorias_gastos (nombre, descripcion, activo)
VALUES ('PRESTAMO ALMACEN', 'Préstamos relacionados con el almacén', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Crear subcategoría "PRESTAMO JUAND" si no existe
INSERT INTO subcategorias_gastos (id_categoria, nombre, descripcion, activo)
SELECT 
    id_categoria,
    'PRESTAMO JUAND',
    'Préstamos a Juan D',
    TRUE
FROM categorias_gastos
WHERE nombre = 'PRESTAMO ALMACEN'
ON CONFLICT (id_categoria, nombre) DO NOTHING;

-- =====================================================
-- PASO 2: Insertar el gasto
-- =====================================================

-- Opción 1: INSERT directo (necesitas conocer los IDs)
INSERT INTO gastos (
    fecha,
    descripcion,
    id_subcategoria,
    id_categoria,
    metodo_pago,
    valor,
    usuario_registro,
    caja_id,
    activo
) VALUES (
    '2025-01-03 00:00:00-05'::TIMESTAMP WITH TIME ZONE,         -- fecha (viernes 3 enero 2025)
    'PRESTAMO JUAND',                                            -- descripcion
    (SELECT id_subcategoria FROM subcategorias_gastos 
     WHERE nombre = 'PRESTAMO JUAND' LIMIT 1),                   -- id_subcategoria
    (SELECT id_categoria FROM categorias_gastos 
     WHERE nombre = 'PRESTAMO ALMACEN' LIMIT 1),                 -- id_categoria
    'NEQUI',                                                     -- metodo_pago
    758000.00,                                                   -- valor
    1,                                                           -- usuario_registro (cambiar por ID real)
    NULL,                                                        -- caja_id (NULL si no está asociado a una caja)
    TRUE                                                         -- activo
);

-- =====================================================
-- ALTERNATIVA: Usando la función registrar_gasto
-- =====================================================

SELECT * FROM registrar_gasto(
    'PRESTAMO JUAND',                                            -- p_descripcion
    (SELECT id_categoria FROM categorias_gastos 
     WHERE nombre = 'PRESTAMO ALMACEN' LIMIT 1),                 -- p_id_categoria
    (SELECT id_subcategoria FROM subcategorias_gastos 
     WHERE nombre = 'PRESTAMO JUAND' LIMIT 1),                   -- p_id_subcategoria
    'NEQUI',                                                     -- p_metodo_pago
    758000.00,                                                   -- p_valor
    1                                                            -- p_usuario_registro
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver el gasto recién insertado
SELECT 
    g.id_gasto,
    g.fecha,
    g.descripcion,
    cg.nombre as categoria,
    sc.nombre as subcategoria,
    g.metodo_pago,
    g.valor,
    g.usuario_registro,
    g.caja_id
FROM gastos g
JOIN categorias_gastos cg ON g.id_categoria = cg.id_categoria
LEFT JOIN subcategorias_gastos sc ON g.id_subcategoria = sc.id_subcategoria
WHERE g.descripcion = 'PRESTAMO JUAND'
  AND DATE(g.fecha) = '2025-01-03'
ORDER BY g.fecha_creacion DESC
LIMIT 1;

-- =====================================================
-- EJEMPLO CON MÚLTIPLES GASTOS
-- =====================================================

-- Si tienes más gastos para insertar:
INSERT INTO gastos (fecha, descripcion, id_subcategoria, id_categoria, metodo_pago, valor, usuario_registro, caja_id)
SELECT 
    '2025-01-03 00:00:00-05'::TIMESTAMP WITH TIME ZONE,
    'PRESTAMO JUAND',
    sc.id_subcategoria,
    cg.id_categoria,
    'NEQUI',
    758000.00,
    1,
    NULL::INTEGER
FROM categorias_gastos cg
LEFT JOIN subcategorias_gastos sc ON sc.id_categoria = cg.id_categoria AND sc.nombre = 'PRESTAMO JUAND'
WHERE cg.nombre = 'PRESTAMO ALMACEN'

UNION ALL

SELECT 
    '2025-01-03 10:30:00-05'::TIMESTAMP WITH TIME ZONE,
    'Pago de servicios públicos',
    sc.id_subcategoria,
    cg.id_categoria,
    'EFECTIVO',
    150000.00,
    1,
    NULL::INTEGER
FROM categorias_gastos cg
LEFT JOIN subcategorias_gastos sc ON sc.id_categoria = cg.id_categoria AND sc.nombre = 'Luz'
WHERE cg.nombre = 'Servicios';

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todas las categorías disponibles
SELECT id_categoria, nombre, descripcion 
FROM categorias_gastos 
WHERE activo = TRUE
ORDER BY nombre;

-- Ver todas las subcategorías por categoría
SELECT 
    cg.nombre as categoria,
    sc.id_subcategoria,
    sc.nombre as subcategoria,
    sc.descripcion
FROM subcategorias_gastos sc
JOIN categorias_gastos cg ON sc.id_categoria = cg.id_categoria
WHERE sc.activo = TRUE
ORDER BY cg.nombre, sc.nombre;

-- Ver gastos del día
SELECT 
    g.id_gasto,
    g.fecha,
    g.descripcion,
    cg.nombre as categoria,
    sc.nombre as subcategoria,
    g.metodo_pago,
    g.valor
FROM gastos g
JOIN categorias_gastos cg ON g.id_categoria = cg.id_categoria
LEFT JOIN subcategorias_gastos sc ON g.id_subcategoria = sc.id_subcategoria
WHERE DATE(g.fecha) = '2025-01-03'
  AND g.activo = TRUE
ORDER BY g.fecha DESC;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. CATEGORÍAS Y SUBCATEGORÍAS:
   - Primero debes crear la categoría si no existe
   - Luego crear la subcategoría asociada a esa categoría
   - Las subcategorías son opcionales (pueden ser NULL)

2. USUARIO_REGISTRO:
   - Debes cambiar el valor '1' por el ID real del usuario que registra el gasto
   - Consulta: SELECT id_usuario, nombre FROM usuarios WHERE activo = TRUE;

3. CAJA_ID:
   - Si el gasto está asociado a una caja específica, reemplaza NULL con el ID de la caja
   - Ejemplo: caja_id = 8
   - Si es NULL, el gasto no está asociado a ninguna caja

4. FECHA:
   - El formato es: 'YYYY-MM-DD HH:MM:SS-05' (zona horaria Colombia)
   - Si solo pones la fecha sin hora, se asume 00:00:00

5. METODO_PAGO:
   - Valores permitidos: 'EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO'

6. VALOR:
   - Debe ser un número positivo
   - Formato: 758000.00 (sin símbolos de moneda)

7. ID_SUBCATEGORIA:
   - Puede ser NULL si no hay subcategoría específica
   - Si es NULL, solo se usa la categoría principal

8. BÚSQUEDA DE IDs:
   - Si no conoces los IDs, usa subconsultas como en los ejemplos
   - O consulta primero las tablas de categorías y subcategorías
*/

-- =====================================================
-- SCRIPT COMPLETO PARA COPIAR Y PEGAR
-- =====================================================

-- Ejecuta todo esto en orden:

-- 1. Crear categoría
INSERT INTO categorias_gastos (nombre, descripcion, activo)
VALUES ('PRESTAMO ALMACEN', 'Préstamos relacionados con el almacén', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Crear subcategoría
INSERT INTO subcategorias_gastos (id_categoria, nombre, descripcion, activo)
SELECT 
    id_categoria,
    'PRESTAMO JUAND',
    'Préstamos a Juan D',
    TRUE
FROM categorias_gastos
WHERE nombre = 'PRESTAMO ALMACEN'
ON CONFLICT (id_categoria, nombre) DO NOTHING;

-- 3. Insertar gasto
INSERT INTO gastos (fecha, descripcion, id_subcategoria, id_categoria, metodo_pago, valor, usuario_registro, caja_id)
SELECT 
    '2025-01-03 00:00:00-05'::TIMESTAMP WITH TIME ZONE,
    'PRESTAMO JUAND',
    sc.id_subcategoria,
    cg.id_categoria,
    'NEQUI',
    758000.00,
    1,  -- ⚠️ CAMBIAR POR ID REAL DEL USUARIO
    NULL::INTEGER
FROM categorias_gastos cg
LEFT JOIN subcategorias_gastos sc ON sc.id_categoria = cg.id_categoria AND sc.nombre = 'PRESTAMO JUAND'
WHERE cg.nombre = 'PRESTAMO ALMACEN';

-- 4. Verificar
SELECT 
    g.id_gasto,
    g.fecha,
    g.descripcion,
    cg.nombre as categoria,
    sc.nombre as subcategoria,
    g.metodo_pago,
    g.valor
FROM gastos g
JOIN categorias_gastos cg ON g.id_categoria = cg.id_categoria
LEFT JOIN subcategorias_gastos sc ON g.id_subcategoria = sc.id_subcategoria
WHERE g.descripcion = 'PRESTAMO JUAND'
  AND DATE(g.fecha) = '2025-01-03'
ORDER BY g.fecha_creacion DESC
LIMIT 1;
