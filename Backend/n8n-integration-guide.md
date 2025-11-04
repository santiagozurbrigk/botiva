# Guía de Integración con n8n

> **🌐 URLs de Producción:**
> - **Backend:** https://botiva.onrender.com
> - **Frontend:** https://botiva.vercel.app

## Endpoints para n8n

### 1. Crear Pedido (POST /api/orders)
**URL:** `https://botiva.onrender.com/api/orders`  
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
**URL:** `https://botiva.onrender.com/api/orders/{order_id}`  
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
**URL:** `https://botiva.onrender.com/api/orders/{order_id}/payment-status`  
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

### 4. Obtener Pedido (GET /api/orders/:id)
**URL:** `https://botiva.onrender.com/api/orders/{order_id}`  
**Método:** GET  
**Headers:** `Authorization: Bearer {admin_token}`

## Flujo de Automatización Sugerido

### 1. Creación de Pedido desde WhatsApp
```
WhatsApp → n8n → POST https://botiva.onrender.com/api/orders
```

### 2. Confirmación de Pago (Admin)
```
Sistema de Pago → n8n → PATCH https://botiva.onrender.com/api/orders/:id
```

### 3. Confirmación de Pago (Rider)
```
Rider App → n8n → PATCH https://botiva.onrender.com/api/orders/:id/payment-status
```

### 4. Notificación de Estado
```
n8n → WhatsApp (cuando cambia el estado)
```

### 5. Ver Pedido en Panel Web
```
Cliente/Admin → https://botiva.vercel.app
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

**Workflow 1: Crear Pedido (sin autenticación requerida)**

**Configuración del nodo HTTP Request:**

1. **Method:** `POST`
2. **URL:** `https://botiva.onrender.com/api/orders`
3. **Authentication:** `None`
4. **Send Headers:** `ON`
   - **Header Name:** `Content-Type`
   - **Header Value:** `application/json`
5. **Send Body:** `ON`
   - **Body Content Type:** `JSON`
   - **Body:** Usa esta estructura con los campos de tu nodo anterior:

```json
{
  "external_id": "{{ $json['# chat_id'] }}_{{ $json['# timestamp'] }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": [
    {
      "product_id": null,
      "name": "{{ $json['T pedido'] }}",
      "quantity": 1,
      "unit_price": {{ $json['# monto'] }}
    }
  ],
  "total_amount": {{ $json['# monto'] }},
  "payment_method": "{{ $json['T pago'] }}",
  "payment_status": "pendiente"
}
```

**Nota:** 
- Reemplaza los nombres de campos (`{{ $json['campo'] }}`) con los nombres exactos de tus columnas en n8n
- Si `T pedido` contiene múltiples productos, necesitarás parsear el string y crear múltiples items
- `product_id` puede ser `null` si no tienes el UUID del producto en tu base de datos

**Workflow 2: Actualizar Estado de Pago (requiere autenticación)**

Este workflow muestra cómo obtener el token y usarlo:
```json
{
  "nodes": [
    {
      "name": "Webhook - Actualizar Pago",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "update-payment",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Login Admin",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://botiva.onrender.com/api/auth/login-admin",
        "method": "POST",
        "body": {
          "email": "{{ $env.ADMIN_EMAIL }}",
          "password": "{{ $env.ADMIN_PASSWORD }}"
        }
      }
    },
    {
      "name": "Set Token",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "token": "={{ $json.token }}"
        }
      }
    },
    {
      "name": "HTTP Request - Actualizar Pago",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://botiva.onrender.com/api/orders/{{ $('Webhook - Actualizar Pago').item.json.order_id }}",
        "method": "PATCH",
        "headers": {
          "Authorization": "Bearer {{ $json.token }}"
        },
        "body": {
          "payment_status": "{{ $('Webhook - Actualizar Pago').item.json.payment_status }}"
        }
      }
    }
  ]
}
```

**Nota:** En n8n, también puedes almacenar el token en variables de entorno una vez obtenido, para evitar hacer login en cada ejecución del workflow.

## 🔑 Cómo Obtener el Token de Autenticación

El `{admin_token}` o `{rider_token}` es un **JWT (JSON Web Token)** que se obtiene al hacer login. Debes reemplazarlo con el token real que obtienes del endpoint de autenticación.

### Obtener Token de Administrador

**Método 1: Usando curl**
```bash
curl -X POST https://botiva.onrender.com/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@ejemplo.com",
    "password": "tu-contraseña"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "tu-email@ejemplo.com",
    "role": "admin"
  }
}
```

**El valor de `"token"` es el que debes usar en `Authorization: Bearer {token}`**

### Obtener Token de Repartidor

```bash
curl -X POST https://botiva.onrender.com/api/auth/login-rider \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@ejemplo.com",
    "password": "tu-contraseña"
  }'
```

### Ejemplo de Uso del Token

Una vez que tengas el token, úsalo así:

```bash
# Reemplazar YOUR_ACTUAL_TOKEN con el token obtenido del login
curl -X PATCH https://botiva.onrender.com/api/orders/{order_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"payment_status": "pagado"}'
```

