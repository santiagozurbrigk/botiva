# Guía de Integración con n8n

## Endpoints para n8n

### 1. Crear Pedido (POST /api/orders)
**URL:** `http://localhost:3001/api/orders`  
**Método:** POST  
**Headers:** `Content-Type: application/json`

**Payload de ejemplo:**
```json
{
  "external_id": "wh_12345",
  "customer_name": "Juan Perez",
  "customer_phone": "+54911xxxxxxx",
  "customer_address": "Calle Falsa 123",
  "items": [
    {
      "product_id": "uuid-del-producto",
      "name": "Hamburguesa X",
      "quantity": 2,
      "unit_price": 1200
    }
  ],
  "total_amount": 2400,
  "payment_method": "efectivo",
  "payment_status": "pendiente"
}
```

### 2. Actualizar Estado de Pago (Admin) (PATCH /api/orders/:id)
**URL:** `http://localhost:3001/api/orders/{order_id}`  
**Método:** PATCH  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {admin_token}`

**Payload de ejemplo:**
```json
{
  "payment_status": "pagado"
}
```

### 3. Actualizar Estado de Pago (Rider) (PATCH /api/orders/:id/payment-status)
**URL:** `http://localhost:3001/api/orders/{order_id}/payment-status`  
**Método:** PATCH  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {rider_token}`

**Payload de ejemplo:**
```json
{
  "payment_status": "pagado"
}
```

**Nota:** Los riders solo pueden actualizar pedidos asignados a ellos.

**Estados de pago disponibles:**
- `pendiente` - Pago pendiente
- `pagado` - Pago confirmado
- `cancelado` - Pago cancelado
- `reembolsado` - Pago reembolsado

### 3. Obtener Pedido (GET /api/orders/:id)
**URL:** `http://localhost:3001/api/orders/{order_id}`  
**Método:** GET  
**Headers:** `Authorization: Bearer {admin_token}`

## Flujo de Automatización Sugerido

### 1. Creación de Pedido desde WhatsApp
```
WhatsApp → n8n → POST /api/orders
```

### 2. Confirmación de Pago (Admin)
```
Sistema de Pago → n8n → PATCH /api/orders/:id
```

### 3. Confirmación de Pago (Rider)
```
Rider App → n8n → PATCH /api/orders/:id/payment-status
```

### 4. Notificación de Estado
```
n8n → WhatsApp (cuando cambia el estado)
```

## Configuración de n8n

### Webhook para Crear Pedidos
1. **Trigger:** Webhook
2. **Method:** POST
3. **Path:** `/create-order`
4. **Response:** JSON con el pedido creado

### Webhook para Actualizar Pago
1. **Trigger:** Webhook
2. **Method:** POST
3. **Path:** `/update-payment`
4. **Body:** `{ "order_id": "uuid", "payment_status": "pagado" }`

### Ejemplo de Workflow n8n

```json
{
  "nodes": [
    {
      "name": "Webhook - Crear Pedido",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "create-order",
        "httpMethod": "POST"
      }
    },
    {
      "name": "HTTP Request - API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3001/api/orders",
        "method": "POST",
        "body": "={{ $json }}"
      }
    },
    {
      "name": "Webhook - Actualizar Pago",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "update-payment",
        "httpMethod": "POST"
      }
    },
    {
      "name": "HTTP Request - Actualizar",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3001/api/orders/{{ $json.order_id }}",
        "method": "PATCH",
        "headers": {
          "Authorization": "Bearer YOUR_ADMIN_TOKEN"
        },
        "body": {
          "payment_status": "{{ $json.payment_status }}"
        }
      }
    }
  ]
}
```

## Variables de Entorno para n8n

```env
API_BASE_URL=http://localhost:3001
ADMIN_TOKEN=your_admin_jwt_token
```

## Notas Importantes

1. **Autenticación:** Los endpoints de actualización requieren token de administrador
2. **Validación:** El backend valida que los estados sean válidos
3. **Logs:** Todos los cambios se registran en `order_events`
4. **Realtime:** Los cambios se reflejan inmediatamente en el panel de administración

## Testing

### Crear pedido de prueba
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "test_001",
    "customer_name": "Cliente Test",
    "customer_phone": "+54911234567",
    "customer_address": "Dirección Test 123",
    "items": [
      {
        "product_id": "uuid-del-producto",
        "name": "Hamburguesa Test",
        "quantity": 1,
        "unit_price": 1500
      }
    ],
    "total_amount": 1500,
    "payment_method": "efectivo",
    "payment_status": "pendiente"
  }'
```

### Actualizar estado de pago (Admin)
```bash
curl -X PATCH http://localhost:3001/api/orders/{order_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"payment_status": "pagado"}'
```

### Actualizar estado de pago (Rider)
```bash
curl -X PATCH http://localhost:3001/api/orders/{order_id}/payment-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -d '{"payment_status": "pagado"}'
```
