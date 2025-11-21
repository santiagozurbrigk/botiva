# 🔗 Configuración del Nodo Webhook Trigger en n8n

Esta guía explica paso a paso cómo configurar el nodo **Webhook Trigger** en n8n para recibir notificaciones cuando un pedido cambia a "listo para retirar".

---

## 📋 Paso 1: Agregar el Nodo Webhook Trigger

1. En tu workflow de n8n, haz clic en el botón **"+"** para agregar un nuevo nodo
2. Busca **"Webhook"** en el buscador de nodos
3. Selecciona **"Webhook"** (el nodo con el icono de rayo ⚡)

---

## ⚙️ Paso 2: Configurar el Nodo Webhook

### **Pestaña "Parameters"**

#### **HTTP Method**
```
POST
```
- Selecciona `POST` del dropdown, ya que el backend envía los datos mediante POST.

#### **Path**
```
/webhook/order-ready
```
- Este es el path que se agregará a tu URL de n8n
- **URL completa será:** `https://tu-instancia-n8n.com/webhook/order-ready`
- Puedes cambiar el path si lo deseas (ej: `/pedido-listo`, `/notificacion-pedido`, etc.)

#### **Response Mode**
```
When Last Node Finishes
```
- O también puedes usar: `Last Node`
- Esto significa que n8n responderá al backend cuando el workflow termine de ejecutarse

#### **Response Code**
```
200
```
- Código HTTP de respuesta (200 = OK)

#### **Response Data**
```
All Entries
```
- Mantén el valor por defecto

---

### **Pestaña "Settings" (Opcional)**

#### **Authentication**
```
None
```
- Por defecto, no se requiere autenticación
- Si quieres agregar seguridad, puedes usar:
  - **Header Auth**: Agregar un token en los headers
  - **Basic Auth**: Usuario y contraseña
  - **OAuth2**: Autenticación OAuth

#### **Options**
- **Binary Data**: Dejar desactivado (el webhook envía JSON, no archivos binarios)
- **Raw Body**: Dejar desactivado (n8n procesará el JSON automáticamente)

---

## 🔗 Paso 3: Obtener la URL del Webhook

1. Una vez configurado el nodo, haz clic en **"Execute Node"** o guarda el workflow
2. n8n generará automáticamente la URL del webhook
3. La URL aparecerá en la parte superior del nodo, algo como:
   ```
   https://tu-instancia-n8n.com/webhook/order-ready
   ```
4. **Copia esta URL completa**

---

## 🔧 Paso 4: Configurar la URL en el Backend

1. Abre el archivo `.env` de tu backend
2. Agrega o actualiza la variable:
   ```env
   N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/order-ready
   ```
3. **Reemplaza** `https://tu-instancia-n8n.com` con la URL real de tu instancia de n8n
4. Guarda el archivo y reinicia el servidor backend

---

## ✅ Paso 5: Activar el Workflow

1. En n8n, asegúrate de que el workflow esté **activado** (toggle en la esquina superior derecha)
2. El nodo Webhook solo funciona cuando el workflow está activo
3. Si el workflow está inactivo, el webhook no recibirá las peticiones

---

## 🧪 Paso 6: Probar el Webhook

### **Opción 1: Probar desde el Backend**
1. Cambia el estado de un pedido a "Listo para retirar" en el panel de administración
2. Revisa los logs del backend - deberías ver: `✅ Webhook enviado exitosamente a n8n para pedido {id}`
3. En n8n, revisa el nodo Webhook - deberías ver los datos recibidos

### **Opción 2: Probar con Postman o cURL**

Puedes probar el webhook directamente enviando un POST request:

**Con cURL:**
```bash
curl -X POST https://tu-instancia-n8n.com/webhook/order-ready \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": "6292766184_1763500249525",
    "chat_id": "6292766184",
    "customer_name": "Juan Pérez",
    "customer_phone": "6292766184",
    "status": "finalizado",
    "total_amount": 1500.00,
    "items": []
  }'
```

**Con Postman:**
- **Method:** `POST`
- **URL:** `https://tu-instancia-n8n.com/webhook/order-ready`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "order_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": "6292766184_1763500249525",
    "chat_id": "6292766184",
    "customer_name": "Juan Pérez",
    "customer_phone": "6292766184",
    "status": "finalizado",
    "total_amount": 1500.00,
    "items": []
  }
  ```

---

## 📊 Estructura de Datos Recibidos

El nodo Webhook recibirá un objeto JSON con la siguiente estructura:

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

**Campos importantes:**
- `chat_id`: **CRÍTICO** - ID del chat de WhatsApp para enviar la notificación
- `order_id`: ID interno del pedido
- `external_id`: ID externo del pedido (formato: `chatId_timestamp`)
- `customer_name`: Nombre del cliente
- `status`: Estado del pedido (`"finalizado"` o `"listo para retirar"`)

---

## 🔄 Flujo Completo del Workflow

Después de configurar el Webhook Trigger, tu workflow debería verse así:

```
[Webhook Trigger] 
    ↓
[Code Node] (procesa datos y formatea mensaje)
    ↓
[HTTP Request] (envía mensaje a WhatsApp)
```

---

## 🐛 Solución de Problemas

### El webhook no recibe datos
- ✅ Verifica que el workflow esté **activado**
- ✅ Verifica que la URL en `N8N_WEBHOOK_URL` sea correcta
- ✅ Verifica que el path coincida exactamente (case-sensitive)
- ✅ Revisa los logs del backend para ver si hay errores al enviar el webhook

### Error 404 Not Found
- ✅ Verifica que el path sea correcto
- ✅ Verifica que el workflow esté activado
- ✅ Verifica que la URL de n8n sea correcta

### El webhook recibe datos pero están vacíos
- ✅ Verifica que el backend esté enviando el payload correctamente
- ✅ Revisa los logs del backend
- ✅ Prueba el webhook directamente con Postman o cURL

### El chat_id no está presente
- ✅ Verifica que el pedido se haya creado desde n8n (pedidos manuales pueden no tener `chat_id`)
- ✅ Verifica que el `external_id` tenga el formato `chatId_timestamp`
- ✅ Revisa que el backend esté extrayendo correctamente el `chat_id` del `external_id`

---

## 📝 Notas Importantes

1. **El workflow debe estar activo** para que el webhook funcione
2. **La URL del webhook es única** para cada instancia de n8n
3. **El path es case-sensitive** - `/webhook/order-ready` es diferente de `/webhook/Order-Ready`
4. **El webhook solo acepta POST requests** - otros métodos HTTP no funcionarán
5. **n8n Cloud vs Self-hosted**: La URL será diferente dependiendo de dónde esté alojado tu n8n

---

## 🔗 Siguiente Paso

Una vez configurado el Webhook Trigger, continúa con:
1. **Configurar el nodo Code** - Ver: `Backend/n8n-webhook-receive-order-ready.js`
2. **Configurar el nodo HTTP Request** - Ver: `Backend/n8n-http-request-whatsapp-order-ready.md`

