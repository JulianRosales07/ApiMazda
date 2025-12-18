-- Migration: Fix foreign key constraint to CASCADE delete
-- This is better for soft deletes - removes the relationship when product is deleted

-- Drop the existing foreign key constraint
ALTER TABLE "producto_proveedor" 
DROP CONSTRAINT IF EXISTS "fk_producto_proveedor_producto";

-- Add the new constraint with ON DELETE CASCADE
-- This will automatically delete producto_proveedor records when a product is deleted
ALTER TABLE "producto_proveedor"
ADD CONSTRAINT "fk_producto_proveedor_producto"
FOREIGN KEY ("producto_cb")
REFERENCES "repuestos"("cb")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Note: With CASCADE, when you delete/update a product's CB, 
-- all related producto_proveedor records are automatically deleted/updated
