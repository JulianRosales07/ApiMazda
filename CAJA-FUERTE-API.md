# 🔐 API Caja Fuerte - Documentación

## 📋 Descripción

La **Caja Fuerte** es un sistema para registrar y controlar el dinero que se guarda de forma segura. Funciona como un registro acumulativo donde se pueden hacer depósitos y retiros, manteniendo un historial completo de movimientos y saldos.

**Base URL:** `https://apimazda.onrender.com/api/caja/caja-fuerte`

---

## 🎯 Características

- ✅ Registro de depósitos y retiros
- ✅ Cálculo automático de saldos
- ✅ Historial completo de movimientos
- ✅ Validación de saldo antes de retiros
- ✅ Vinculación con cajas diarias (opcional)
- ✅ Control de acceso (solo administradores)

---

## 📊 Endpoints

### 1. Obtener Saldo Actual

```http
GET /api/caja/caja-fuerte/saldo
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "saldo": 1500000
  }
}
```

**Ejemplo JavaScript:**
```javascript
const BASE_URL = 'https://apimazda.onrender.com';
const response = await fetch(`${BASE_URL}/api/caja/caja-fuerte/saldo`);
const data = await response.json();
console.log('Saldo actual:', data.data.saldo);
```

---

### 2. Obtener Todos los Movimientos

```http
GET /api/caja/caja-fuerte/movimientos
```

**Query Parameters (opcionales):**
- `tipo_movimiento` - `DEPOSITO` | `RETIRO`
- `fecha_inicio` - YYYY-MM-DD
- `fecha_fin` - YYYY-MM-DD
- `usuario_registro` - ID del usuario

**Ejemplo:**
```javascript
const response = await fetch(
  `${BASE_URL}/api/caja/caja-fuerte/movimientos?tipo_movimiento=DEPOSITO`
);
const data = await response.json();
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_movimiento": 1,
      "tipo_movimiento": "DEPOSITO",
      "monto": 500000,
      "saldo_anterior": 1000000,
      "saldo_nuevo": 1500000,
      "fecha": "2024-12-24T18:00:00Z",
      "descripcion": "Depósito de cierre de caja",
      "caja_id": 1,
      "observaciones": "Cierre jornada mañana",
      "usuario": {
        "id_usuario": 1,
        "nombre": "Julian Rosales"
      },
      "caja": {
        "id_caja": 1,
        "jornada": "mañana",
        "fecha_apertura": "2024-12-24T08:00:00Z"
      }
    }
  ]
}
```

---

### 3. Registrar Depósito

```http
POST /api/caja/caja-fuerte/movimientos
```

**Body:**
```json
{
  "tipo_movimiento": "DEPOSITO",
  "monto": 500000,
  "descripcion": "Depósito de cierre de caja",
  "usuario_registro": 1,
  "caja_id": 1,
  "observaciones": "Cierre jornada mañana"
}
```

**Ejemplo:**
```javascript
const response = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo_movimiento: 'DEPOSITO',
    monto: 500000,
    descripcion: 'Depósito de cierre de caja',
    usuario_registro: 1,
    caja_id: 1
  })
});
const data = await response.json();
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id_movimiento": 1,
    "saldo_anterior": 1000000,
    "saldo_nuevo": 1500000
  },
  "message": "Movimiento registrado correctamente"
}
```

---

### 4. Registrar Retiro

```http
POST /api/caja/caja-fuerte/movimientos
```

**Body:**
```json
{
  "tipo_movimiento": "RETIRO",
  "monto": 200000,
  "descripcion": "Retiro para gastos operativos",
  "usuario_registro": 1,
  "observaciones": "Pago de proveedores"
}
```

**Validación:**
- ⚠️ El sistema valida que haya saldo suficiente antes de permitir el retiro
- Si el saldo es insuficiente, retorna error 400

**Ejemplo:**
```javascript
const response = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo_movimiento: 'RETIRO',
    monto: 200000,
    descripcion: 'Retiro para gastos',
    usuario_registro: 1
  })
});
const data = await response.json();

if (!data.success) {
  console.error('Error:', data.message);
  // Ejemplo: "Saldo insuficiente en caja fuerte"
}
```

---

### 5. Obtener Historial de Saldos

```http
GET /api/caja/caja-fuerte/historial
```

**Query Parameters (opcionales):**
- `fecha_inicio` - YYYY-MM-DD
- `fecha_fin` - YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2024-12-24T08:00:00Z",
      "tipo_movimiento": "DEPOSITO",
      "monto": 500000,
      "saldo_anterior": 1000000,
      "saldo_nuevo": 1500000,
      "descripcion": "Depósito inicial"
    },
    {
      "fecha": "2024-12-24T12:00:00Z",
      "tipo_movimiento": "RETIRO",
      "monto": 200000,
      "saldo_anterior": 1500000,
      "saldo_nuevo": 1300000,
      "descripcion": "Retiro para gastos"
    }
  ]
}
```

---

## 🔄 Flujo de Trabajo Típico

### Escenario 1: Depósito al Cerrar Caja

```javascript
// 1. Cerrar caja diaria
const cierreResponse = await fetch(`${BASE_URL}/api/caja/cajas/1/cerrar`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    monto_final: 250000,
    notas_cierre: 'Cierre normal'
  })
});

