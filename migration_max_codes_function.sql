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
