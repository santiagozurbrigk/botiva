# 🔧 Solución: Error 400 "Faltan campos requeridos"

## Problema Detectado

El request muestra:
- ❌ `items`: `"melt"` (STRING) → debería ser ARRAY
- ❌ `customer_name`: `""` (vacío)
- ❌ `customer_phone`: `""` (vacío)
- ✅ `customer_address`: `"belgrano 1405"` (OK)

El backend requiere:
- `external_id` ✅
- `customer_name` ❌ (vacío)
- `customer_phone` ❌ (vacío)
- `items` (array) ❌ (es string)
- `total_amount` ✅

---

## ✅ Solución Completa

### 1. Nodo Code - Código Completo y Corregido

**Reemplaza TODO el código del nodo Code con esto:**

```javascript
// Obtener TODOS los datos del nodo anterior
const inputData = $input.item.json;

// DEBUG: Ver qué datos tenemos (opcional, puedes eliminarlo después)
console.log('Input data:', JSON.stringify(inputData, null, 2));

// Obtener el array de pedido (puede venir como 'pedido' o 'T pedido')
let pedidoArray = inputData.pedido || inputData['T pedido'] || [];

// Si pedido es un string, convertirlo a array
if (typeof pedidoArray === 'string') {
  // Si es "2 melt", parsearlo
  const match = pedidoArray.match(/^(\d+)\s+(.+)$/);
  if (match) {
    pedidoArray = [{
      '# cantidad': parseInt(match[1]),
      'T nombre': match[2].trim()
    }];
  } else {
    // Si es solo "melt", crear un item con cantidad 1
    pedidoArray = [{
      '# cantidad': 1,
      'T nombre': pedidoArray.trim()
    }];
  }
}

// Obtener datos del cliente (buscar en múltiples ubicaciones)
let customerName = inputData['T nombre'] 
  || inputData['T name'] 
  || inputData.customer_name 
  || inputData.nombre 
  || inputData.name
  || '';

// Si está vacío, buscar en el nodo anterior
if (!customerName) {
  try {
    // Intentar obtener del nodo anterior (ajusta el nombre según tu workflow)
    const prevNodes = $input.all();
    for (const prevItem of prevNodes) {
      const data = prevItem.json;
      customerName = data['T nombre'] || data.customer_name || data.nombre || data.name || '';
      if (customerName) break;
    }
  } catch(e) {
    console.log('No se pudo acceder a nodos anteriores:', e.message);
  }
}

let customerPhone = inputData['# chat_id'] 
  || inputData.chat_id
  || inputData.phone 
  || inputData.telefono 
  || inputData.customer_phone
  || '';

// Si está vacío, buscar en el nodo anterior
if (!customerPhone) {
  try {
    const prevNodes = $input.all();
    for (const prevItem of prevNodes) {
      const data = prevItem.json;
      customerPhone = data['# chat_id'] || data.chat_id || data.phone || data.telefono || data.customer_phone || '';
      if (customerPhone) break;
    }
  } catch(e) {
    console.log('No se pudo acceder a nodos anteriores:', e.message);
  }
}

const customerAddress = inputData['T direccion'] 
  || inputData.direccion 
  || inputData.address 
  || inputData.customer_address
  || '';

const montoTotal = inputData['# monto'] 
  || inputData.monto 
  || inputData.total_amount 
  || 0;

const paymentMethod = inputData['T pago'] 
  || inputData.payment_method 
  || inputData.pago 
  || 'efectivo';

const externalId = inputData['# chat_id'] || inputData.chat_id || inputData.external_id || '';
const timestamp = inputData['# timestamp'] || inputData.timestamp || Date.now();

// Convertir array de pedido a items del API
const items = [];

if (Array.isArray(pedidoArray) && pedidoArray.length > 0) {
  pedidoArray.forEach((item, index) => {
    const cantidad = item['# cantidad'] || item.cantidad || item.quantity || 1;
    const nombre = item['T nombre'] || item.nombre || item.name || item['T name'] || `Producto ${index + 1}`;
    
    // Crear objeto item - OMITIR product_id si es null
    const itemObj = {
      name: nombre,
      quantity: cantidad,
      unit_price: 0
    };
    
    // Solo agregar product_id si tiene un valor válido
    const productId = item.product_id || item['product_id'];
    if (productId && productId !== null && productId !== 'null' && productId !== '') {
      itemObj.product_id = productId;
    }
    
    items.push(itemObj);
  });
}

// Si aún no hay items, intentar parsear como string
if (items.length === 0) {
  const pedidoStr = inputData['T pedido'] || inputData.pedido || '';
  if (typeof pedidoStr === 'string' && pedidoStr.trim()) {
    // Parsear "2 melt" o "melt"
    const match = pedidoStr.match(/^(\d+)\s+(.+)$/);
    if (match) {
      items.push({
        name: match[2].trim(),
        quantity: parseInt(match[1]),
        unit_price: 0
      });
    } else {
      items.push({
        name: pedidoStr.trim(),
        quantity: 1,
        unit_price: 0
      });
    }
  }
}

// VALIDACIÓN: Si no hay items, crear uno por defecto
if (items.length === 0) {
  items.push({
    name: 'Producto desconocido',
    quantity: 1,
    unit_price: 0
  });
}

// Calcular precio unitario
const cantidadTotal = items.reduce((sum, item) => sum + item.quantity, 0);
const precioPorUnidad = cantidadTotal > 0 && montoTotal > 0 ? montoTotal / cantidadTotal : 0;

items.forEach(item => {
  item.unit_price = Math.round(precioPorUnidad);
});

const totalCalculado = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
const finalExternalId = externalId ? `${externalId}_${timestamp}` : `order_${timestamp}`;

// VALIDACIÓN: Si customer_name o customer_phone están vacíos, usar valores por defecto
if (!customerName) {
  customerName = 'Cliente sin nombre';
  console.warn('⚠️ customer_name está vacío, usando valor por defecto');
}

if (!customerPhone) {
  customerPhone = `sin_telefono_${timestamp}`;
  console.warn('⚠️ customer_phone está vacío, usando valor por defecto');
}

// Retornar resultado
return {
  json: {
    // Datos del cliente (con múltiples nombres para compatibilidad)
    'T nombre': customerName,
    customer_name: customerName,
    '# chat_id': customerPhone,
    chat_id: customerPhone,
    customer_phone: customerPhone,
    'T direccion': customerAddress,
    customer_address: customerAddress,
    direccion: customerAddress,
    '# monto': montoTotal,
    'T pago': paymentMethod,
    payment_method: paymentMethod,
    '# timestamp': timestamp,
    
    // Items parseados (DEBE ser un array)
    items: items,
    total_amount: totalCalculado || montoTotal,
    external_id: finalExternalId,
    
    // Mantener todos los campos originales
    ...inputData,
    
    items_parsed: true
  }
};
```

