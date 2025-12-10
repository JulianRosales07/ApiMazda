-- Borrar todo el contenido de las tablas relacionadas primero
-- Primero borramos las tablas que tienen foreign keys a repuestos

DELETE FROM "public"."salidas";
DELETE FROM "public"."entradas";
DELETE FROM "public"."productos_proveedores";

-- Ahora podemos borrar repuestos
DELETE FROM "public"."repuestos";

-- Si quieres reiniciar los contadores de secuencia (IDs), descomenta las siguientes líneas:
-- ALTER SEQUENCE salidas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE entradas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE productos_proveedores_id_seq RESTART WITH 1;
-- ALTER SEQUENCE repuestos_id_seq RESTART WITH 1;
