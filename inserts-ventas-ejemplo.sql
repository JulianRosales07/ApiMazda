-- =====================================================
-- INSERTS DE EJEMPLO - TABLA VENTAS
-- =====================================================

-- Venta: FACT 2969
INSERT INTO ventas (
    factura_descripcion,
    venta_por,
    valor,
    metodo_pago,
    fecha,
    observaciones,
    usuario_registro,
    caja_id,
    activo
) VALUES (
    'FACT 2969',                    -- factura_descripcion
    'ALMACEN',                      -- venta_por (REDES o ALMACEN)
    130000.00,                      -- valor
    'NEQUI',                        -- metodo_pago
    '2025-01-02 00:00:00-05',      -- fecha (jueves 2 enero 2025)
    NULL,                           -- observaciones (opcional)
    1,                              -- usuario_registro (cambiar por ID real del usuario)
    NULL,                           -- caja_id (NULL si no está asociada a una caja)
    TRUE                            -- activo
);

-- =====================================================
-- ALTERNATIVA: Usando la función registrar_venta
-- =====================================================

SELECT * FROM registrar_venta(
    'FACT 2969',                    -- p_factura_descripcion
    'ALMACEN',                      -- p_venta_por
    130000.00,                      -- p_valor
    'NEQUI',                        -- p_metodo_pago
    1,                              -- p_usuario_registro
    NULL                            -- p_observaciones
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver la venta recién insertada
SELECT 
    id_venta,
    factura_descripcion,
    venta_por,
    valor,
    metodo_pago,
    fecha,
    observaciones,
    usuario_registro,
    caja_id
FROM ventas
WHERE factura_descripcion = 'FACT 2969'
ORDER BY fecha_creacion DESC
LIMIT 1;

-- =====================================================
-- EJEMPLO CON MÚLTIPLES VENTAS
-- =====================================================

-- Si tienes más ventas para insertar, puedes usar este formato:
INSERT INTO ventas (factura_descripcion, venta_por, valor, metodo_pago, fecha, observaciones, usuario_registro, caja_id) VALUES
('FACT 2969', 'ALMACEN', 130000.00, 'NEQUI', '2025-01-02 00:00:00-05', NULL, 1, NULL),
('FACT 2970', 'REDES', 250000.00, 'EFECTIVO', '2025-01-02 10:30:00-05', 'Venta por Instagram', 1, NULL),
('FACT 2971', 'ALMACEN', 180000.00, 'TARJETA', '2025-01-02 14:15:00-05', NULL, 1, NULL);

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. USUARIO_REGISTRO:
   - Debes cambiar el valor '1' por el ID real del usuario que registra la venta
   - Consulta: SELECT id_usuario, nombre FROM usuarios WHERE activo = TRUE;

2. CAJA_ID:
   - Si la venta está asociada a una caja específica, reemplaza NULL con el ID de la caja
   - Ejemplo: caja_id = 8
   - Si es NULL, la venta no está asociada a ninguna caja

3. FECHA:
   - El formato es: 'YYYY-MM-DD HH:MM:SS-05' (zona horaria Colombia)
   - Si solo pones la fecha sin hora, se asume 00:00:00

4. METODO_PAGO:
   - Valores permitidos: 'EFECTIVO', 'TARJETA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'A LA MANO'

5. VENTA_POR:
   - Valores permitidos: 'REDES', 'ALMACEN'

6. VALOR:
   - Debe ser un número positivo
   - Formato: 130000.00 (sin símbolos de moneda)
*/
