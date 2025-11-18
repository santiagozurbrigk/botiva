# 🔧 Configuración Final del Nodo HTTP Request en n8n

## ⚠️ ERRORES COMUNES

1. **Método HTTP incorrecto**: Usar `PUT` en lugar de `POST` → Error 404
2. **restaurant_id vacío**: No se está pasando el `restaurant_id` desde un nodo Set anterior

---

## ✅ CONFIGURACIÓN CORRECTA DEL HTTP REQUEST

### **1. Configuración Básica**

| Campo | Valor |
|-------|-------|
| **Method** | `POST` ⚠️ (NO usar PUT) |
| **URL** | `https://botiva.onrender.com/api/orders` |
| **Authentication** | `None` |
| **Send Headers** | `ON` ✓ |
| **Send Body** | `ON` ✓ |

---

### **2. Headers**

Agregar un header:
- **Name:** `Content-Type`
- **Value:** `application/json`

---

### **3. Body (JSON)**

**Body Content Type:** `JSON`

**Body (JSON):**

```json
{
  "external_id": "{{ $json.external_id }}",
  "customer_name": "{{ $json.customer_name }}",
  "customer_phone": "{{ $json.customer_phone }}",
  "customer_address": "{{ $json.customer_address }}",
  "restaurant_id": "{{ $json.restaurant_id }}",
  "items": {{ JSON.stringify($json.items) }},
  "total_amount": {{ $json.total_amount }},
  "payment_method": "{{ $json.payment_method }}",
  "order_type": "delivery"
}
```

**⚠️ IMPORTANTE:**
- Si `JSON.stringify()` no funciona en n8n, usa directamente: `{{ $json.items }}`
- Asegúrate de que `restaurant_id` tenga un valor (debe venir del nodo Set anterior)

---

## 📋 ESTRUCTURA DEL WORKFLOW

```
1. Webhook/Trigger (recibe datos de WhatsApp)
   ↓
2. Set Node (agrega restaurant_id) ⚠️ OBLIGATORIO
   - Name: restaurant_id
   - Value: "tu-uuid-del-restaurante" (ej: "2e7cc59e-d498-4a16-823a-44abaed36d37")
   ↓
3. Code Node (parsea el pedido)
   - Usa el código actualizado de n8n-code-node-parse-pedido.js
   ↓
4. HTTP Request (envía al API) ⚠️ MÉTODO POST
   - Method: POST
   - URL: https://botiva.onrender.com/api/orders
   - Body: JSON (ver arriba)
```

---

## 🔍 VERIFICACIÓN

### **Antes de ejecutar, verifica:**

1. ✅ El nodo **Set** está antes del **Code** y agrega `restaurant_id`
2. ✅ El **HTTP Request** usa método **POST** (no PUT)
3. ✅ El `restaurant_id` tiene un valor en el output del nodo Code
4. ✅ El `customer_phone` tiene un valor (no está vacío)
5. ✅ Los `items` están parseados correctamente

### **Para verificar el output del nodo Code:**

Después de ejecutar el nodo Code, verifica que el output tenga:
- `restaurant_id`: Debe tener un UUID (ej: "2e7cc59e-d498-4a16-823a-44abaed36d37")
- `customer_phone`: Debe tener el chat_id (ej: "6292766184")
- `items`: Debe ser un array con objetos que tengan `product_id`, `name`, `quantity`, `unit_price`
- `external_id`: Debe tener un valor único

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error 404: "Cannot PUT /api/orders"**

**Causa:** Estás usando `PUT` en lugar de `POST`

**Solución:** Cambia el método HTTP a `POST` en el nodo HTTP Request

---

### **Error: "restaurant_id es requerido"**

**Causa:** El `restaurant_id` está vacío o no se está pasando

**Solución:**
1. Agrega un nodo **Set** antes del nodo **Code**
2. Configura el nodo Set:
   - Name: `restaurant_id`
   - Value: `tu-uuid-del-restaurante` (copia el UUID desde el panel de super admin)

---

### **Error: "customer_phone está vacío"**

**Causa:** El `chat_id` no se está extrayendo correctamente

**Solución:** Verifica que en el nodo Code, el campo `chat_id` tenga un valor. Si está vacío, revisa el nodo anterior que procesa los datos de WhatsApp.

---

### **Error: "items está vacío"**

**Causa:** El pedido no se está parseando correctamente

**Solución:** 
1. Verifica que el campo `T pedido` tenga un valor en el input del nodo Code
2. Revisa el código de parseo en el nodo Code
3. Verifica que el formato del pedido sea correcto (ej: "2 ojos de bife")

---

## 📝 EJEMPLO COMPLETO DEL BODY

Si el output del nodo Code es:
```json
{
  "external_id": "6292766184_1763500249525",
  "customer_name": "Cliente",
  "customer_phone": "6292766184",
  "customer_address": "",
  "restaurant_id": "2e7cc59e-d498-4a16-823a-44abaed36d37",
  "items": [
    {
      "product_id": null,
      "name": "ojos de bife - Ojo de bife 1: + salsa alioli",
      "quantity": 2,
      "unit_price": 17850
    }
  ],
  "total_amount": 35700,
  "payment_method": "efectivo",
  "order_type": "delivery"
}
```

El HTTP Request debería enviar exactamente lo mismo (usando las expresiones de n8n).

---

**Última actualización:** Noviembre 2025

