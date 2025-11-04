# 🔧 Solución: Parsear Pedido Completo en Items para n8n

## Problema
El agente de IA envía el pedido completo como un string (ej: "2 melt y 3 simple") y necesita:
1. Parsear el string en múltiples items
2. Buscar el precio de cada producto
3. Calcular el total
4. Enviar todo al HTTP Request como array de items

---

## ✅ Solución Completa

### Opción 1: Usar Nodo "Code" para Parsear (Recomendado)

**Coloca un nodo "Code" entre el agente y el HTTP Request:**

#### Paso 1: Configurar Nodo "Code"

**Nodo:** `Code` (o `Function`)

**Código JavaScript (Si `pedido` es un STRING):**

```javascript
// Obtener el string del pedido desde el nodo anterior
const pedidoTexto = $input.item.json['T pedido'] || $input.item.json.pedido || '';
const montoTotal = $input.item.json['# monto'] || $input.item.json.monto || 0;

// Función para parsear el pedido
function parsearPedido(pedidoTexto) {
  const items = [];
  
  // Dividir por "y" o "," para separar productos
  const productos = pedidoTexto.split(/\s+y\s+|\s*,\s*/).map(p => p.trim());
  
  productos.forEach(producto => {
    // Buscar cantidad al inicio (ej: "2 melt" -> cantidad: 2, nombre: "melt")
    const match = producto.match(/^(\d+)\s+(.+)$/);
    
    if (match) {
      const cantidad = parseInt(match[1]);
      const nombre = match[2].trim();
      
      items.push({
        product_id: null,
        name: nombre,
        quantity: cantidad,
        unit_price: 0 // Se calculará después
      });
    } else {
      // Si no tiene cantidad, asumir cantidad 1
      items.push({
        product_id: null,
        name: producto,
        quantity: 1,
        unit_price: 0
      });
    }
  });
  
  return items;
}

// Parsear el pedido
const items = parsearPedido(pedidoTexto);

// Calcular precio unitario por item (dividir total entre cantidad total)
const cantidadTotal = items.reduce((sum, item) => sum + item.quantity, 0);
const precioPorUnidad = cantidadTotal > 0 ? montoTotal / cantidadTotal : 0;

// Asignar precio unitario a cada item
items.forEach(item => {
  item.unit_price = Math.round(precioPorUnidad);
});

// Calcular total real
const totalCalculado = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

// Retornar resultado
return {
  json: {
    ...$input.item.json, // Mantener todos los campos originales
    items: items,
    total_amount: totalCalculado,
    items_parsed: true // Flag para indicar que se parseó
  }
};
```

**Código JavaScript (Si `pedido` es un ARRAY de objetos) - ⭐ USAR ESTE:**

```javascript
// Obtener TODOS los datos del nodo anterior
const inputData = $input.item.json;

// Obtener el array de pedido (puede venir como 'pedido' o 'T pedido')
const pedidoArray = inputData.pedido || inputData['T pedido'] || [];

// Obtener datos del cliente desde cualquier nodo anterior
const customerName = inputData['T nombre'] || inputData.customer_name || inputData.nombre || '';
const customerPhone = inputData['# chat_id'] || inputData.phone || inputData.telefono || '';
const customerAddress = inputData['T direccion'] || inputData.direccion || inputData.address || '';
const montoTotal = inputData['# monto'] || inputData.monto || inputData.total_amount || 0;
const paymentMethod = inputData['T pago'] || inputData.payment_method || inputData.pago || 'efectivo';
const externalId = inputData['# chat_id'] || inputData.external_id || '';
const timestamp = inputData['# timestamp'] || inputData.timestamp || Date.now();

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

// Calcular precio unitario (dividir total entre cantidad total de items)
const cantidadTotal = items.reduce((sum, item) => sum + item.quantity, 0);
const precioPorUnidad = cantidadTotal > 0 ? montoTotal / cantidadTotal : 0;

// Asignar precio unitario a cada item
items.forEach(item => {
  item.unit_price = Math.round(precioPorUnidad);
});

// Calcular total real (para verificación)
const totalCalculado = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

// Retornar resultado con TODOS los datos necesarios
return {
  json: {
    // Datos del cliente
    'T nombre': customerName,
    '# chat_id': customerPhone,
    'T direccion': customerAddress,
    '# monto': montoTotal,
    'T pago': paymentMethod,
    '# timestamp': timestamp,
    
    // Items parseados
    items: items,
    total_amount: totalCalculado,
    
    // Mantener todos los campos originales
    ...inputData,
    
    // Flags útiles
    items_parsed: true,
    external_id: externalId ? `${externalId}_${timestamp}` : `order_${timestamp}`
  }
};
```

#### Paso 2: Configurar HTTP Request

**En el nodo HTTP Request, configura:**

1. **Method:** `POST`
2. **URL:** `https://tu-backend.onrender.com/api/orders`
3. **Authentication:** `Header Auth` → `Authorization` → `Bearer {{ $json.token }}` (si es necesario)
4. **Send Body:** ✅ Activado
5. **Body Content Type:** `JSON`
6. **Specify Body:** `Using JSON`

**JSON Body (IMPORTANTE: Usar expresiones de n8n para items):**

```json
{
  "external_id": "{{ $json.external_id || ($json['# chat_id'] + '_' + $json['# timestamp']) }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": {{ JSON.stringify($json.items) }},
  "total_amount": {{ $json.total_amount || $json['# monto'] }},
  "payment_method": "{{ $json['T pago'] || 'efectivo' }}",
  "payment_status": "pendiente"
}
```

