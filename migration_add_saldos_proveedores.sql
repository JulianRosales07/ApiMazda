-- Migración para agregar campos de saldo a la tabla proveedores
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar columna saldo_a_favor (saldo que el proveedor nos debe)
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS saldo_a_favor DECIMAL(10, 2) DEFAULT 0;

-- Agregar columna saldo_en_contra (saldo que nosotros le debemos al proveedor)
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS saldo_en_contra DECIMAL(10, 2) DEFAULT 0;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN proveedores.saldo_a_favor IS 'Saldo a favor de la empresa (el proveedor nos debe)';
COMMENT ON COLUMN proveedores.saldo_en_contra IS 'Saldo en contra de la empresa (nosotros le debemos al proveedor)';

-- Actualizar registros existentes para que tengan valores por defecto
UPDATE proveedores 
SET saldo_a_favor = 0 
WHERE saldo_a_favor IS NULL;

UPDATE proveedores 
SET saldo_en_contra = 0 
WHERE saldo_en_contra IS NULL;
