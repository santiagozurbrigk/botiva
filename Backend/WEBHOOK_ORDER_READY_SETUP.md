# 🔔 Configuración del Webhook para Pedidos "Listo para Retirar"

Este documento explica cómo configurar el sistema para enviar notificaciones a n8n cuando un pedido cambia de estado a "listo para retirar".

## 📋 Resumen de Cambios

### Backend
1. ✅ **Creado `Backend/utils/webhook.js`**: Función para enviar webhooks a n8n
2. ✅ **Modificado `Backend/routes/orders.js`**: Envía webhook cuando estado cambia a `"finalizado"`
3. ✅ **Modificado `Backend/routes/kitchen.js`**: Envía webhook cuando estado cambia a `"listo para retirar"`
4. ✅ **Agregado `chat_id` al payload**: El webhook ahora incluye el `chat_id` para identificar el chat de WhatsApp

### n8n
1. ✅ **Creado `Backend/n8n-webhook-receive-order-ready.js`**: Código para el nodo Code que recibe el webhook
2. ✅ **Creado `Backend/n8n-http-request-whatsapp-order-ready.md`**: Documentación para configurar el nodo HTTP Request

---

## 🔧 Configuración del Backend

### 1. Variable de Entorno

Agrega esta variable en tu archivo `.env`:

```env
N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/order-ready
```

**Nota:** Si no configuras esta variable, el sistema funcionará normalmente pero no enviará webhooks (no es crítico).

### 2. Payload del Webhook

El backend envía el siguiente payload cuando un pedido cambia a "listo para retirar":

```json
{
  "order_id": "123e4567-e89b-12d3-a456-426614174000",
  "external_id": "6292766184_1763500249525",
  "chat_id": "6292766184",
  "customer_name": "Juan Pérez",
  "customer_phone": "6292766184",
  "customer_address": "Calle Falsa 123",
  "status": "finalizado",
  "total_amount": 1500.00,
  "payment_method": "efectivo",
  "payment_status": "pendiente",
  "order_type": "delivery",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": "item-uuid",
      "product_id": null,
      "product_name": "Hamburguesa Clásica",
      "quantity": 2,
      "unit_price": 750.00
    }
  ]
}
```

**Campo crítico:** `chat_id` - Este es el ID del chat de WhatsApp que se usa para identificar al cliente y enviarle la notificación.

---

## 🔧 Configuración de n8n

### 1. Crear el Workflow

Crea un nuevo workflow en n8n con los siguientes nodos:

```
[Webhook Trigger] → [Code Node] → [HTTP Request a WhatsApp]
```

### 2. Configurar el Webhook Trigger

- **HTTP Method:** `POST`
- **Path:** `/webhook/order-ready` (o el path que configuraste en `N8N_WEBHOOK_URL`)
- **Response Mode:** `Last Node` o `When Last Node Finishes`

### 3. Configurar el Code Node

Copia y pega el código de `Backend/n8n-webhook-receive-order-ready.js` en el nodo Code.

Este nodo:
- Recibe los datos del webhook
- Extrae el `chat_id` y otros campos importantes
- Formatea el mensaje para WhatsApp

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

## 🔄 Flujo Completo

1. **Admin cambia estado del pedido** a "Listo para retirar" en el panel
2. **Backend actualiza** el estado en la base de datos
3. **Backend envía webhook** a n8n con todos los datos del pedido (incluyendo `chat_id`)
4. **n8n recibe el webhook** en el nodo Webhook Trigger
5. **Code Node procesa** los datos y formatea el mensaje
6. **HTTP Request envía** el mensaje a WhatsApp usando el `chat_id`

---

## ✅ Verificación

Para verificar que todo funciona:

1. **Cambia el estado de un pedido** a "Listo para retirar" en el panel de administración
2. **Revisa los logs del backend** - Deberías ver: `✅ Webhook enviado exitosamente a n8n para pedido {id}`
3. **Revisa el workflow en n8n** - Deberías ver que el webhook se recibió y procesó
4. **Verifica que el cliente recibió** el mensaje en WhatsApp

---

## 🐛 Solución de Problemas

### El webhook no se envía
- Verifica que `N8N_WEBHOOK_URL` esté configurada en el `.env`
- Revisa los logs del backend para ver si hay errores

### El `chat_id` está vacío o undefined
- Verifica que el pedido se haya creado desde n8n (pedidos manuales pueden no tener `chat_id`)
- Revisa que el `external_id` tenga el formato `chatId_timestamp`
- El backend intenta extraer el `chat_id` del `external_id`, pero si no está disponible, usa `customer_phone`

### El mensaje no llega a WhatsApp
- Verifica que el `chat_id` sea correcto
- Revisa que el token de WhatsApp Business API sea válido
- Verifica los logs del nodo HTTP Request en n8n

---

## 📝 Notas Adicionales

- El webhook se envía de forma **asíncrona**, por lo que no bloquea la respuesta del endpoint
- Si el webhook falla, se registra en los logs pero **no interrumpe** el flujo principal
- El `chat_id` se extrae del `external_id` (formato: `chatId_timestamp`) o se usa `customer_phone` como fallback
- Solo se envía webhook cuando el estado cambia a `"finalizado"` (panel admin) o `"listo para retirar"` (panel cocina)

