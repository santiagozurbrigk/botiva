# 🔗 Guía: Vincular Flujos de n8n a Cada Restaurante

## 📋 Problema

Cada restaurante necesita que sus pedidos de n8n (WhatsApp, Instagram, etc.) lleguen a su propio panel de administración, no al de otros restaurantes.

## ✅ Solución: Pasar `restaurant_id` en el Body

El backend ya está preparado para recibir `restaurant_id` en el body del request. Solo necesitas configurarlo en n8n.

---

## 🚀 Pasos para Configurar

### **Paso 1: Obtener el `restaurant_id` del Restaurante**

1. Inicia sesión en el **Panel de Super Admin**
2. Ve a la lista de restaurantes
3. Haz clic en **"Ver Detalles"** del restaurante
4. Copia el **`id`** (UUID) del restaurante

**Ejemplo:**
```
Restaurante: "Ala Burguer"
ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### **Paso 2: Configurar n8n**

#### **Opción A: Usar Variable de Entorno (RECOMENDADO)**

1. En n8n, ve a **Settings** → **Environment Variables**
2. Crea una nueva variable:
   - **Name:** `RESTAURANT_ID`
   - **Value:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (el UUID del restaurante)
3. Guarda la variable

#### **Opción B: Hardcodear en el Body (Menos recomendado)**

Puedes poner el UUID directamente en el body del HTTP Request, pero es menos flexible.

---

### **Paso 3: Actualizar el Body del HTTP Request en n8n**

En el nodo **HTTP Request** que crea pedidos, agrega `restaurant_id` al body:

**Configuración del Body (JSON):**

```json
{
  "external_id": "{{ $json['# chat_id'] }}_{{ $json['# timestamp'] }}",
  "customer_name": "{{ $json['T nombre'] }}",
  "customer_phone": "{{ $json['# chat_id'] }}",
  "customer_address": "{{ $json['T direccion'] }}",
  "restaurant_id": "{{ $env.RESTAURANT_ID }}",
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
  "order_type": "delivery"
}
```

**⚠️ IMPORTANTE:** Agrega la línea `"restaurant_id": "{{ $env.RESTAURANT_ID }}"` al body.

---

## 📝 Ejemplo Completo de Workflow n8n

### **Workflow: WhatsApp → n8n → Botiva**

```
1. Webhook Trigger (WhatsApp)
   ↓
2. HTTP Request (Crear Pedido en Botiva)
   - Method: POST
   - URL: https://botiva.onrender.com/api/orders
   - Headers:
     - Content-Type: application/json
   - Body (JSON):
     {
       "external_id": "{{ $json['# chat_id'] }}_{{ $json['# timestamp'] }}",
       "customer_name": "{{ $json['T nombre'] }}",
       "customer_phone": "{{ $json['# chat_id'] }}",
       "customer_address": "{{ $json['T direccion'] }}",
       "restaurant_id": "{{ $env.RESTAURANT_ID }}",
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
       "order_type": "delivery"
     }
```

---

## 🔄 Múltiples Restaurantes con Múltiples Flujos

Si tienes **múltiples restaurantes**, cada uno necesita su **propio workflow en n8n** con su propio `RESTAURANT_ID`.

### **Estructura Recomendada:**

```
n8n Workflows:
├── WhatsApp → Restaurante A
│   └── RESTAURANT_ID = uuid-restaurante-a
│
├── WhatsApp → Restaurante B
│   └── RESTAURANT_ID = uuid-restaurante-b
│
└── Instagram → Restaurante A
    └── RESTAURANT_ID = uuid-restaurante-a
```

**Cada workflow tiene su propia variable de entorno `RESTAURANT_ID` con el UUID correspondiente.**

---

## ✅ Validación Automática

El backend ahora valida automáticamente:

1. ✅ Que el `restaurant_id` existe
2. ✅ Que el restaurante está activo
3. ✅ Que el pedido se asocia correctamente al restaurante

Si el `restaurant_id` es inválido o el restaurante está inactivo, recibirás un error 400.

---

## 🧪 Probar la Configuración

### **1. Crear un pedido de prueba desde n8n:**

```json
{
  "external_id": "test-123",
  "customer_name": "Cliente Prueba",
  "customer_phone": "+1234567890",
  "customer_address": "Calle Test 123",
  "restaurant_id": "tu-uuid-del-restaurante",
  "items": [
    {
      "product_id": null,
      "name": "Producto Prueba",
      "quantity": 1,
      "unit_price": 100
    }
  ],
  "total_amount": 100,
  "payment_method": "efectivo",
  "order_type": "delivery"
}
```

### **2. Verificar en el Panel de Admin:**

1. Inicia sesión como admin del restaurante
2. Ve a **Pedidos**
3. Deberías ver el pedido de prueba

---

## 🔒 Seguridad

### **Recomendaciones:**

1. ✅ **Usa variables de entorno** en n8n (no hardcodees UUIDs)
2. ✅ **Mantén los UUIDs seguros** (no los compartas públicamente)
3. ✅ **Valida que el restaurante esté activo** antes de crear pedidos
4. ✅ **Usa diferentes workflows** para diferentes restaurantes

---

## 📋 Checklist de Configuración

- [ ] Obtener `restaurant_id` del panel de super admin
- [ ] Crear variable de entorno `RESTAURANT_ID` en n8n
- [ ] Agregar `"restaurant_id": "{{ $env.RESTAURANT_ID }}"` al body del HTTP Request
- [ ] Probar crear un pedido de prueba
- [ ] Verificar que el pedido aparece en el panel del restaurante correcto
- [ ] Configurar workflows separados para cada restaurante (si aplica)

---

## 🆘 Solución de Problemas

### **Error: "restaurant_id es requerido"**

**Causa:** No se está enviando `restaurant_id` en el body.

**Solución:** Agrega `"restaurant_id": "{{ $env.RESTAURANT_ID }}"` al body del HTTP Request.

---

### **Error: "Restaurante no encontrado"**

**Causa:** El `restaurant_id` es inválido o no existe.

**Solución:** 
1. Verifica que el UUID sea correcto
2. Verifica que el restaurante existe en el panel de super admin
3. Copia el UUID nuevamente desde los detalles del restaurante

---

### **Error: "El restaurante está inactivo"**

**Causa:** El restaurante fue desactivado.

**Solución:** 
1. Ve al panel de super admin
2. Activa el restaurante
3. Vuelve a intentar crear el pedido

---

### **El pedido no aparece en el panel del restaurante**

**Causa:** El `restaurant_id` no coincide con el restaurante del admin.

**Solución:**
1. Verifica que el `restaurant_id` en n8n sea el correcto
2. Verifica que el admin pertenece al restaurante correcto
3. Revisa los logs del backend para ver qué `restaurant_id` se está recibiendo

---

## 📚 Recursos Adicionales

- **Guía de integración n8n:** `Backend/n8n-integration-guide.md`
- **Configuración HTTP Request:** `Backend/n8n-http-request-config.md`
- **Arquitectura Multi-Tenant:** `Backend/ARQUITECTURA_MULTI_TENANT.md`
