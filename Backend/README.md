# 🍔 Ala-Burguer Backend

Backend API para el sistema de pedidos de Ala-Burguer desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

- **API RESTful** completa para gestión de pedidos
- **Autenticación JWT** para panel de administración
- **Subida de imágenes** para productos y promociones
- **Base de datos MongoDB** con Mongoose
- **Validación de datos** y manejo de errores
- **CORS configurado** para comunicación con frontend

## 📋 Requisitos

- Node.js (v16 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar archivo de configuración
cp config.env .env

# Editar las variables según tu configuración
```

3. **Configurar MongoDB:**
   - **Local**: Instalar MongoDB y ejecutar en puerto 27017
   - **Cloud**: Usar MongoDB Atlas y actualizar `MONGODB_URI`

4. **Inicializar datos de ejemplo:**
```bash
npm run seed
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor se ejecutará en `http://localhost:5000`

## 📚 API Endpoints

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar admin (solo super admin)
- `GET /api/auth/me` - Obtener info del admin actual
- `POST /api/auth/logout` - Cerrar sesión

### 📂 Categorías
- `GET /api/categories` - Obtener categorías (público)
- `GET /api/categories/:id` - Obtener categoría por ID (público)
- `POST /api/categories` - Crear categoría (admin)
- `PUT /api/categories/:id` - Actualizar categoría (admin)
- `DELETE /api/categories/:id` - Eliminar categoría (admin)
- `PATCH /api/categories/:id/toggle` - Activar/desactivar (admin)

### 🍔 Productos
- `GET /api/products` - Obtener productos (público)
- `GET /api/products/category/:categoryId` - Productos por categoría (público)
- `GET /api/products/:id` - Obtener producto por ID (público)
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)
- `PATCH /api/products/:id/toggle` - Activar/desactivar (admin)

### 📦 Pedidos
- `GET /api/orders` - Obtener pedidos (admin)
- `GET /api/orders/:id` - Obtener pedido por ID (admin)
- `POST /api/orders` - Crear pedido (público)
- `PUT /api/orders/:id/status` - Actualizar estado (admin)
- `PUT /api/orders/:id` - Actualizar pedido completo (admin)
- `DELETE /api/orders/:id` - Eliminar pedido (admin)
- `GET /api/orders/stats/summary` - Estadísticas (admin)

### 🎉 Promociones
- `GET /api/promotions` - Obtener promociones (público)
- `GET /api/promotions/:id` - Obtener promoción por ID (público)
- `GET /api/promotions/active/current` - Promoción activa actual (público)
- `POST /api/promotions` - Crear promoción (admin)
- `PUT /api/promotions/:id` - Actualizar promoción (admin)
- `DELETE /api/promotions/:id` - Eliminar promoción (admin)
- `PATCH /api/promotions/:id/toggle` - Activar/desactivar (admin)

## 🔧 Scripts Disponibles

```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm run seed       # Inicializar datos de ejemplo
```

## 📁 Estructura del Proyecto

```
Backend/
├── models/           # Modelos de MongoDB
│   ├── Admin.js
│   ├── Category.js
│   ├── Product.js
│   ├── Order.js
│   └── Promotion.js
├── routes/           # Rutas de la API
│   ├── auth.js
│   ├── categories.js
│   ├── products.js
│   ├── orders.js
│   └── promotions.js
├── middleware/       # Middleware personalizado
│   ├── auth.js
│   └── upload.js
├── scripts/          # Scripts de utilidad
│   └── seedData.js
├── uploads/          # Archivos subidos
├── server.js         # Archivo principal
├── config.env        # Variables de entorno
└── package.json
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. **Login**: `POST /api/auth/login` con email y password
2. **Token**: Se devuelve un token JWT válido por 24 horas
3. **Uso**: Incluir token en header: `Authorization: Bearer <token>`

### Usuario por defecto:
- **Email**: `admin@ala-burguer.com`
- **Password**: `admin123`
- **Rol**: `super_admin`

## 📤 Subida de Archivos

- **Endpoint**: `/uploads/` (servido estáticamente)
- **Tipos permitidos**: Imágenes (JPG, PNG, GIF, etc.)
- **Tamaño máximo**: 5MB
- **Ubicación**: `./uploads/`

## 🌐 CORS

Configurado para permitir requests desde:
- **Desarrollo**: `http://localhost:5173` (Vite)
- **Producción**: Configurar `FRONTEND_URL` en variables de entorno

## 🗄️ Base de Datos

### Colecciones:
- **admins**: Usuarios del panel de administración
- **categories**: Categorías de productos
- **products**: Productos del menú
- **orders**: Pedidos de clientes
- **promotions**: Promociones y flyers

### Índices:
- Categorías: `name`, `isActive`
- Productos: `category`, `isActive`, `name` (texto)
- Pedidos: `orderNumber`, `status`, `customer.phone`
- Promociones: `isActive`, `validFrom`, `validUntil`

## 🚨 Manejo de Errores

- **400**: Datos inválidos o faltantes
- **401**: No autenticado o token inválido
- **403**: Acceso denegado (permisos insuficientes)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## 🔄 Estados de Pedidos

- **pending**: Pendiente (recién creado)
- **preparing**: En preparación
- **ready**: Listo para entrega
- **delivered**: Entregado
- **cancelled**: Cancelado

## 📱 Integración con Frontend

El backend está diseñado para funcionar con el frontend React en:
- **URL**: `http://localhost:5173`
- **CORS**: Configurado automáticamente
- **API Base**: `http://localhost:5000/api`

## 🚀 Despliegue

### Variables de entorno para producción:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ala-burguer
JWT_SECRET=tu_jwt_secret_super_seguro
FRONTEND_URL=https://tu-dominio.com
```

### Recomendaciones:
- Usar MongoDB Atlas para base de datos
- Configurar HTTPS en producción
- Usar variables de entorno seguras
- Implementar logs y monitoreo
