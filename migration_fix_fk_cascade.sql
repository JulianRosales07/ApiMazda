-- Migration: Fix foreign key constraint to allow soft deletes
-- This changes the FK constraint to SET NULL on delete instead of RESTRICT

-- Drop the existing foreign key constraint
ALTER TABLE "producto_proveedor" 
DROP CONSTRAINT IF EXISTS "fk_producto_proveedor_producto";

-- Add the new constraint with ON DELETE SET NULL
ALTER TABLE "producto_proveedor"
ADD CONSTRAINT "fk_producto_proveedor_producto"
FOREIGN KEY ("producto_cb")
REFERENCES "repuestos"("cb")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Note: This allows the producto_cb to become NULL when a product is deleted
-- If you prefer to CASCADE delete (remove the relationship entirely), use:
-- ON DELETE CASCADE instead of ON DELETE SET NULL
