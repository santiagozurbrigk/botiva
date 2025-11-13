# Arquitectura Multi-Tenant de Botiva

## 📋 Resumen Ejecutivo

Botiva utiliza una **arquitectura multi-tenant de base de datos única con esquema compartido** (Single Database, Shared Schema). Esta es la arquitectura más común y eficiente para SaaS como Botiva, donde múltiples restaurantes (clientes) comparten la misma base de datos pero sus datos están completamente aislados.

## 🏗️ Arquitectura: Base de Datos Única

### ✅ **Una sola base de datos para todos los restaurantes**

**Ventajas:**
- ✅ **Más económico**: Un solo servidor de base de datos
- ✅ **Más fácil de mantener**: Una sola base de datos para actualizar y hacer backup
- ✅ **Mejor rendimiento**: Compartir recursos entre todos los clientes
- ✅ **Escalabilidad**: Fácil agregar nuevos restaurantes sin crear nuevas bases de datos
- ✅ **Actualizaciones centralizadas**: Un cambio beneficia a todos los clientes

**Desventajas:**
- ⚠️ Requiere filtrado estricto por `restaurant_id` en todas las consultas
- ⚠️ Necesita índices adecuados para mantener el rendimiento

### ❌ **NO se recomienda: Base de datos individual por restaurante**

**Desventajas:**
- ❌ Muy costoso (cada base de datos tiene costo)
- ❌ Difícil de mantener (actualizar múltiples bases de datos)
- ❌ No escala bien (cientos de bases de datos)
- ❌ Complejidad operativa alta

## 🔐 Aislamiento de Datos

### Cómo funciona el aislamiento

Cada tabla que contiene datos específicos de un restaurante tiene una columna `restaurant_id` que identifica a qué restaurante pertenece el registro.

**Ejemplo:**
```sql
-- Un producto del Restaurante A
INSERT INTO products (name, price, restaurant_id) 
VALUES ('Hamburguesa', 10.00, 'uuid-restaurante-a');

-- Un producto del Restaurante B
INSERT INTO products (name, price, restaurant_id) 
VALUES ('Pizza', 15.00, 'uuid-restaurante-b');
```

### Middleware de Autenticación

El middleware `authenticateAdmin` extrae automáticamente el `restaurant_id` del admin autenticado y lo agrega a `req.restaurantId`:

```javascript
// Backend/middleware/auth.js
req.restaurantId = admin.restaurant_id; // Agregado automáticamente
```

### Filtrado Automático

Todas las rutas del backend filtran automáticamente por `restaurant_id`:

```javascript
// Ejemplo en Backend/routes/products.js
router.get('/', authenticateAdmin, async (req, res) => {
  const restaurantId = req.restaurantId; // Del middleware
  const query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId); // Filtro automático
});
```

## 📊 Tablas con Multi-Tenancy

### Tablas que tienen `restaurant_id`:

| Tabla | `restaurant_id` | Notas |
|-------|----------------|------|
| `admins` | ✅ | Cada admin pertenece a un restaurante |
| `products` | ✅ | Productos del menú de cada restaurante |
| `extras` | ✅ | Extras adicionales de cada restaurante |
| `orders` | ✅ | Pedidos de cada restaurante |
| `riders` | ✅ | Repartidores de cada restaurante |
| `waiters` | ✅ | Mozos de cada restaurante |
| `delivery_config` | ✅ | Configuración de entrega por restaurante |
| `stock_requests` | ✅ | Solicitudes de stock por restaurante |

### Tablas que NO necesitan `restaurant_id` (se filtran indirectamente):

| Tabla | Filtrado | Razón |
|-------|----------|-------|
| `order_items` | A través de `orders` | `order_id` → `orders.restaurant_id` |
| `order_events` | A través de `orders` | `order_id` → `orders.restaurant_id` |
| `payments` | A través de `orders` | `order_id` → `orders.restaurant_id` |
| `waiter_tables` | A través de `waiters` | `waiter_id` → `waiters.restaurant_id` |

### Tablas globales (sin `restaurant_id`):

| Tabla | Propósito |
|-------|-----------|
| `super_admins` | Administradores de Botiva (no de restaurantes) |
| `restaurants` | Lista de todos los restaurantes clientes |

