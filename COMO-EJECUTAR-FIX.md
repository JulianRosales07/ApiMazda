# 🔧 Cómo Ejecutar el Fix - Guía Visual

## 🎯 Objetivo
Solucionar el error 500: "Could not find the function public.registrar_movimiento_caja_fuerte"

---

## 📋 Pasos a Seguir

### 1️⃣ Abrir Supabase Dashboard

```
🌐 https://supabase.com/dashboard
```

1. Inicia sesión en Supabase
2. Selecciona tu proyecto (el que usas para Mazda)
3. En el menú lateral izquierdo, busca **SQL Editor**
4. Click en **SQL Editor**

---

### 2️⃣ Crear Nueva Query

1. Click en el botón **"+ New Query"** (arriba a la izquierda)
2. Se abrirá un editor SQL vacío

---

### 3️⃣ Copiar el Script

Tienes 2 opciones:

**OPCIÓN A (Recomendada):** Usar el script completo
- Abre el archivo: `FIX-COMPLETO-CAJA-FUERTE.sql`
- Selecciona TODO el contenido (Ctrl+A)
- Copia (Ctrl+C)

**OPCIÓN B:** Usar el script de recreación
- Abre el archivo: `recrear-funcion-caja-fuerte.sql`
- Selecciona TODO el contenido (Ctrl+A)
- Copia (Ctrl+C)

---

### 4️⃣ Pegar y Ejecutar

1. Pega el script en el editor SQL de Supabase (Ctrl+V)
2. Click en el botón **"RUN"** (o presiona Ctrl+Enter)
3. Espera a que termine de ejecutar (verás mensajes de progreso)

---

### 5️⃣ Verificar Resultados

Deberías ver en la consola de resultados:

```
✅ PASO 1: Funciones antiguas eliminadas
✅ PASO 2: Función obtener_saldo_caja_fuerte creada
✅ PASO 3: Función registrar_movimiento_caja_fuerte creada
✅ PASO 4: Permisos otorgados
✅ PASO 5: Políticas antiguas eliminadas
✅ PASO 6: Políticas RLS permisivas creadas

📋 FUNCIONES CREADAS:
- obtener_saldo_caja_fuerte
- registrar_movimiento_caja_fuerte

🧪 PRUEBA 1: Obtener saldo actual
saldo_actual: 0

🧪 PRUEBA 2: Registrar depósito de prueba
id_movimiento: 1
saldo_anterior: 0
saldo_nuevo: 50000

✅ FIX COMPLETO EJECUTADO CORRECTAMENTE
```

Si ves esto, **¡funcionó!** ✅

---

### 6️⃣ Probar desde Frontend

1. Ve a tu aplicación frontend
2. Intenta registrar un movimiento en caja fuerte
3. El error 500 debería desaparecer
4. Deberías ver el movimiento registrado correctamente

---

## ⚠️ Solución de Problemas

### Problema: "relation caja_fuerte does not exist"

**Solución:** Primero debes crear la tabla. Ejecuta:
```sql
-- Ejecutar primero: schema-caja.sql
-- Luego ejecutar: FIX-COMPLETO-CAJA-FUERTE.sql
```

### Problema: "permission denied for function"

**Solución:** Verifica que ejecutaste la parte de permisos:
```sql
GRANT EXECUTE ON FUNCTION obtener_saldo_caja_fuerte() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION registrar_movimiento_caja_fuerte(VARCHAR, DECIMAL, TEXT, INTEGER, INTEGER, TEXT) TO anon, authenticated;
```

### Problema: Aún sale error 500

**Solución:**
1. Reinicia el servidor backend:
   ```bash
   # Detener con Ctrl+C
   pnpm start
   ```
2. Verifica que las funciones existen:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema = 'public' AND routine_name LIKE '%caja_fuerte%';
   ```
3. Verifica la conexión a Supabase en `.env`:
   ```
   SUPABASE_URL=tu_url
   SUPABASE_KEY=tu_key
   ```

---

## 📊 Checklist de Verificación

Marca cada paso cuando lo completes:

- [ ] Abrí Supabase Dashboard
- [ ] Entré a SQL Editor
- [ ] Copié el script completo
- [ ] Pegué en el editor
- [ ] Ejecuté con RUN
- [ ] Vi los mensajes de éxito
- [ ] Las pruebas funcionaron
- [ ] Probé desde el frontend
- [ ] Ya no hay error 500
- [ ] Puedo registrar movimientos

---

## 🎉 ¡Listo!

Si completaste todos los pasos y el checklist, tu sistema de caja fuerte debería estar funcionando correctamente.

**Próximos pasos:**
1. Registra un depósito real
2. Consulta el saldo
3. Registra un retiro
4. Verifica el historial

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir todos los pasos aún tienes problemas:

1. Verifica los logs del servidor backend
2. Revisa la consola del navegador (F12)
3. Ejecuta las queries de verificación en Supabase
4. Comparte el error específico que ves

---

**Archivo creado:** `COMO-EJECUTAR-FIX.md`
**Script principal:** `FIX-COMPLETO-CAJA-FUERTE.sql`
**Script alternativo:** `recrear-funcion-caja-fuerte.sql`
