# 📋 Configuración del Nodo HTTP Request en n8n para Crear Pedidos

## Problema Común
El error **"Bad request - please check your parameters"** y **"Faltan campos requeridos"** ocurre cuando el body del HTTP Request está vacío o no está correctamente mapeado.

---

## ✅ Solución Paso a Paso

### 1. Configuración Básica del Nodo HTTP Request

**En el nodo HTTP Request, configura:**

| Campo | Valor |
|-------|-------|
| **Method** | `POST` |
| **URL** | `https://botiva.onrender.com/api/orders` |
| **Authentication** | `None` |
| **Send Headers** | `ON` ✓ |
| **Send Body** | `ON` ✓ |

---

### 2. Configurar Headers

**En "Send Headers":**
- Click en **"Add Header"**
- **Name:** `Content-Type`
- **Value:** `application/json`

---

### 3. Configurar Body (⚠️ AQUÍ ESTÁ LA CLAVE)

**En "Send Body":**
- **Body Content Type:** Selecciona `JSON`

**En el campo "Body" (JSON):** Usa esta estructura:

```json
{
  "external_id": "{{ $json['# chat_id'] }}_{{ $json['# timestamp'] }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": [
    {
      "product_id": null,
      "name": "{{ $json['T pedido'] }}",
      "quantity": 1,
      "unit_price": {{ $json['# monto'] }}
    }
  ],
  "total_amount": {{ $json['# monto'] }},
  "payment_method": "{{ $json['T pago'] }}",
  "payment_status": "pendiente"
}
```

---

### 4. Mapear Campos Correctamente

**Según tu imagen, tus campos en n8n son:**
- `# chat_id` → Usar para `customer_phone` y `external_id`
- `T nombre` → Usar para `customer_name`
- `T direccion` → Usar para `customer_address`
- `T pedido` → Usar para `name` en items (descripción del pedido)
- `# monto` → Usar para `total_amount` y `unit_price`
- `T pago` → Usar para `payment_method`
- `T envio_retiro` → Información adicional (puedes ignorarlo o agregarlo como nota)

**⚠️ IMPORTANTE:**
- Los campos numéricos (`# monto`) NO deben ir entre comillas en el JSON
- Los campos de texto (`T nombre`) SÍ deben ir entre comillas
- Asegúrate de usar los nombres EXACTOS de tus columnas en n8n

---

### 5. Ejemplo Completo con Valores Reales

Si tus datos son:
- `# chat_id`: `7349954248`
- `T nombre`: `Juan Perez`
- `T direccion`: `belgrano 1405`
- `T pedido`: `2 melt`
- `# monto`: `18600`
- `T pago`: `efectivo`
- `# timestamp`: `1760591238`

**El Body debería ser:**

```json
{
  "external_id": "7349954248_1760591238",
  "customer_name": "Juan Perez",
  "customer_phone": "7349954248",
  "customer_address": "belgrano 1405",
  "items": [
    {
      "product_id": null,
      "name": "2 melt",
      "quantity": 1,
      "unit_price": 18600
    }
  ],
  "total_amount": 18600,
  "payment_method": "efectivo",
  "payment_status": "pendiente"
}
```

---

### 6. Si Tienes Múltiples Productos

Si `T pedido` contiene múltiples productos (ej: "2 melt, 1 hamburguesa"), necesitas parsear el string:

**Opción A: Usar un nodo "Code" o "Function" antes del HTTP Request para parsear:**
```javascript
// En un nodo Code/Function
const pedidoStr = $input.item.json['T pedido'];
const items = pedidoStr.split(',').map(item => ({
  product_id: null,
  name: item.trim(),
  quantity: 1,
  unit_price: 0 // Necesitarás calcular esto
}));

return { items };
```

**Opción B: Crear un item por cada producto detectado:**
```json
{
  "items": [
    {
      "product_id": null,
      "name": "2 melt",
      "quantity": 2,
      "unit_price": 9300
    },
    {
      "product_id": null,
      "name": "1 hamburguesa",
      "quantity": 1,
      "unit_price": 10000
    }
  ]
}
```

---

### 7. Verificar que Funciona

**Después de configurar:**
1. Click en **"Execute Node"** en el nodo HTTP Request
2. Deberías ver en el OUTPUT:
   - **Status:** `201 Created` o `200 OK`
   - **Data:** Un objeto JSON con el pedido creado (incluye `id`, `external_id`, etc.)

**Si hay error:**
- Revisa que todos los campos requeridos estén presentes
- Verifica que los nombres de campos coincidan exactamente
- Asegúrate de que los valores numéricos no tengan comillas

---

### 8. Campos Requeridos por el API

El endpoint `/api/orders` requiere estos campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `external_id` | string | ✅ Sí | ID único del pedido (puede ser `chat_id_timestamp`) |
| `customer_name` | string | ✅ Sí | Nombre del cliente |
| `customer_phone` | string | ✅ Sí | Teléfono del cliente |
| `customer_address` | string | ✅ Sí | Dirección de entrega |
| `items` | array | ✅ Sí | Array de objetos con `product_id`, `name`, `quantity`, `unit_price` |
| `total_amount` | number | ✅ Sí | Total del pedido |
| `payment_method` | string | ✅ Sí | Método de pago (`efectivo`, `tarjeta`, etc.) |
| `payment_status` | string | ❌ No | Estado de pago (default: `pendiente`) |

---

## 🔍 Debugging

### Ver qué está enviando n8n:
1. En el nodo HTTP Request, click en **"Execute Node"**
2. Ve a la pestaña **"Request"** para ver el JSON que se está enviando
3. Compara con el ejemplo de arriba

### Ver la respuesta del servidor:
1. En el nodo HTTP Request, después de ejecutar, ve a **"OUTPUT"**
2. Si hay error, verás el mensaje del servidor
3. Si es exitoso, verás el objeto del pedido creado

---

## 📝 Notas Finales

- **`product_id`** puede ser `null` si no tienes los UUIDs de productos en tu base de datos
- **`external_id`** debe ser único - usa una combinación de `chat_id` y `timestamp`
- El **`# monto`** debe ser un número, no un string
- Si el pedido tiene múltiples items, calcula el `unit_price` dividiendo el total entre la cantidad

---

**Última actualización:** Noviembre 2025
