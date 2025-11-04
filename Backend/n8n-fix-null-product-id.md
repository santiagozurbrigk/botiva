# 🔧 Solución: product_id null y campos vacíos en n8n

## Problema

1. `product_id` aparece como `null` en el resultado
2. `customer_name` y `customer_phone` están vacíos aunque existen en el input
3. n8n puede tener problemas serializando `null` en JSON

---

## ✅ Solución Completa

### 1. Actualizar Nodo Code - Omitir product_id si es null

```javascript
// Obtener TODOS los datos del nodo anterior
const inputData = $input.item.json;

// Obtener el array de pedido
const pedidoArray = inputData.pedido || inputData['T pedido'] || [];

// Obtener datos del cliente (con múltiples intentos)
let customerName = inputData['T nombre'] 
  || inputData['T name'] 
  || inputData.customer_name 
  || inputData.nombre 
  || '';

let customerPhone = inputData['# chat_id'] 
  || inputData.chat_id
  || inputData.phone 
  || '';

const customerAddress = inputData['T direccion'] 
  || inputData.direccion 
  || inputData.address 
  || '';

const montoTotal = inputData['# monto'] 
  || inputData.monto 
  || inputData.total_amount 
  || 0;

const paymentMethod = inputData['T pago'] 
  || inputData.payment_method 
  || 'efectivo';

const externalId = inputData['# chat_id'] || inputData.chat_id || '';
const timestamp = inputData['# timestamp'] || Date.now();

// Convertir array de pedido a items del API
const items = [];

if (Array.isArray(pedidoArray)) {
  pedidoArray.forEach((item, index) => {
    const cantidad = item['# cantidad'] || item.cantidad || item.quantity || 1;
    const nombre = item['T nombre'] || item.nombre || item.name || `Producto ${index + 1}`;
    
    // Crear objeto item SIN product_id si es null
    const itemObj = {
      name: nombre,
      quantity: cantidad,
      unit_price: 0
    };
    
    // Solo agregar product_id si tiene un valor válido (no null)
    const productId = item.product_id || item['product_id'];
    if (productId && productId !== null && productId !== 'null' && productId !== '') {
      itemObj.product_id = productId;
    }
    // Si es null, simplemente no lo incluimos (el backend lo acepta como null de todas formas)
    
    items.push(itemObj);
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

// Retornar resultado
return {
  json: {
    // Datos del cliente (con valores por defecto si están vacíos)
    'T nombre': customerName,
    customer_name: customerName, // También agregar sin el prefijo T
    '# chat_id': customerPhone,
    chat_id: customerPhone, // También agregar sin el prefijo #
    customer_phone: customerPhone,
    'T direccion': customerAddress,
    customer_address: customerAddress,
    '# monto': montoTotal,
    'T pago': paymentMethod,
    payment_method: paymentMethod,
    '# timestamp': timestamp,
    
    // Items parseados (sin product_id null)
    items: items,
    total_amount: totalCalculado || montoTotal,
    
    // External ID
    external_id: finalExternalId,
    
    // Mantener todos los campos originales
    ...inputData,
    
    items_parsed: true
  }
};
```

### 2. Corregir HTTP Request - Usar campos alternativos

**Opción A: Usando JSON (Recomendado)**

```json
{
  "external_id": "{{ $json.external_id }}",
  "customer_name": "{{ $json.customer_name || $json['T nombre'] || '' }}",
  "customer_phone": "{{ $json.customer_phone || $json.chat_id || $json['# chat_id'] || '' }}",
  "customer_address": "{{ $json.customer_address || $json['T direccion'] || $json.direccion || '' }}",
  "items": {{ JSON.stringify($json.items) }},
  "total_amount": {{ $json.total_amount || $json['# monto'] || 0 }},
  "payment_method": "{{ $json.payment_method || $json['T pago'] || 'efectivo' }}",
  "payment_status": "pendiente"
}
```

**Opción B: Usando Fields Below (Si JSON.stringify() da problemas)**

1. Cambia **"Specify Body"** a **"Using Fields Below"**
2. Agrega cada campo manualmente:

| Name | Value |
|------|-------|
| `external_id` | `{{ $json.external_id }}` |
| `customer_name` | `{{ $json.customer_name || $json['T nombre'] }}` |
| `customer_phone` | `{{ $json.customer_phone || $json.chat_id || $json['# chat_id'] }}` |
| `customer_address` | `{{ $json.customer_address || $json['T direccion'] }}` |
| `items` | `{{ $json.items }}` |
| `total_amount` | `{{ $json.total_amount || $json['# monto'] }}` |
| `payment_method` | `{{ $json.payment_method || $json['T pago'] }}` |
| `payment_status` | `pendiente` |

### 3. Debugging: Ver qué datos tienes

**Antes del HTTP Request, agrega un nodo "Set" temporal:**

1. Agrega nodo **"Set"** después del Code
2. Agrega campo:
   - **Name:** `debug_output`
   - **Value:** `{{ JSON.stringify($json) }}`
3. Ejecuta y revisa el OUTPUT para ver exactamente qué campos tienes

---

## 🔍 Por qué product_id null puede causar problemas

n8n a veces serializa `null` de forma incorrecta. La solución es:
- **Omitir el campo** si es `null` (el backend lo acepta como null de todas formas)
- O **forzar el valor** a `null` explícitamente si es necesario

En nuestro código, simplemente no incluimos `product_id` si es null, lo cual es más limpio.

---

## 📋 Checklist

- [ ] Nodo Code actualizado con código de arriba
- [ ] HTTP Request usa campos alternativos (`customer_name` además de `T nombre`)
- [ ] Si `JSON.stringify()` da error, usar "Using Fields Below"
- [ ] Verificar OUTPUT del Code para confirmar que todos los campos tienen valores
- [ ] `items` no incluye `product_id` si es null

---

**Última actualización:** Noviembre 2025