// 2. Depositar excedente en caja fuerte
const depositoResponse = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo_movimiento: 'DEPOSITO',
    monto: 150000, // Dejar 100k en caja, depositar 150k
    descripcion: 'Depósito de cierre de caja',
    usuario_registro: 1,
    caja_id: 1
  })
});

// 3. Verificar nuevo saldo
const saldoResponse = await fetch(`${BASE_URL}/api/caja/caja-fuerte/saldo`);
const saldo = await saldoResponse.json();
console.log('Nuevo saldo en caja fuerte:', saldo.data.saldo);
```

### Escenario 2: Retiro para Gastos

```javascript
// 1. Verificar saldo disponible
const saldoResponse = await fetch(`${BASE_URL}/api/caja/caja-fuerte/saldo`);
const { saldo } = await saldoResponse.json().data;

// 2. Validar que hay suficiente dinero
const montoRetiro = 300000;
if (saldo >= montoRetiro) {
  // 3. Realizar retiro
  const retiroResponse = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo_movimiento: 'RETIRO',
      monto: montoRetiro,
      descripcion: 'Retiro para pago de proveedores',
      usuario_registro: 1,
      observaciones: 'Pago mensual'
    })
  });
  
  const resultado = await retiroResponse.json();
  if (resultado.success) {
    console.log('Retiro exitoso');
    console.log('Saldo anterior:', resultado.data.saldo_anterior);
    console.log('Saldo nuevo:', resultado.data.saldo_nuevo);
  }
} else {
  console.error('Saldo insuficiente');
}
```

---

## 📝 Tipos de Datos

### Movimiento Caja Fuerte

```typescript
interface MovimientoCajaFuerte {
  id_movimiento: number;
  tipo_movimiento: 'DEPOSITO' | 'RETIRO';
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  fecha: string;
  descripcion: string;
  caja_id: number | null;
  usuario_registro: number;
  observaciones: string | null;
  activo: boolean;
}
```

### Request Body para Crear Movimiento

```typescript
interface CrearMovimientoRequest {
  tipo_movimiento: 'DEPOSITO' | 'RETIRO';
  monto: number;
  descripcion: string;
  usuario_registro: number;
  caja_id?: number;
  observaciones?: string;
}
```

---

## ⚠️ Validaciones y Reglas

1. **Monto positivo**: El monto siempre debe ser mayor a 0
2. **Saldo suficiente**: No se puede retirar más dinero del disponible
3. **Tipo de movimiento**: Solo `DEPOSITO` o `RETIRO`
4. **Descripción obligatoria**: Siempre debe incluir una descripción
5. **Usuario obligatorio**: Debe especificar quién registra el movimiento
6. **Caja opcional**: Se puede vincular con una caja diaria o no

---

## 🔐 Seguridad

- ✅ Solo usuarios con rol `administrador` pueden acceder a caja fuerte
- ✅ Todos los movimientos quedan registrados con usuario y fecha
- ✅ No se pueden eliminar movimientos físicamente (soft delete)
- ✅ El saldo se calcula automáticamente

---

## 📊 Ejemplo Completo React

```jsx
import { useState, useEffect } from 'react';

const BASE_URL = 'https://apimazda.onrender.com';

function CajaFuerteComponent() {
  const [saldo, setSaldo] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      // Cargar saldo
      const saldoRes = await fetch(`${BASE_URL}/api/caja/caja-fuerte/saldo`);
      const saldoData = await saldoRes.json();
      setSaldo(saldoData.data.saldo);

      // Cargar movimientos
      const movRes = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`);
      const movData = await movRes.json();
      setMovimientos(movData.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function registrarDeposito(monto, descripcion) {
    try {
      const response = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_movimiento: 'DEPOSITO',
          monto,
          descripcion,
          usuario_registro: 1
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Depósito registrado correctamente');
        cargarDatos(); // Recargar datos
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function registrarRetiro(monto, descripcion) {
    if (monto > saldo) {
      alert('Saldo insuficiente');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/caja/caja-fuerte/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_movimiento: 'RETIRO',
          monto,
          descripcion,
          usuario_registro: 1
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Retiro registrado correctamente');
        cargarDatos();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Caja Fuerte</h2>
      <div>
        <h3>Saldo Actual: ${saldo.toLocaleString()}</h3>
      </div>

      <div>
        <h4>Últimos Movimientos</h4>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Saldo</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(mov => (
              <tr key={mov.id_movimiento}>
                <td>{new Date(mov.fecha).toLocaleString()}</td>
                <td>{mov.tipo_movimiento}</td>
                <td>${mov.monto.toLocaleString()}</td>
                <td>${mov.saldo_nuevo.toLocaleString()}</td>
                <td>{mov.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CajaFuerteComponent;
```

---

## 🎯 Casos de Uso

### 1. Depósito Diario
Al cerrar la caja diaria, depositar el excedente en caja fuerte

### 2. Retiro para Gastos
Retirar dinero para pagar proveedores o gastos grandes

### 3. Auditoría
Revisar historial completo de movimientos y saldos

### 4. Control de Efectivo
Mantener registro de todo el dinero guardado de forma segura

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Desarrollador:** Julian Rosales