### 2. HTTP Request - Configuración Correcta

**Configuración del nodo:**
1. **Method:** `POST`
2. **URL:** `https://botiva.onrender.com/api/orders`
3. **Send Body:** ✅ Activado
4. **Body Content Type:** `JSON`
5. **Specify Body:** `Using JSON`

**JSON Body (IMPORTANTE: items debe ser array, no string):**

```json
{
  "external_id": "{{ $json.external_id }}",
  "customer_name": "{{ $json.customer_name || $json['T nombre'] || 'Cliente sin nombre' }}",
  "customer_phone": "{{ $json.customer_phone || $json.chat_id || $json['# chat_id'] || 'sin_telefono' }}",
  "customer_address": "{{ $json.customer_address || $json['T direccion'] || $json.direccion || '' }}",
  "items": {{ JSON.stringify($json.items) }},
  "total_amount": {{ $json.total_amount || $json['# monto'] || 0 }},
  "payment_method": "{{ $json.payment_method || $json['T pago'] || 'efectivo' }}",
  "payment_status": "pendiente"
}
```

**⚠️ Si `JSON.stringify()` no funciona, usa "Using Fields Below":**

1. Cambia **"Specify Body"** a **"Using Fields Below"**
2. Agrega campos manualmente:

| Name | Value |
|------|-------|
| `external_id` | `{{ $json.external_id }}` |
| `customer_name` | `{{ $json.customer_name || $json['T nombre'] || 'Cliente sin nombre' }}` |
| `customer_phone` | `{{ $json.customer_phone || $json.chat_id || $json['# chat_id'] || 'sin_telefono' }}` |
| `customer_address` | `{{ $json.customer_address || $json['T direccion'] || '' }}` |
| `items` | `{{ $json.items }}` ⚠️ **DEBE ser array** |
| `total_amount` | `{{ $json.total_amount || $json['# monto'] || 0 }}` |
| `payment_method` | `{{ $json.payment_method || $json['T pago'] || 'efectivo' }}` |
| `payment_status` | `pendiente` |

### 3. Verificar OUTPUT del Code

**Antes del HTTP Request, ejecuta el Code y verifica:**

1. El OUTPUT debe mostrar:
   - `items`: debe ser un **array** como `[{name: "melt", quantity: 2, unit_price: 9300}]`
   - `customer_name`: debe tener un valor (no vacío)
   - `customer_phone`: debe tener un valor (no vacío)

2. Si `items` es un string, el problema está en el Code
3. Si `customer_name` está vacío, los datos no están llegando al Code

---

## 🔍 Debugging

### Si items sigue siendo string:

1. Verifica que el Code esté retornando `items` como array
2. En el HTTP Request, verifica que uses `{{ $json.items }}` (no `{{ $json['items'] }}` o `{{ $json.items.toString() }}`)
3. Si usas "Using Fields Below", asegúrate de que el tipo del campo `items` sea "Array" o "Auto"

### Si customer_name y customer_phone están vacíos:

1. Agrega un nodo "Set" ANTES del Code para ver qué datos tienes
2. Verifica qué campos tienen los datos del cliente
3. Ajusta el código del Code para buscar en los campos correctos

---

## 📋 Checklist

- [ ] Nodo Code tiene el código completo de arriba
- [ ] HTTP Request usa `{{ JSON.stringify($json.items) }}` o "Using Fields Below"
- [ ] OUTPUT del Code muestra `items` como array
- [ ] OUTPUT del Code muestra `customer_name` y `customer_phone` con valores
- [ ] Si faltan datos, el código usa valores por defecto

---

**Última actualización:** Noviembre 2025
