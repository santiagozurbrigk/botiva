# 📱 Configuración del Nodo HTTP Request en n8n para Enviar Notificación de Pedido Listo

Este documento explica cómo configurar el nodo **HTTP Request** en n8n para enviar una notificación por WhatsApp cuando un pedido está "listo para retirar".

## 🔄 Flujo Completo

1. **Webhook Trigger** - Recibe el webhook del backend cuando el pedido cambia a "listo para retirar"
2. **Code Node** - Procesa los datos y formatea el mensaje (usar código de `n8n-webhook-receive-order-ready.js`)
3. **HTTP Request** - Envía el mensaje a WhatsApp Business API

---

## 📋 Configuración del Nodo HTTP Request

### **Método HTTP**
```
POST
```

### **URL**
```
https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
```

**Nota:** Reemplaza `{PHONE_NUMBER_ID}` con el ID de tu número de WhatsApp Business.

### **Authentication**
- **Type:** `OAuth2` o `Header Auth`
- **Token:** Tu token de acceso de WhatsApp Business API

**O si usas Header Auth:**
- **Name:** `Authorization`
- **Value:** `Bearer {YOUR_ACCESS_TOKEN}`

### **Headers**
```
Content-Type: application/json
```

### **Body (JSON)**

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

**O usando el formato alternativo:**

```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json['# chat_id'] || $json.chat_id }}",
  "type": "text",
  "text": {
    "body": "{{ $json['T mensaje'] || $json.message }}"
  }
}
```

---

## 📊 Campos Importantes del Webhook

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `chat_id` | **CRÍTICO** - ID del chat de WhatsApp para identificar al cliente | `"6292766184"` |
| `order_id` | ID interno del pedido (UUID) | `"123e4567-e89b-12d3-a456-426614174000"` |
| `external_id` | ID externo del pedido | `"6292766184_1763500249525"` |
| `customer_name` | Nombre del cliente | `"Juan Pérez"` |
| `customer_phone` | Teléfono del cliente | `"6292766184"` |
| `status` | Estado del pedido | `"finalizado"` o `"listo para retirar"` |
| `total_amount` | Monto total del pedido | `1500.00` |
| `items` | Array con los items del pedido | `[{name: "Hamburguesa", quantity: 2}]` |
| `message` | Mensaje formateado (generado por el Code Node) | `"¡Hola Juan! Tu pedido..."` |

---

## 🔧 Ejemplo Completo del Body JSON

```json
{
  "messaging_product": "whatsapp",
  "to": "6292766184",
  "type": "text",
  "text": {
    "body": "¡Hola Juan Pérez! 👋\n\nTu pedido #6292766184 está *listo para retirar* ✅\n\n📦 *Resumen del pedido:*\n2x Hamburguesa Clásica\n1x Papas Fritas\n\n💰 *Total: $1500*\n\nPuedes pasar a retirarlo cuando gustes. ¡Gracias por tu compra! 🎉"
  }
}
```

---

## ⚠️ Notas Importantes

1. **`chat_id` es obligatorio**: Sin este campo, no podrás identificar el chat del cliente en WhatsApp.

2. **Formato del `chat_id`**: 
   - Debe ser el número de teléfono sin el código de país (ej: `6292766184`)
   - O con código de país sin el `+` (ej: `5491123456789`)

3. **Token de WhatsApp**: Asegúrate de tener un token válido de WhatsApp Business API con permisos para enviar mensajes.

4. **Rate Limits**: WhatsApp tiene límites de envío. Asegúrate de manejar errores de rate limiting.

---

## 🐛 Solución de Problemas

### Error: "Invalid phone number"
- **Causa**: El `chat_id` no tiene el formato correcto
- **Solución**: Verifica que el `chat_id` sea un número válido sin caracteres especiales

### Error: "Authentication failed"
- **Causa**: Token de WhatsApp inválido o expirado
- **Solución**: Regenera el token en Facebook Developers

### Error: "chat_id is undefined"
- **Causa**: El webhook no está enviando el `chat_id` o el Code Node no lo está procesando
- **Solución**: Verifica que el backend esté enviando `chat_id` en el webhook y que el Code Node lo esté extrayendo correctamente

---

## 📝 Workflow Completo en n8n

```
[Webhook Trigger] 
    ↓
[Code Node] (procesa webhook y formatea mensaje)
    ↓
[HTTP Request] (envía a WhatsApp)
    ↓
[Optional: Set Node] (marca notificación como enviada)
```

---

## 🔗 Referencias

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [n8n HTTP Request Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

