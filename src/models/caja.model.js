import { supabase } from "../config/db.js";

// ============================================
// CAJAS
// ============================================

// Obtener todas las cajas
export const getAllCajas = async (filters = {}) => {
  let query = supabase
    .from("cajas")
    .select(`
      *,
      usuario:usuarios!cajas_usuario_id_fkey(id_usuario, nombre, email)
    `)
    .eq("activo", true)
    .order("fecha_apertura", { ascending: false });

  // Aplicar filtros
  if (filters.usuario_id) {
    query = query.eq("usuario_id", filters.usuario_id);
  }
  if (filters.estado) {
    query = query.eq("estado", filters.estado);
  }
  if (filters.jornada) {
    query = query.eq("jornada", filters.jornada);
  }
  if (filters.fecha_inicio) {
    query = query.gte("fecha_apertura", filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    query = query.lte("fecha_apertura", filters.fecha_fin);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transformar los datos para incluir usuario_nombre
  const cajasConUsuario = (data || []).map(caja => ({
    ...caja,
    usuario_nombre: caja.usuario?.nombre || 'Usuario Desconocido',
    usuario_email: caja.usuario?.email || null
  }));

  return cajasConUsuario;
};

// Obtener caja por ID
export const getCajaById = async (id) => {
  const { data, error } = await supabase
    .from("cajas")
    .select(`
      *,
      usuario:usuarios!cajas_usuario_id_fkey(id_usuario, nombre, email)
    `)
    .eq("id_caja", parseInt(id))
    .single();

  if (error) throw error;

  // Agregar campos de usuario
  if (data) {
    return {
      ...data,
      usuario_nombre: data.usuario?.nombre || 'Usuario Desconocido',
      usuario_email: data.usuario?.email || null
    };
  }

  return data;
};

// Obtener caja abierta de un usuario
export const getCajaAbierta = async (usuario_id) => {
  const { data, error } = await supabase
    .from("cajas")
    .select(`
      *,
      usuario:usuarios!cajas_usuario_id_fkey(id_usuario, nombre, email)
    `)
    .eq("usuario_id", usuario_id)
    .eq("estado", "abierta")
    .eq("activo", true)
    .order("fecha_apertura", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Agregar campos de usuario
  if (data) {
    return {
      ...data,
      usuario_nombre: data.usuario?.nombre || 'Usuario Desconocido',
      usuario_email: data.usuario?.email || null
    };
  }

  return data;
};

// Crear nueva caja (apertura)
export const createCaja = async (cajaData) => {
  const {
    usuario_id,
    jornada,
    monto_inicial,
    notas_apertura,
  } = cajaData;

  const { data, error } = await supabase
    .from("cajas")
    .insert([{
      usuario_id,
      jornada,
      monto_inicial,
      notas_apertura,
      estado: "abierta",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Cerrar caja (sin usar función RPC)
export const cerrarCaja = async (id_caja, monto_final, notas_cierre) => {
  // 1. Obtener la caja
  const { data: caja, error: cajaError } = await supabase
    .from("cajas")
    .select("*")
    .eq("id_caja", parseInt(id_caja))
    .eq("estado", "abierta")
    .single();

  if (cajaError || !caja) {
    throw new Error("Caja no encontrada o ya está cerrada");
  }

  // 2. Calcular totales de ventas
  const { data: ventas } = await supabase
    .from("ventas")
    .select("valor")
    .eq("caja_id", parseInt(id_caja))
    .eq("activo", true);

  const total_ventas = ventas?.reduce((sum, v) => sum + parseFloat(v.valor), 0) || 0;

  // 3. Calcular totales de gastos
  const { data: gastos } = await supabase
    .from("gastos")
    .select("valor")
    .eq("caja_id", parseInt(id_caja))
    .eq("activo", true);

  const total_gastos = gastos?.reduce((sum, g) => sum + parseFloat(g.valor), 0) || 0;

  // 4. Calcular diferencia
  const monto_esperado = parseFloat(caja.monto_inicial) + total_ventas - total_gastos;
  const diferencia = parseFloat(monto_final) - monto_esperado;

  // 5. Actualizar la caja
  const { data: cajaActualizada, error: updateError } = await supabase
    .from("cajas")
    .update({
      fecha_cierre: new Date().toISOString(),
      monto_final: parseFloat(monto_final),
      total_ventas,
      total_gastos,
      diferencia,
      notas_cierre: notas_cierre || null,
      estado: "cerrada",
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id_caja", parseInt(id_caja))
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return {
    ...cajaActualizada,
    monto_esperado,
    cuadre_perfecto: diferencia === 0,
  };
};

// Actualizar caja
export const updateCaja = async (id, cajaData) => {
  const { data, error } = await supabase
    .from("cajas")
    .update(cajaData)
    .eq("id_caja", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Calcular totales de caja (sin usar función RPC)
export const calcularTotalesCaja = async (id_caja) => {
  // 1. Obtener la caja
  const { data: caja } = await supabase
    .from("cajas")
    .select("monto_inicial")
    .eq("id_caja", parseInt(id_caja))
    .single();

  if (!caja) {
    throw new Error("Caja no encontrada");
  }

  // 2. Calcular totales de ventas
  const { data: ventas } = await supabase
    .from("ventas")
    .select("valor")
    .eq("caja_id", parseInt(id_caja))
    .eq("activo", true);

  const total_ventas = ventas?.reduce((sum, v) => sum + parseFloat(v.valor), 0) || 0;

  // 3. Calcular totales de gastos
  const { data: gastos } = await supabase
    .from("gastos")
    .select("valor")
    .eq("caja_id", parseInt(id_caja))
    .eq("activo", true);

  const total_gastos = gastos?.reduce((sum, g) => sum + parseFloat(g.valor), 0) || 0;

  // 4. Calcular diferencia
  const diferencia = parseFloat(caja.monto_inicial) + total_ventas - total_gastos;

  return {
    total_ventas,
    total_gastos,
    diferencia,
  };
};

// ============================================
// VENTAS
// ============================================

// Obtener todas las ventas
export const getAllVentas = async (filters = {}) => {
  let query = supabase
    .from("ventas")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: false });

  // Aplicar filtros
  if (filters.caja_id) {
    query = query.eq("caja_id", parseInt(filters.caja_id));
  }
  if (filters.metodo_pago) {
    query = query.eq("metodo_pago", filters.metodo_pago);
  }
  if (filters.venta_por) {
    query = query.eq("venta_por", filters.venta_por);
  }
  if (filters.fecha_inicio) {
    query = query.gte("fecha", filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    query = query.lte("fecha", filters.fecha_fin);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Obtener venta por ID
export const getVentaById = async (id) => {
  const { data, error } = await supabase
    .from("ventas")
    .select("*")
    .eq("id_venta", id)
    .single();

  if (error) throw error;
  return data;
};

// Crear nueva venta
export const createVenta = async (ventaData) => {
  const {
    factura_descripcion,
    venta_por,
    valor,
    metodo_pago,
    observaciones,
    usuario_registro,
    caja_id, // Opcional
  } = ventaData;

  const { data, error } = await supabase
    .from("ventas")
    .insert([{
      factura_descripcion,
      venta_por,
      valor,
      metodo_pago,
      observaciones,
      usuario_registro,
      caja_id: caja_id || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar venta
export const updateVenta = async (id, ventaData) => {
  const { data, error } = await supabase
    .from("ventas")
    .update(ventaData)
    .eq("id_venta", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar venta (soft delete)
export const deleteVenta = async (id) => {
  const { data, error } = await supabase
    .from("ventas")
    .update({ activo: false })
    .eq("id_venta", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// GASTOS
// ============================================

// Obtener todos los gastos
export const getAllGastos = async (filters = {}) => {
  let query = supabase
    .from("gastos")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: false });

  // Aplicar filtros
  if (filters.caja_id) {
    query = query.eq("caja_id", parseInt(filters.caja_id));
  }
  if (filters.id_categoria) {
    query = query.eq("id_categoria", filters.id_categoria);
  }
  if (filters.id_subcategoria) {
    query = query.eq("id_subcategoria", filters.id_subcategoria);
  }
  if (filters.metodo_pago) {
    query = query.eq("metodo_pago", filters.metodo_pago);
  }
  if (filters.fecha_inicio) {
    query = query.gte("fecha", filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    query = query.lte("fecha", filters.fecha_fin);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Obtener gasto por ID
export const getGastoById = async (id) => {
  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .eq("id_gasto", id)
    .single();

  if (error) throw error;
  return data;
};

// Crear nuevo gasto
export const createGasto = async (gastoData) => {
  const {
    descripcion,
    id_categoria,
    id_subcategoria,
    metodo_pago,
    valor,
    usuario_registro,
    caja_id, // Opcional
  } = gastoData;

  const { data, error } = await supabase
    .from("gastos")
    .insert([{
      descripcion,
      id_categoria,
      id_subcategoria,
      metodo_pago,
      valor,
      usuario_registro,
      caja_id: caja_id || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar gasto
export const updateGasto = async (id, gastoData) => {
  const { data, error } = await supabase
    .from("gastos")
    .update(gastoData)
    .eq("id_gasto", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar gasto (soft delete)
export const deleteGasto = async (id) => {
  const { data, error } = await supabase
    .from("gastos")
    .update({ activo: false })
    .eq("id_gasto", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// CATEGORÍAS Y SUBCATEGORÍAS
// ============================================

// Obtener todas las categorías
export const getAllCategorias = async () => {
  const { data, error } = await supabase
    .from("categorias_gastos")
    .select(`
      *,
      subcategorias:subcategorias_gastos(*)
    `)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
};

// Obtener subcategorías por categoría
export const getSubcategoriasByCategoria = async (categoria_id) => {
  const { data, error } = await supabase
    .from("subcategorias_gastos")
    .select("*")
    .eq("categoria_id", categoria_id)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
};

// ============================================
// REPORTES
// ============================================

// Reporte diario
export const getReporteDiario = async (fecha_inicio, fecha_fin) => {
  const { data, error } = await supabase.rpc("obtener_reporte_diario", {
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
  });

  if (error) throw error;
  return data;
};

// Reporte mensual
export const getReporteMensual = async (anio, mes) => {
  const { data, error } = await supabase.rpc("obtener_reporte_mensual", {
    p_anio: anio,
    p_mes: mes,
  });

  if (error) throw error;
  return data;
};

// Resumen de ventas por método de pago (por fecha)
export const getVentasPorMetodoPago = async (fecha_inicio, fecha_fin) => {
  let query = supabase
    .from("ventas")
    .select("metodo_pago, valor")
    .eq("activo", true);

  if (fecha_inicio) query = query.gte("fecha", fecha_inicio);
  if (fecha_fin) query = query.lte("fecha", fecha_fin);

  const { data, error } = await query;
  if (error) throw error;

  // Agrupar por método de pago
  const resumen = data.reduce((acc, venta) => {
    if (!acc[venta.metodo_pago]) {
      acc[venta.metodo_pago] = { metodo: venta.metodo_pago, total: 0, cantidad: 0 };
    }
    acc[venta.metodo_pago].total += parseFloat(venta.valor);
    acc[venta.metodo_pago].cantidad += 1;
    return acc;
  }, {});

  return Object.values(resumen);
};

// Resumen de gastos por categoría (por fecha)
export const getGastosPorCategoria = async (fecha_inicio, fecha_fin) => {
  let query = supabase
    .from("gastos")
    .select(`
      valor,
      categoria:categorias_gastos!gastos_id_categoria_fkey(nombre)
    `)
    .eq("activo", true);

  if (fecha_inicio) query = query.gte("fecha", fecha_inicio);
  if (fecha_fin) query = query.lte("fecha", fecha_fin);

  const { data, error } = await query;
  if (error) throw error;

  // Agrupar por categoría
  const resumen = data.reduce((acc, gasto) => {
    const categoria = gasto.categoria.nombre;
    if (!acc[categoria]) {
      acc[categoria] = { categoria, total: 0, cantidad: 0 };
    }
    acc[categoria].total += parseFloat(gasto.valor);
    acc[categoria].cantidad += 1;
    return acc;
  }, {});

  return Object.values(resumen);
};

// ============================================
// CAJA FUERTE
// ============================================

// Obtener saldo actual de caja fuerte
export const getSaldoCajaFuerte = async () => {
  const { data, error } = await supabase.rpc("obtener_saldo_caja_fuerte");
  if (error) throw error;
  return data;
};

// Obtener todos los movimientos de caja fuerte
export const getAllMovimientosCajaFuerte = async (filters = {}) => {
  let query = supabase
    .from("caja_fuerte")
    .select(`
      *,
      usuario:usuarios!caja_fuerte_usuario_registro_fkey(id_usuario, nombre),
      caja:cajas(id_caja, jornada, fecha_apertura)
    `)
    .eq("activo", true)
    .order("fecha", { ascending: false });

  // Aplicar filtros
  if (filters.tipo_movimiento) {
    query = query.eq("tipo_movimiento", filters.tipo_movimiento);
  }
  if (filters.fecha_inicio) {
    query = query.gte("fecha", filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    query = query.lte("fecha", filters.fecha_fin);
  }
  if (filters.usuario_registro) {
    query = query.eq("usuario_registro", filters.usuario_registro);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Obtener movimiento por ID
export const getMovimientoCajaFuerteById = async (id) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .select(`
      *,
      usuario:usuarios!caja_fuerte_usuario_registro_fkey(id_usuario, nombre),
      caja:cajas(id_caja, jornada, fecha_apertura)
    `)
    .eq("id_movimiento", id)
    .single();

  if (error) throw error;
  return data;
};

// Registrar movimiento en caja fuerte
export const registrarMovimientoCajaFuerte = async (movimientoData) => {
  const {
    tipo_movimiento,
    monto,
    descripcion,
    usuario_registro,
    caja_id,
    observaciones,
  } = movimientoData;

  const { data, error } = await supabase.rpc("registrar_movimiento_caja_fuerte", {
    p_tipo_movimiento: tipo_movimiento,
    p_monto: monto,
    p_descripcion: descripcion,
    p_usuario_registro: usuario_registro,
    p_caja_id: caja_id,
    p_observaciones: observaciones,
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Actualizar movimiento de caja fuerte
export const updateMovimientoCajaFuerte = async (id, movimientoData) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .update(movimientoData)
    .eq("id_movimiento", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar movimiento (soft delete)
export const deleteMovimientoCajaFuerte = async (id) => {
  const { data, error } = await supabase
    .from("caja_fuerte")
    .update({ activo: false })
    .eq("id_movimiento", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Obtener historial de saldos
export const getHistorialSaldos = async (fecha_inicio, fecha_fin) => {
  let query = supabase
    .from("caja_fuerte")
    .select("fecha, tipo_movimiento, monto, saldo_anterior, saldo_nuevo, descripcion")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  if (fecha_inicio) {
    query = query.gte("fecha", fecha_inicio);
  }
  if (fecha_fin) {
    query = query.lte("fecha", fecha_fin);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
