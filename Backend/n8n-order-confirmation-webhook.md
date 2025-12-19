# 📱 Configuración del Webhook de Confirmación de Pedido en n8n

Este documento explica cómo configurar n8n para recibir y procesar la confirmación de pedidos cuando un restaurante vende por kilo y el empleado completa el peso/total del pedido.

## 🔄 Flujo Completo

1. **Cliente hace pedido por WhatsApp** → Bot envía pedido al panel de admin **SIN total** (porque se vende por kilo)
2. **Empleado pesa la comida** y completa el total en el panel de administración
3. **Backend envía webhook a n8n** con el pedido confirmado (incluyendo total real)
4. **n8n recibe el webhook** y confirma el pedido al cliente por WhatsApp con el total real

---

## 🔧 Configuración del Backend

### Variable de Entorno

Agrega la siguiente variable de entorno en tu archivo `.env`:

```env
N8N_ORDER_CONFIRMATION_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/order-confirmation
```

**Nota:** Si no configuras esta variable, se usará `N8N_WEBHOOK_URL` como fallback.

---

## 📋 Estructura del Webhook

Cuando un empleado confirma el peso y total del pedido, el backend envía un webhook con la siguiente estructura:

```json
{
  "order_id": "123e4567-e89b-12d3-a456-426614174000",
  "external_id": "6292766184_1763500249525",
  "chat_id": "6292766184",
  "customer_name": "Juan Pérez",
  "customer_phone": "6292766184",
  "customer_address": "Calle Falsa 123",
  "status": "pendiente",
  "total_amount": 2500.00,
  "payment_method": "efectivo",
  "payment_status": "pendiente",
  "order_type": "delivery",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": "item-uuid",
      "product_id": null,
      "product_name": "Comida por kilo",
      "quantity": 1,
      "unit_price": 2500.00,
      "weight_kg": 1.250
    }
  ],
  "confirmed": true,
  "delivery_time_minutes": 45
}
```

**Campos importantes:**
- `chat_id`: ID del chat de WhatsApp para identificar al cliente
- `total_amount`: Total real del pedido después de pesar
- `items[].weight_kg`: Peso real en kilogramos de cada item
- `confirmed`: Indica que el pedido fue confirmado después de pesar
- `delivery_time_minutes`: Tiempo de demora en minutos configurado por el restaurante en su panel de administración

---

## 🔧 Configuración de n8n

### 1. Crear el Workflow

Crea un nuevo workflow en n8n con los siguientes nodos:

```
[Webhook Trigger] → [Code Node] → [HTTP Request a WhatsApp]
```

### 2. Configurar el Webhook Trigger

- **HTTP Method:** `POST`
- **Path:** `/webhook/order-confirmation` (o el path que configuraste en `N8N_ORDER_CONFIRMATION_WEBHOOK_URL`)
- **Response Mode:** `Last Node` o `When Last Node Finishes`

**Obtener la URL del webhook:**
1. Ejecuta el workflow
2. Copia la URL que aparece en el nodo Webhook Trigger
3. Configúrala en `N8N_ORDER_CONFIRMATION_WEBHOOK_URL` en el backend

---

### 3. Configurar el Code Node

Copia y pega el siguiente código en el nodo Code:

```javascript
// Obtener los datos del webhook
const webhookData = $input.item.json;

// Extraer información del pedido
const orderId = webhookData.order_id;
const externalId = webhookData.external_id;
const chatId = webhookData.chat_id; // ID del chat de WhatsApp para responder al cliente
const customerName = webhookData.customer_name;
const customerPhone = webhookData.customer_phone;
const totalAmount = webhookData.total_amount;
const items = webhookData.items || [];
const deliveryTimeMinutes = webhookData.delivery_time_minutes || 30; // Tiempo de demora en minutos

// Formatear items con peso para el mensaje
const itemsText = items.map(item => {
  const quantity = item.quantity || 1;
  const name = item.product_name || 'Producto';
  const weight = item.weight_kg ? `${item.weight_kg} kg` : '';
  const price = item.unit_price || 0;
  
  if (weight) {
    return `${quantity}x ${name} (${weight}) - $${price}`;
  } else {
    return `${quantity}x ${name} - $${price}`;
  }
}).join('\n');

// Calcular tiempo estimado de entrega
const deliveryTimeHours = Math.floor(deliveryTimeMinutes / 60);
const deliveryTimeMins = deliveryTimeMinutes % 60;
let deliveryTimeText = '';
if (deliveryTimeHours > 0 && deliveryTimeMins > 0) {
  deliveryTimeText = `${deliveryTimeHours} hora${deliveryTimeHours > 1 ? 's' : ''} y ${deliveryTimeMins} minuto${deliveryTimeMins > 1 ? 's' : ''}`;
} else if (deliveryTimeHours > 0) {
  deliveryTimeText = `${deliveryTimeHours} hora${deliveryTimeHours > 1 ? 's' : ''}`;
} else {
  deliveryTimeText = `${deliveryTimeMins} minuto${deliveryTimeMins > 1 ? 's' : ''}`;
}

// Mensaje para enviar al cliente por WhatsApp
const message = `¡Hola ${customerName}! 👋

