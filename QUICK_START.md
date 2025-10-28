# 🚀 Inicio Rápido - Ala Burguer

## ⚡ Configuración en 5 minutos

### 1️⃣ Supabase (2 minutos)

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el SQL Editor, ejecuta el contenido de `Backend/supabase-schema.sql`
3. Ve a Settings → API y copia:
   - Project URL
   - anon/public key
   - service_role key

### 2️⃣ Backend (1 minuto)

```bash
cd Backend
npm install
```

Crea `Backend/.env`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
SUPABASE_ANON_KEY=tu_anon_key_aqui
PORT=3001
```

Inicia el servidor:
```bash
npm run dev
```

### 3️⃣ Frontend (1 minuto)

```bash
cd Frontend
npm install
```

Crea `Frontend/.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_API_URL=http://localhost:3001
```

Inicia el frontend:
```bash
npm run dev
```

### 4️⃣ Crear Usuario Admin (1 minuto)

1. Ve a Supabase Dashboard → Authentication → Users
2. Click en "Add user" → "Create new user"
3. Ingresa email y contraseña (ej: admin@alaburguer.com / password123)
4. Copia el `User UID` generado
5. Ve a Table Editor → `admins`
6. Click en "Insert row" y completa:
   - `auth_user_id`: pega el User UID
   - `name`: Tu nombre
   - `email`: admin@alaburguer.com
7. Click en "Save"

### 5️⃣ ¡Listo! 🎉

Abre tu navegador en `http://localhost:5173`

Inicia sesión con:
- Email: admin@alaburguer.com
- Contraseña: password123

## 📱 Crear un Repartidor

1. En el panel admin, ve a "Repartidores"
2. Click en "+ Nuevo Repartidor"
3. Completa:
   - Nombre: Juan Pérez
   - Teléfono: +54911xxxxxxx
   - Email: juan@alaburguer.com
   - Contraseña: password123
4. Click en "Guardar"

Ahora el repartidor puede iniciar sesión en `http://localhost:5173` con esas credenciales.

## 🍔 Crear un Producto

1. En el panel admin, ve a "Productos"
2. Click en "+ Nuevo Producto"
3. Completa:
   - Nombre: Hamburguesa Clásica
   - Descripción: Carne, lechuga, tomate, cebolla
   - Precio: 1200
   - Categoría: Hamburguesas
   - URL Imagen: (opcional)
   - Activo: ✓
4. Click en "Guardar"

## 📦 Recibir un Pedido (Simulación)

Puedes simular un pedido desde n8n o usando curl:

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "test_001",
    "customer_name": "María García",
    "customer_phone": "+54911xxxxxxx",
    "customer_address": "Av. Corrientes 1234",
    "items": [
      {
        "product_id": "uuid-del-producto",
        "name": "Hamburguesa Clásica",
        "quantity": 2,
        "unit_price": 1200
      }
    ],
    "total_amount": 2400,
    "payment_method": "efectivo"
  }'
```

El pedido aparecerá automáticamente en el panel de administración.

## 🔄 Flujo Completo

1. **Pedido llega desde WhatsApp** → n8n lo envía al backend
2. **Backend crea el pedido** → Estado: "pendiente"
3. **Admin ve el pedido** → En la sección "Pedidos"
4. **Admin asigna repartidor** → Selecciona un rider del dropdown
5. **Repartidor ve el pedido** → En su panel personal
6. **Repartidor actualiza estado** → "en_proceso" → "finalizado" → "entregado"
7. **Pedido completado** → Aparece en reportes de finanzas

## 🛠️ Comandos Útiles

```bash
# Backend
cd Backend
npm run dev          # Iniciar en desarrollo
npm start            # Iniciar en producción

# Frontend
cd Frontend
npm run dev          # Iniciar en desarrollo
npm run build        # Compilar para producción
npm run preview      # Previsualizar build
```

## ❓ Problemas Comunes

**Error: Cannot connect to Supabase**
- Verifica que las URLs y keys en .env sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

**Error 401 al iniciar sesión**
- Verifica que hayas creado el usuario admin correctamente
- El auth_user_id debe coincidir con el User UID de Supabase Auth

**Los pedidos no aparecen**
- Verifica que el backend esté corriendo en el puerto 3001
- Revisa la consola del navegador para errores
- Verifica que la URL de la API sea correcta en Frontend/.env

## 📚 Próximos Pasos

1. Crea más productos en el menú
2. Crea más repartidores
3. Configura n8n para recibir pedidos de WhatsApp
4. Personaliza los colores y estilos en los componentes
5. Agrega más funcionalidades según tus necesidades

---

**¿Necesitas ayuda?** Revisa `INSTRUCCIONES.md` para más detalles.