### En n8n

1. **Opción 1:** Hacer login al inicio del workflow y guardar el token en una variable
2. **Opción 2:** Guardar el token manualmente en variables de entorno de n8n
3. **Opción 3:** Usar un token de larga duración (si configuras Supabase para eso)

**Ejemplo de workflow n8n para obtener token:**
```
1. HTTP Request → POST /api/auth/login-admin
2. Set Node → Guardar {{ $json.token }} en variable $token
3. HTTP Request → Usar {{ $token }} en header Authorization
```

## Variables de Entorno para n8n

**Opción 1: Usar tokens directamente (menos seguro, requiere renovación manual)**
```env
API_BASE_URL=https://botiva.onrender.com
FRONTEND_URL=https://botiva.vercel.app
ADMIN_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Token obtenido del login
RIDER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Token obtenido del login
```

**Opción 2: Usar credenciales para login automático (más seguro, recomendado)**
```env
API_BASE_URL=https://botiva.onrender.com
FRONTEND_URL=https://botiva.vercel.app
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=tu-contraseña-segura
RIDER_EMAIL=rider@ejemplo.com
RIDER_PASSWORD=contraseña-rider
```

> **⚠️ Importante:** 
> - Los tokens JWT tienen una duración limitada (por defecto 1 hora en Supabase)
> - Si expira, deberás hacer login de nuevo para obtener un nuevo token
> - **Recomendación:** Usa la Opción 2 (credenciales) y haz login automático en cada workflow para evitar tokens expirados

## ⚠️ Configuración del Body en HTTP Request (n8n)

**IMPORTANTE:** El error "Bad request - please check your parameters" ocurre cuando el body está vacío.

**Solución:**
1. En el nodo HTTP Request, asegúrate de que **"Send Body"** esté activado
2. **Body Content Type:** Selecciona `JSON`
3. **Body:** Usa esta estructura (ajusta los nombres de campos según tus datos):

```json
{
  "external_id": "{{ $json['# chat_id'] }}_{{ $json['# timestamp'] }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "items": [
    {
      "product_id": null,
      "name": "{{ $json['T pedido'] }}",
      "quantity": 1,
      "unit_price": {{ $json['# monto'] }}
    }
  ],
  "total_amount": {{ $json['# monto'] }},
  "payment_method": "{{ $json['T pago'] }}",
  "payment_status": "pendiente"
}
```

**⚠️ Nota:** Los campos numéricos (`# monto`) NO deben tener comillas. Los campos de texto SÍ deben tener comillas.

📄 **Ver guía completa:** `n8n-http-request-config.md`

## Notas Importantes

1. **Autenticación:** Los endpoints de actualización requieren token de administrador o rider según el caso
2. **Validación:** El backend valida que los estados sean válidos
3. **Logs:** Todos los cambios se registran en `order_events`
4. **Realtime:** Los cambios se reflejan inmediatamente en el panel de administración (https://botiva.vercel.app)
5. **HTTPS:** Todas las URLs de producción usan HTTPS (obligatorio para producción)
6. **CORS:** El backend está configurado para aceptar peticiones desde el frontend de producción
7. **Body en n8n:** Asegúrate de configurar el body JSON correctamente en el nodo HTTP Request

## Testing

### Crear pedido de prueba
```bash
curl -X POST https://botiva.onrender.com/api/orders \
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

### Verificar Health Check
```bash
curl https://botiva.onrender.com/health
```

### Obtener token y actualizar estado de pago (Admin)

**Paso 1: Obtener el token**
```bash
# Guarda la respuesta en una variable o cópiala
TOKEN=$(curl -X POST https://botiva.onrender.com/api/auth/login-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@ejemplo.com", "password": "tu-contraseña"}' \
  | jq -r '.token')
```

**Paso 2: Usar el token para actualizar el pedido**
```bash
curl -X PATCH https://botiva.onrender.com/api/orders/{order_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"payment_status": "pagado"}'
```

**O manualmente (copiando el token de la respuesta del login):**
```bash
# Primero haz login y copia el token de la respuesta
# Luego úsalo así (reemplaza YOUR_ACTUAL_TOKEN con el token obtenido):
curl -X PATCH https://botiva.onrender.com/api/orders/{order_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"payment_status": "pagado"}'
```

### Obtener token y actualizar estado de pago (Rider)

**Paso 1: Obtener el token**
```bash
TOKEN=$(curl -X POST https://botiva.onrender.com/api/auth/login-rider \
  -H "Content-Type: application/json" \
  -d '{"email": "rider@ejemplo.com", "password": "contraseña"}' \
  | jq -r '.token')
```

**Paso 2: Usar el token para actualizar el pedido**
```bash
curl -X PATCH https://botiva.onrender.com/api/orders/{order_id}/payment-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"payment_status": "pagado"}'
```

## 🔗 Enlaces Útiles

- **Panel de Administración:** https://botiva.vercel.app
- **Health Check Backend:** https://botiva.onrender.com/health
- **API Base URL:** https://botiva.onrender.com/api