**⚠️ IMPORTANTE:** Si `JSON.stringify()` no funciona, usa esta alternativa:

```json
{
  "external_id": "{{ $json.external_id || ($json['# chat_id'] + '_' + $json['# timestamp']) }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": {{ $json.items }},
  "total_amount": {{ $json.total_amount || $json['# monto'] }},
  "payment_method": "{{ $json['T pago'] || 'efectivo' }}",
  "payment_status": "pendiente"
}
```

**Nota:** n8n debería convertir automáticamente `{{ $json.items }}` a JSON array si `items` es un array en el nodo anterior.

---

### Opción 2: Usar Tabla de Productos con Precios (Más Precisa)

Si tienes una tabla de productos en Supabase o n8n con precios:

#### Paso 1: Nodo "Code" con Búsqueda de Precios

```javascript
const pedidoTexto = $input.item.json['T pedido'] || '';
const montoTotal = $input.item.json['# monto'] || 0;

// Tabla de productos y precios (ajusta según tus productos)
const productosDB = {
  'melt': 9300,
  'simple': 5000,
  'doble': 8000,
  'triple': 10000,
  'hamburguesa': 5000,
  'hamburguesa simple': 5000,
  'hamburguesa doble': 8000,
  // ... agregar más productos
};

function parsearPedidoConPrecios(pedidoTexto, productosDB) {
  const items = [];
  const productos = pedidoTexto.split(/\s+y\s+|\s*,\s*/).map(p => p.trim());
  
  productos.forEach(producto => {
    const match = producto.match(/^(\d+)\s+(.+)$/);
    
    if (match) {
      const cantidad = parseInt(match[1]);
      const nombre = match[2].trim().toLowerCase();
      
      // Buscar precio en la base de datos
      let precio = 0;
      for (const [key, value] of Object.entries(productosDB)) {
        if (nombre.includes(key.toLowerCase())) {
          precio = value;
          break;
        }
      }
      
      // Si no se encuentra, calcular proporcional
      if (precio === 0) {
        precio = Math.round(montoTotal / productos.length / cantidad);
      }
      
      items.push({
        product_id: null,
        name: producto,
        quantity: cantidad,
        unit_price: precio
      });
    } else {
      // Sin cantidad especificada
      const nombre = producto.toLowerCase();
      let precio = 0;
      
      for (const [key, value] of Object.entries(productosDB)) {
        if (nombre.includes(key.toLowerCase())) {
          precio = value;
          break;
        }
      }
      
      if (precio === 0) {
        precio = Math.round(montoTotal / productos.length);
      }
      
      items.push({
        product_id: null,
        name: producto,
        quantity: 1,
        unit_price: precio
      });
    }
  });
  
  return items;
}

const items = parsearPedidoConPrecios(pedidoTexto, productosDB);
const totalCalculado = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

return {
  json: {
    ...$input.item.json,
    items: items,
    total_amount: totalCalculado,
    items_parsed: true
  }
};
```

---

### Opción 3: Usar Expresiones de n8n (Más Simple)

Si prefieres no usar código, puedes usar múltiples nodos:

#### Workflow:
1. **Nodo anterior** (agente) → Envía pedido completo
2. **Nodo "Set"** → Extraer items manualmente
3. **Nodo "HTTP Request"** → Enviar al API

**Nodo "Set" (Extraer Items):**

```
Campo: items
Valor: 
[
  {
    "product_id": null,
    "name": "{{ $json['T pedido'] }}",
    "quantity": 1,
    "unit_price": {{ $json['# monto'] }}
  }
]
```

**Nota:** Esta opción es más simple pero envía todo el pedido como un solo item.

---

### Opción 4: Mejorar el Agente para que Envíe Items Directamente

**Modificar el prompt del agente para que devuelva:**

```json
{
  "pedido_texto": "2 melt y 3 simple",
  "items": [
    {"nombre": "melt", "cantidad": 2, "precio_unitario": 9300},
    {"nombre": "simple", "cantidad": 3, "precio_unitario": 5000}
  ],
  "total": 33600
}
```

Luego en el nodo "Code" o "Set", transforma a la estructura del API:

```javascript
const items = $input.item.json.items.map(item => ({
  product_id: null,
  name: `${item.cantidad} ${item.nombre}`,
  quantity: item.cantidad,
  unit_price: item.precio_unitario
}));

return {
  json: {
    ...$input.item.json,
    items: items,
    total_amount: $input.item.json.total
  }
};
```

---

## 🎯 Recomendación Final

**Usa la Opción 1 (Nodo Code)** porque:
- ✅ Es flexible y funciona con cualquier formato de pedido
- ✅ Calcula el total automáticamente
- ✅ Separa correctamente los items
- ✅ No requiere base de datos externa

**Si tienes precios fijos de productos, usa la Opción 2** para mayor precisión.

---

## 📋 Ejemplo Completo de Workflow

```
1. Telegram Trigger / WhatsApp
   ↓
2. AI Agent (parsea mensaje, extrae pedido)
   ↓
3. Code Node (parsea "2 melt y 3 simple" → items array)
   ↓
4. HTTP Request (envía al API con items parseados)
   ↓
5. Send Message (envía confirmación al cliente)
```

---

## 🔍 Debugging

### Ver qué está parseando el nodo Code:
1. Ejecuta el nodo Code
2. Ve al OUTPUT
3. Verifica que `items` sea un array con objetos
4. Verifica que `total_amount` sea correcto

### Si el parseo no funciona:
- Revisa el formato del string del pedido
- Ajusta la expresión regular en el código según tu formato
- Agrega logs con `console.log()` en el nodo Code

---

**Última actualización:** Noviembre 2025
