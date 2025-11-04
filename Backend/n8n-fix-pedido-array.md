# 🔧 Solución Rápida: Parsear Array `pedido` en n8n

## Problema Detectado

Tu workflow tiene:
- `pedido[0]` con `# cantidad: 2` y `T nombre: "melt"`
- Faltan datos del cliente (nombre, dirección, monto total)
- JSON mal formado en HTTP Request: `"itome". SS dicon itame ll`

---

## ✅ Solución Paso a Paso

### 1. Nodo Code - Parsear Array `pedido` y Preservar Datos del Cliente

**Copia este código completo en tu nodo Code:**

```javascript
// Obtener TODOS los datos del nodo anterior
const inputData = $input.item.json;

// Obtener el array de pedido (puede venir como 'pedido' o 'T pedido')
const pedidoArray = inputData.pedido || inputData['T pedido'] || [];

// Obtener datos del cliente desde cualquier nodo anterior
// Busca en múltiples ubicaciones posibles
const customerName = inputData['T nombre'] 
  || inputData.customer_name 
  || inputData.nombre 
  || inputData['AI Agent1']?.['T nombre']
  || '';

const customerPhone = inputData['# chat_id'] 
  || inputData.phone 
  || inputData.telefono 
  || inputData['AI Agent1']?.['# chat_id']
  || '';

const customerAddress = inputData['T direccion'] 
  || inputData.direccion 
  || inputData.address 
  || inputData['AI Agent1']?.['T direccion']
  || '';

const montoTotal = inputData['# monto'] 
  || inputData.monto 
  || inputData.total_amount 
  || inputData['AI Agent1']?.['# monto']
  || 0;

const paymentMethod = inputData['T pago'] 
  || inputData.payment_method 
  || inputData.pago 
  || inputData['AI Agent1']?.['T pago']
  || 'efectivo';

const externalId = inputData['# chat_id'] 
  || inputData.external_id 
  || inputData['AI Agent1']?.['# chat_id']
  || '';

const timestamp = inputData['# timestamp'] 
  || inputData.timestamp 
  || Date.now();

// Convertir array de pedido a items del API
const items = [];

if (Array.isArray(pedidoArray)) {
  pedidoArray.forEach((item, index) => {
    const cantidad = item['# cantidad'] || item.cantidad || item.quantity || 1;
    const nombre = item['T nombre'] || item.nombre || item.name || `Producto ${index + 1}`;
    
    items.push({
      product_id: null,
      name: nombre,
      quantity: cantidad,
      unit_price: 0 // Se calculará después
    });
  });
}

// Si no hay items pero hay pedido como string, intentar parsearlo
if (items.length === 0 && typeof pedidoArray === 'string') {
  const productos = pedidoArray.split(/\s+y\s+|\s*,\s*/).map(p => p.trim());
  productos.forEach(producto => {
    const match = producto.match(/^(\d+)\s+(.+)$/);
    if (match) {
      items.push({
        product_id: null,
        name: match[2].trim(),
        quantity: parseInt(match[1]),
        unit_price: 0
      });
    } else {
      items.push({
        product_id: null,
        name: producto,
        quantity: 1,
        unit_price: 0
      });
    }
  });
}

// Calcular precio unitario (dividir total entre cantidad total)
const cantidadTotal = items.reduce((sum, item) => sum + item.quantity, 0);
const precioPorUnidad = cantidadTotal > 0 && montoTotal > 0 ? montoTotal / cantidadTotal : 0;

// Asignar precio unitario a cada item
items.forEach(item => {
  item.unit_price = Math.round(precioPorUnidad);
});

// Calcular total real
const totalCalculado = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

// Generar external_id único
const finalExternalId = externalId ? `${externalId}_${timestamp}` : `order_${timestamp}`;

// Retornar resultado con TODOS los datos necesarios
return {
  json: {
    // Datos del cliente (prioridad a los encontrados)
    'T nombre': customerName,
    '# chat_id': customerPhone,
    'T direccion': customerAddress,
    '# monto': montoTotal,
    'T pago': paymentMethod,
    '# timestamp': timestamp,
    
    // Items parseados
    items: items,
    total_amount: totalCalculado || montoTotal,
    
    // External ID para el API
    external_id: finalExternalId,
    
    // Mantener todos los campos originales
    ...inputData,
    
    // Flags útiles
    items_parsed: true
  }
};
```

### 2. Corregir HTTP Request - JSON Válido

**En el nodo HTTP Request, reemplaza TODO el contenido del JSON con esto:**

```json
{
  "external_id": "{{ $json.external_id }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": {{ $json.items }},
  "total_amount": {{ $json.total_amount }},
  "payment_method": "{{ $json['T pago'] }}",
  "payment_status": "pendiente"
}
```

**⚠️ IMPORTANTE:**
- Asegúrate de que el campo `items` esté en la misma línea que `"items":` (sin saltos de línea raros)
- Elimina cualquier texto como `"itome". SS dicon itame ll`
- Si n8n dice que `items` no es válido, prueba con `{{ JSON.stringify($json.items) }}`

### 3. Verificar que los Datos Lleguen

**Antes del nodo Code, agrega un nodo "Set" temporal para ver qué datos tienes:**

1. Agrega nodo **"Set"** antes del Code
2. En "Keep Only Set Fields" → **DESACTÍVALO** (mantener todos los campos)
3. Agrega un campo de prueba:
   - **Name:** `debug_info`
   - **Value:** `{{ JSON.stringify($json) }}`
4. Ejecuta y revisa el output para ver qué campos tienes disponibles

---

## 🔍 Debugging: Si Faltan Datos del Cliente

Si después del Code aún faltan datos (nombre, dirección, monto), significa que vienen de otro nodo anterior.

### Solución: Usar Nodo "Merge" o "Join"

**Opción A: Merge Nodes (Recomendado)**

1. **Nodo anterior con datos del cliente** (ej: "AI Agent1")
   ↓
2. **Nodo "Merge"** → Merge mode: "Merge By Index" o "Merge By Key"
   ↓
3. **Nodo Code** (con el código de arriba)
   ↓
4. **HTTP Request**

**Configuración del Merge:**
- **Mode:** "Merge By Index"
- Esto combinará los datos de ambos nodos

**Opción B: Usar Expresiones que Referencien Nodos Anteriores**

En el nodo Code, puedes acceder a datos de otros nodos:

```javascript
// Acceder a datos del nodo "AI Agent1"
const aiAgentData = $('AI Agent1').item.json;
const customerName = aiAgentData['T nombre'] || '';
```

---

## 📋 Checklist de Verificación

- [ ] Nodo Code tiene el código completo de arriba
- [ ] HTTP Request tiene JSON válido (sin `"itome"`)
- [ ] `items` en el JSON es `{{ $json.items }}` (sin comillas extra)
- [ ] Todos los campos tienen valores (verifica en el OUTPUT del Code)
- [ ] Si faltan datos, usa Merge para combinar nodos

---

## 🎯 Ejemplo de Output Esperado del Code

Después del Code, deberías ver:

```json
{
  "T nombre": "Juan Pérez",
  "# chat_id": "+5491123456789",
  "T direccion": "Calle Falsa 123",
  "# monto": 18600,
  "T pago": "efectivo",
  "items": [
    {
      "product_id": null,
      "name": "melt",
      "quantity": 2,
      "unit_price": 9300
    }
  ],
  "total_amount": 18600,
  "external_id": "+5491123456789_1234567890",
  "items_parsed": true
}
```

---

**Última actualización:** Noviembre 2025