Tu pedido #${externalId.split('_')[0] || orderId} ha sido *confirmado* ✅

📦 *Resumen del pedido:*
${itemsText}

💰 *Total: $${totalAmount}*

⏱️ *Tiempo estimado de entrega: ${deliveryTimeText}*

¡Gracias por tu compra! 🎉`;

// Retornar datos para el siguiente nodo (HTTP Request a WhatsApp)
return {
  json: {
    // Datos originales del webhook
    ...webhookData,
    
    // chat_id es crítico para identificar el chat en WhatsApp
    chat_id: chatId,
    '# chat_id': chatId, // Formato alternativo para compatibilidad
    
    // Mensaje formateado para WhatsApp
    message: message,
    'T mensaje': message, // Formato alternativo
    
    // Información adicional útil
    order_id: orderId,
    external_id: externalId,
    customer_name: customerName,
    customer_phone: customerPhone,
    total_amount: totalAmount,
    items: items,
    items_text: itemsText,
    delivery_time_minutes: deliveryTimeMinutes,
    delivery_time_text: deliveryTimeText,
    
    // Flags útiles
    confirmed: true,
    notification_sent: false // Se marcará como true después de enviar
  }
};
```

---

### 4. Configurar el HTTP Request (WhatsApp)

Sigue la documentación en `Backend/n8n-http-request-whatsapp-order-ready.md` para configurar el nodo HTTP Request que envía el mensaje a WhatsApp.

**Campos importantes:**
- **URL:** `https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`
- **Method:** `POST`
- **Body:** 
  ```json
  {
    "messaging_product": "whatsapp",
    "to": "{{ $json.chat_id }}",
    "type": "text",
    "text": {
      "body": "{{ $json.message }}"
    }
  }
  ```

---

## 🔄 Flujo Completo Resumido

1. **Cliente:** "Quiero comida por kilo"
2. **Bot (n8n):** Envía pedido al backend **SIN total** (total_amount = 0)
3. **Backend:** Crea pedido con `pending_weight_confirmation = true`
4. **Panel Admin:** Muestra pedido con indicador "Pendiente de confirmación"
5. **Empleado:** Pesa la comida y completa el total en el panel
6. **Backend:** Actualiza pedido y envía webhook a n8n con total confirmado
7. **n8n:** Recibe webhook y envía mensaje de confirmación al cliente por WhatsApp
8. **Cliente:** Recibe mensaje con el total real del pedido

---

## ⚠️ Notas Importantes

1. **Diferencia con webhook de "listo para retirar":**
   - El webhook de confirmación se envía cuando se **confirma el peso/total** (para restaurantes por kilo)
   - El webhook de "listo para retirar" se envía cuando el pedido cambia a estado "finalizado"

2. **Campo `confirmed`:**
   - Siempre será `true` en este webhook, ya que solo se envía después de confirmar el peso

3. **Manejo de errores:**
   - Si el webhook falla, el pedido ya está confirmado en el sistema
   - El cliente puede no recibir la confirmación automática, pero el pedido está registrado

---

## 🧪 Pruebas

Para probar el webhook:

1. Crea un restaurante con `sells_by_weight = true`
2. Envía un pedido desde n8n con `total_amount = 0`
3. En el panel de admin, confirma el peso del pedido
4. Verifica que n8n recibe el webhook y envía el mensaje al cliente

---

## 📝 Archivos Relacionados

- `Backend/utils/webhook.js` - Función `sendOrderConfirmationWebhook`
- `Backend/routes/orders.js` - Endpoint `PATCH /api/orders/:id/confirm-weight`
- `Frontend/src/pages/admin/Orders.jsx` - Interfaz para confirmar peso