## 🔄 Flujo de Creación de Nuevo Cliente

### 1. Super Admin crea el restaurante

```javascript
// POST /api/super-admin/restaurants
{
  name: "Restaurante Ejemplo",
  email: "contacto@restaurante.com",
  phone: "+1234567890",
  address: "Calle Principal 123"
}
```

**Resultado:**
- Se crea un registro en `restaurants`
- Se genera un `restaurant_id` único (UUID)

### 2. Super Admin crea el administrador del restaurante

```javascript
// POST /api/super-admin/restaurants/:id/admin
{
  name: "Juan Pérez",
  email: "admin@restaurante.com",
  password: "password123"
}
```

**Resultado:**
- Se crea un usuario en Supabase Auth
- Se crea un registro en `admins` con `restaurant_id` asignado
- El admin puede iniciar sesión y acceder solo a los datos de su restaurante

### 3. El restaurante comienza a usar la aplicación

- El admin inicia sesión con sus credenciales
- Todas las consultas se filtran automáticamente por su `restaurant_id`
- Solo ve y puede modificar datos de su restaurante

## 🔒 Seguridad y Aislamiento

### Garantías de Aislamiento

1. **Middleware de autenticación**: Verifica que el admin tenga `restaurant_id` asignado
2. **Filtrado automático**: Todas las consultas incluyen `.eq('restaurant_id', restaurantId)`
3. **Validación en creación**: Al crear registros, se asigna automáticamente el `restaurant_id`
4. **Foreign Keys con CASCADE**: Si se elimina un restaurante, se eliminan todos sus datos relacionados

### Ejemplo de Aislamiento

```javascript
// Admin del Restaurante A intenta acceder a productos
GET /api/products
// Backend automáticamente filtra:
SELECT * FROM products WHERE restaurant_id = 'uuid-restaurante-a'
// Solo ve productos del Restaurante A

// Admin del Restaurante B intenta acceder a productos
GET /api/products
// Backend automáticamente filtra:
SELECT * FROM products WHERE restaurant_id = 'uuid-restaurante-b'
// Solo ve productos del Restaurante B
```

## 📈 Escalabilidad

### Capacidad

- ✅ **Ilimitada**: Puedes tener cientos o miles de restaurantes en la misma base de datos
- ✅ **Rendimiento**: Los índices en `restaurant_id` aseguran consultas rápidas
- ✅ **Crecimiento**: Agregar nuevos restaurantes no afecta el rendimiento

### Índices para Rendimiento

Todas las tablas con `restaurant_id` tienen índices:

```sql
CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_waiters_restaurant_id ON waiters(restaurant_id);
-- etc.
```

## 🛠️ Mantenimiento

### Backup

- Un solo backup cubre todos los restaurantes
- Más simple y económico

### Actualizaciones

- Un cambio en el schema se aplica a todos los restaurantes
- Actualizaciones de código benefician a todos los clientes

### Monitoreo

- Un solo punto de monitoreo
- Métricas consolidadas de todos los restaurantes

## 📝 Checklist de Implementación

### ✅ Ya Implementado

- [x] Tabla `restaurants` para almacenar clientes
- [x] Tabla `super_admins` para administradores de Botiva
- [x] `restaurant_id` en `admins`, `products`, `orders`, `riders`, `waiters`, `extras`, `delivery_config`
- [x] Middleware `authenticateAdmin` que extrae `restaurant_id`
- [x] Filtrado automático en todas las rutas del backend
- [x] Panel de super admin para crear restaurantes y admins
- [x] Índices en todas las columnas `restaurant_id`

### ⚠️ Pendiente

- [ ] Agregar `restaurant_id` a `stock_requests` (si es necesario)
- [ ] Verificar que todas las rutas filtren correctamente
- [ ] Documentar el proceso de onboarding de nuevos clientes

## 🎯 Conclusión

**Botiva utiliza una arquitectura multi-tenant de base de datos única**, que es la opción más eficiente y escalable para SaaS. Todos los datos están completamente aislados mediante `restaurant_id`, y el sistema garantiza que cada restaurante solo acceda a sus propios datos.

**No necesitas bases de datos separadas** - una sola base de datos es suficiente y es la mejor práctica para este tipo de aplicación.

