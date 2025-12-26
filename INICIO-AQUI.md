# 🚨 INICIO AQUÍ - Error 500 Caja Fuerte

## ❌ Error Actual
```
Error 500: Could not find the function public.registrar_movimiento_caja_fuerte
```

---

## ✅ SOLUCIÓN EN 3 PASOS

### 1️⃣ Abrir Supabase
```
🌐 https://supabase.com/dashboard
```
- Selecciona tu proyecto
- Click en **SQL Editor** (menú izquierdo)
- Click en **+ New Query**

---

### 2️⃣ Ejecutar Script
- Abre el archivo: **`FIX-COMPLETO-CAJA-FUERTE.sql`**
- Copia TODO el contenido (Ctrl+A, Ctrl+C)
- Pega en Supabase SQL Editor (Ctrl+V)
- Click en **RUN** (o Ctrl+Enter)

---

### 3️⃣ Verificar
Deberías ver:
```
✅ PASO 1: Funciones antiguas eliminadas
✅ PASO 2: Función obtener_saldo_caja_fuerte creada
✅ PASO 3: Función registrar_movimiento_caja_fuerte creada
✅ PASO 4: Permisos otorgados
✅ PASO 5: Políticas antiguas eliminadas
✅ PASO 6: Políticas RLS permisivas creadas

🧪 PRUEBA 1: Obtener saldo actual
🧪 PRUEBA 2: Registrar depósito de prueba
🧪 PRUEBA 3: Verificar movimiento creado
🧪 PRUEBA 4: Verificar nuevo saldo

✅ FIX COMPLETO EJECUTADO CORRECTAMENTE
```

---

## 🎯 Probar desde Frontend

Ahora intenta registrar un movimiento desde tu aplicación.
El error 500 debería desaparecer.

---

## 📚 Más Ayuda

Si necesitas más detalles:

- **`COMO-EJECUTAR-FIX.md`** - Guía visual completa
- **`PASOS-RAPIDOS-FIX.md`** - Solución rápida
- **`SOLUCION-ERROR-500.md`** - Troubleshooting
- **`RESUMEN-CAJA-FUERTE.md`** - Documentación completa

---

## ⚠️ Si Aún Falla

1. Verifica que las funciones existen:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public' AND routine_name LIKE '%caja_fuerte%';
   ```
   Deberías ver 2 funciones.

2. Reinicia el servidor backend:
   ```bash
   # Detener con Ctrl+C
   pnpm start
   ```

3. Verifica la conexión en `.env`:
   ```
   SUPABASE_URL=tu_url
   SUPABASE_KEY=tu_key
   ```

---

## ✅ Checklist

- [ ] Abrí Supabase SQL Editor
- [ ] Copié el script completo
- [ ] Ejecuté con RUN
- [ ] Vi los mensajes de éxito
- [ ] Probé desde el frontend
- [ ] Ya no hay error 500

---

**¡Listo!** Ejecuta el script y tu caja fuerte funcionará. 🚀
