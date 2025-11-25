import { supabase } from "../config/db.js";

// Obtener todas las relaciones producto-proveedor
export const getAllProductoProveedor = async () => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .select(
      `
      *,
      proveedores:proveedor_id (nombre_proveedor, cp),
      repuestos:producto_cb (producto)
    `
    )
    .eq("activo", true)
    .order("producto_cb")
    .order("precio_proveedor");

  if (error) throw error;
  return data;
};

// Obtener proveedores de un producto específico
export const getProveedoresByProducto = async (producto_cb) => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .select(
      `
      *,
      proveedores:proveedor_id (nombre_proveedor, cp)
    `
    )
    .eq("producto_cb", producto_cb)
    .eq("activo", true)
    .order("precio_proveedor");

  if (error) throw error;
  return data;
};

// Obtener productos de un proveedor específico
export const getProductosByProveedor = async (proveedor_id) => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .select(
      `
      *,
      repuestos:producto_cb (producto, tipo, marca)
    `
    )
    .eq("proveedor_id", proveedor_id)
    .eq("activo", true)
    .order("producto_cb");

  if (error) throw error;
  return data;
};

// Obtener el proveedor más barato por producto
export const getProveedorMasBarato = async (producto_cb) => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .select(
      `
      *,
      proveedores:proveedor_id (nombre_proveedor, cp, activo)
    `
    )
    .eq("producto_cb", producto_cb)
    .eq("activo", true)
    .order("precio_proveedor", { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Obtener comparativa de proveedores por producto
export const getComparativaProveedores = async (producto_cb) => {
  const { data, error } = await supabase.rpc("get_comparativa_proveedores", {
    p_producto_cb: producto_cb,
  });

  if (error) {
    // Si la función RPC no existe, hacer consulta manual
    const { data: manualData, error: manualError } = await supabase
      .from("producto_proveedor")
      .select(
        `
        id_producto_proveedor,
        producto_cb,
        proveedor_id,
        precio_proveedor,
        es_proveedor_principal,
        fecha_ultima_compra,
        proveedores:proveedor_id (cp, nombre_proveedor),
        repuestos:producto_cb (precio)
      `
      )
      .eq("producto_cb", producto_cb)
      .eq("activo", true)
      .order("precio_proveedor");

    if (manualError) throw manualError;
    return manualData;
  }

  return data;
};

// Crear relación producto-proveedor
export const createProductoProveedor = async (data) => {
  const {
    producto_cb,
    proveedor_id,
    precio_proveedor,
    es_proveedor_principal,
    fecha_ultima_compra,
  } = data;

  const { data: result, error } = await supabase
    .from("producto_proveedor")
    .insert([
      {
        producto_cb,
        proveedor_id,
        precio_proveedor,
        es_proveedor_principal: es_proveedor_principal || false,
        fecha_ultima_compra: fecha_ultima_compra || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return result;
};

// Actualizar relación producto-proveedor
export const updateProductoProveedor = async (id, data) => {
  const { precio_proveedor, es_proveedor_principal, fecha_ultima_compra } =
    data;

  const { data: result, error } = await supabase
    .from("producto_proveedor")
    .update({
      precio_proveedor,
      es_proveedor_principal,
      fecha_ultima_compra,
    })
    .eq("id_producto_proveedor", id)
    .select();

  if (error) throw error;
  return result;
};

// Establecer proveedor principal
export const setProveedorPrincipal = async (producto_cb, proveedor_id) => {
  // Primero desmarcar todos los proveedores principales del producto
  const { error: error1 } = await supabase
    .from("producto_proveedor")
    .update({ es_proveedor_principal: false })
    .eq("producto_cb", producto_cb);

  if (error1) throw error1;

  // Marcar el nuevo proveedor principal
  const { data, error: error2 } = await supabase
    .from("producto_proveedor")
    .update({
      es_proveedor_principal: true,
      fecha_ultima_compra: new Date().toISOString().split("T")[0],
    })
    .eq("producto_cb", producto_cb)
    .eq("proveedor_id", proveedor_id)
    .select();

  if (error2) throw error2;
  return data;
};

// Desactivar relación producto-proveedor
export const deleteProductoProveedor = async (id) => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .update({ activo: false })
    .eq("id_producto_proveedor", id)
    .select();

  if (error) throw error;
  return data;
};

// Obtener relación por ID
export const getProductoProveedorById = async (id) => {
  const { data, error } = await supabase
    .from("producto_proveedor")
    .select("*")
    .eq("id_producto_proveedor", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};
