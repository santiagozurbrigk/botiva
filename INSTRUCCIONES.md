# 🍔 Ala Burguer - Sistema de Gestión de Restaurante

Sistema completo de gestión para restaurantes con integración de WhatsApp vía n8n, panel de administración y panel de repartidores.

## 📋 Características

- ✅ Autenticación con Supabase Auth (admins y repartidores)
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de pedidos con estados
- ✅ Asignación de repartidores a pedidos
- ✅ Panel de administración responsive
- ✅ Panel minimalista para repartidores
- ✅ Integración con n8n para recibir pedidos de WhatsApp
- ✅ Sistema de finanzas y reportes
- ✅ Row Level Security (RLS) en Supabase

## 🚀 Instalación

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** en tu dashboard
3. Copia el contenido de `Backend/supabase-schema.sql`
4. Pégalo y ejecuta el script para crear todas las tablas y políticas

### 2. Configurar Backend

```bash
cd Backend
npm install
```

Crea un archivo `.env` en la carpeta `Backend/` con:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key
PORT=3001
NODE_ENV=development
```

Para obtener las claves:
- Ve a tu proyecto en Supabase
- Settings → API
- Copia `URL` y las claves

### 3. Configurar Frontend

```bash
cd Frontend
npm install
```

Crea un archivo `.env` en la carpeta `Frontend/` con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=http://localhost:3001
```

### 4. Ejecutar el Sistema

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

## 👤 Crear Usuario Administrador

Para crear el primer administrador:

1. Ve a Supabase Dashboard
2. Authentication → Users → Add user
3. Crea un usuario con email y contraseña
4. Copia el `user_id` generado
5. Ve a Table Editor → `admins`
6. Crea un registro:
   - `auth_user_id`: pega el user_id
   - `name`: tu nombre
   - `email`: el mismo email del usuario

## 🛠️ Uso del Sistema

### Panel de Administración

Accede a: `http://localhost:5173/admin`

**Funcionalidades:**
- **Dashboard**: Resumen de ventas y estadísticas
- **Pedidos**: Ver, asignar repartidores y cambiar estados
- **Productos**: Crear, editar y eliminar productos del menú
- **Repartidores**: Gestionar repartidores del servicio

### Panel de Repartidores

Accede a: `http://localhost:5173/rider`

**Funcionalidades:**
- Ver pedidos asignados
- Actualizar estado de pedidos
- Ver detalles de cliente y dirección

## 🔌 Integración con n8n

Para recibir pedidos desde WhatsApp:

1. Configura un webhook en n8n
2. Envía una petición POST a: `http://localhost:3001/api/orders`

**Ejemplo de payload:**
```json
{
  "external_id": "wh_12345",
  "customer_name": "Juan Perez",
  "customer_phone": "+54911xxxxxxx",
  "customer_address": "Calle Falsa 123",
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
}
```

## 📊 Estados de Pedidos

- `pendiente`: Pedido recibido, esperando procesamiento
- `en_proceso`: Pedido en preparación
- `finalizado`: Pedido listo para entrega
- `entregado`: Pedido entregado al cliente

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Admins pueden acceder a todo
- Riders solo ven pedidos asignados
- Endpoint de creación de pedidos es público (para n8n)
- Autenticación con JWT tokens

## 📱 Diseño

- Diseño minimalista y limpio
- Tema claro (según preferencias del usuario)
- Responsive (mobile-first)
- Colores suaves y profesionales
- Interfaz intuitiva

## 🗂️ Estructura del Proyecto

```
Ala-burguer/
├── Backend/
│   ├── routes/          # Endpoints de la API
│   ├── middleware/      # Middleware de autenticación
│   ├── server.js        # Servidor principal
│   └── supabase-schema.sql  # Schema de base de datos
├── Frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── contexts/    # Contextos de React
│   │   ├── lib/         # Utilidades y config
│   │   ├── pages/       # Páginas de la app
│   │   └── App.jsx      # Componente principal
│   └── package.json
└── INSTRUCCIONES.md     # Este archivo
```

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error 401 (No autorizado)
- Verifica que hayas iniciado sesión
- Revisa que el token esté siendo enviado en las peticiones

### Los pedidos no se crean desde n8n
- Verifica que el endpoint sea correcto
- Revisa que el formato del JSON sea válido
- Verifica que el `external_id` sea único

## 📝 Notas Adicionales

- El sistema usa Supabase Realtime para actualizaciones en tiempo real
- Los pedidos se pueden filtrar por estado
- Los repartidores solo pueden ver y actualizar sus pedidos asignados
- El sistema previene pedidos duplicados usando `external_id`

## 🎨 Personalización

Para cambiar colores o estilos:
- Edita las clases de Tailwind en los componentes
- Los colores principales están en `bg-indigo-600`, `text-indigo-600`, etc.
- Puedes cambiarlos por otros colores de Tailwind

## 📞 Soporte

Si tienes problemas o preguntas, revisa:
1. Los archivos README.md en Backend/ y Frontend/
2. La documentación de Supabase
3. Los logs de consola del navegador y del servidor

---

**Desarrollado con ❤️ para Ala Burguer**

