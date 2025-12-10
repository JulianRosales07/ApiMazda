import { supabase } from "../config/db.js";

// Obtener todos los productos
export const getAllRepuestos = async () => {
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("repuestos")
      .select("*")
      .eq("activo", true)
      .range(from, from + pageSize - 1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
  
  return allData;
};

// Obtener un producto por CB
export const getRepuestoByCB = async (cb) => {
  const { data, error } = await supabase
    .from("repuestos")
    .select("*")
    .eq("cb", cb)
    .single();
  
  if (error) throw error;
  return data;
};

// Crear un nuevo producto
export const createRepuesto = async (repuesto) => {
  const {
    cb,
    ci,
    producto,
    tipo,
    modelo_especificacion,
    referencia,
    marca,
    existencias_iniciales,
    stock,
    precio,
    descripcion_larga,
    estante,
    nivel,
    usuario_creacion,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .insert([{
      cb,
      ci,
      producto,
      tipo,
      modelo_especificacion,
      referencia,
      marca,
      existencias_iniciales,
      stock,
      precio,
      descripcion_larga,
      estante,
      nivel,
      usuario_creacion,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Actualizar un producto
export const updateRepuesto = async (cb, repuesto) => {
  const {
    ci,
    producto,
    tipo,
    modelo_especificacion,
    referencia,
    marca,
    existencias_iniciales,
    stock,
    precio,
    descripcion_larga,
    estante,
    nivel,
  } = repuesto;

  const { data, error } = await supabase
    .from("repuestos")
    .update({
      ci,
      producto,
      tipo,
      modelo_especificacion,
      referencia,
      marca,
      existencias_iniciales,
      stock,
      precio,
      descripcion_larga,
      estante,
      nivel,
    })
    .eq("cb", cb)
    .select();
  
  if (error) throw error;
  return data;
};

// Eliminar un producto (soft delete)
export const deleteRepuesto = async (cb) => {
  // Generar un sufijo único basado en timestamp para liberar CB y CI
  const timestamp = Date.now();
  
  const { data, error } = await supabase
    .from("repuestos")
    .update({ 
      activo: false,
      cb: `${cb}_deleted_${timestamp}`,
      ci: null
    })
    .eq("cb", cb)
    .select();
  
  if (error) throw error;
  return data;
};

// Buscar repuestos por múltiples criterios
export const searchRepuestos = async (searchParams) => {
  const {
    query,
    cb,
    ci,
    tipo,
    marca,
    referencia,
    estante,
    nivel,
    precio_min,
    precio_max,
    stock_min,
    limit,
  } = searchParams;

  // Si hay límite específico, hacer consulta simple
  if (limit) {
    let supabaseQuery = supabase
      .from("repuestos")
      .select("*")
      .eq("activo", true);

    // Aplicar filtros
    supabaseQuery = applyFilters(supabaseQuery, searchParams);
    supabaseQuery = supabaseQuery.limit(limit);

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data || [];
  }

  // Sin límite: obtener todos los resultados con paginación
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    let supabaseQuery = supabase
      .from("repuestos")
      .select("*")
      .eq("activo", true);

    // Aplicar filtros
    supabaseQuery = applyFilters(supabaseQuery, searchParams);
    supabaseQuery = supabaseQuery.range(from, from + pageSize - 1);

    const { data, error } = await supabaseQuery;
    if (error) throw error;

    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
};

// Función auxiliar para aplicar filtros
function applyFilters(supabaseQuery, searchParams) {
  const {
    query,
    cb,
    ci,
    tipo,
    marca,
    referencia,
    estante,
    nivel,
    precio_min,
    precio_max,
    stock_min,
  } = searchParams;

  // Búsqueda por texto general
  if (query) {
    supabaseQuery = supabaseQuery.or(
      `producto.ilike.%${query}%,descripcion_larga.ilike.%${query}%,marca.ilike.%${query}%,referencia.ilike.%${query}%`
    );
  }

  // Filtros específicos
  if (cb) {
    supabaseQuery = supabaseQuery.ilike("cb", `%${cb}%`);
  }

  if (ci) {
    supabaseQuery = supabaseQuery.ilike("ci", `%${ci}%`);
  }

  if (tipo) {
    supabaseQuery = supabaseQuery.ilike("tipo", `%${tipo}%`);
  }

  if (marca) {
    supabaseQuery = supabaseQuery.ilike("marca", `%${marca}%`);
  }

  if (referencia) {
    supabaseQuery = supabaseQuery.ilike("referencia", `%${referencia}%`);
  }

  if (estante) {
    supabaseQuery = supabaseQuery.ilike("estante", `%${estante}%`);
  }

  if (nivel) {
    supabaseQuery = supabaseQuery.eq("nivel", nivel);
  }

  // Filtros de rango
  if (precio_min !== undefined) {
    supabaseQuery = supabaseQuery.gte("precio", precio_min);
  }

  if (precio_max !== undefined) {
    supabaseQuery = supabaseQuery.lte("precio", precio_max);
  }

  if (stock_min !== undefined) {
    supabaseQuery = supabaseQuery.gte("stock", stock_min);
  }

  return supabaseQuery;
}

// Obtener los valores máximos de CI y CB de forma optimizada
export const getMaxCodes = async () => {
  const { data, error } = await supabase.rpc('get_max_codes');
  
  if (error) {
    // Si la función RPC no existe, hacer consulta directa
    const { data: ciData, error: ciError } = await supabase
      .from("repuestos")
      .select("ci")
      .not("ci", "is", null)
      .order("ci", { ascending: false })
      .limit(1);
    
    const { data: cbData, error: cbError } = await supabase
      .from("repuestos")
      .select("cb")
      .not("cb", "is", null)
      .order("cb", { ascending: false })
      .limit(1);
    
    if (ciError || cbError) throw ciError || cbError;
    
    // Convertir a números y aplicar valores por defecto
    const maxCI = ciData && ciData.length > 0 ? parseInt(ciData[0].ci) || 100000 : 100000;
    const maxCB = cbData && cbData.length > 0 ? parseInt(cbData[0].cb) || 1000000 : 1000000;
    
    return { max_ci: maxCI, max_cb: maxCB };
  }
  
  return data;
};
