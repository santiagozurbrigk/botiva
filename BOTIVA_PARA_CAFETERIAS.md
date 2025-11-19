# BOTIVA - Funcionalidades del Software

## Descripción General

**Botiva** es un software de gestión integral para cafeterías y restaurantes que permite administrar pedidos, productos, repartidores, inventario y finanzas desde un panel web centralizado. El sistema incluye automatización de recepción de pedidos por WhatsApp mediante integración con n8n.

---

## Módulos y Funcionalidades

### 1. Gestión de Productos

**Funcionalidades principales:**

- **CRUD completo de productos**: Crear, leer, actualizar y eliminar productos del menú
- **Campos por producto**:
  - Nombre del producto
  - Descripción
  - Precio
  - Categoría (bebidas calientes, pastelería, snacks, postres, bebidas frías, etc.)
  - Imagen del producto
  - Estado (activo/inactivo)
  - Stock disponible (opcional)

- **Gestión de categorías**: Organizar productos por tipo
- **Control de disponibilidad**: Activar o desactivar productos en tiempo real
- **Actualización de precios**: Modificar precios de forma instantánea
- **Gestión de imágenes**: Subir y actualizar fotos de productos

### 2. Sistema de Pedidos

**Recepción de pedidos:**

- **Automatización con WhatsApp**: Los pedidos llegan automáticamente desde WhatsApp mediante integración con n8n
- **Procesamiento automático**: El sistema identifica productos, cantidades y calcula totales
- **Validación de datos**: Verificación automática de información del cliente

**Gestión de pedidos:**

- **Vista de todos los pedidos**: Listado completo con filtros por estado, fecha, repartidor
- **Estados de pedido**:
  - Pendiente
  - En proceso
  - Listo
  - En camino
  - Entregado
  - Cancelado

- **Información del pedido**:
  - Datos del cliente (nombre, teléfono, dirección)
  - Lista de productos con cantidades
  - Monto total
  - Método de pago
  - Estado de pago (pendiente, pagado, cancelado, reembolsado)
  - Repartidor asignado
  - Fecha y hora de creación
  - Tiempo estimado de entrega

- **Asignación de repartidores**: Asignar pedidos a repartidores disponibles
- **Edición de pedidos**: Modificar productos, cantidades y totales antes de preparar
- **Cancelación de pedidos**: Cancelar pedidos con registro de motivo

### 3. Panel de Repartidores

**Acceso independiente para cada repartidor:**

- **Login personalizado**: Cada repartidor tiene credenciales propias
- **Vista de pedidos asignados**: Solo ve los pedidos que le fueron asignados
- **Información del pedido**:
  - Dirección de entrega
  - Teléfono del cliente
  - Lista de productos
  - Monto total a cobrar
  - Método de pago esperado

- **Actualización de estados**:
  - Marcar cuando sale a entregar
  - Marcar cuando entrega el pedido
  - Registrar si el cliente pagó

- **Control de pagos**:
  - Registrar método de pago recibido (efectivo, tarjeta, transferencia)
  - Marcar pedido como pagado
  - Registrar problemas de pago

- **Historial personal**: Ver entregas realizadas (día, semana, mes)

### 4. Gestión de Repartidores

**Administración del equipo de delivery:**

- **CRUD de repartidores**: Agregar, editar, eliminar repartidores
- **Datos del repartidor**:
  - Nombre completo
  - Teléfono de contacto
  - Estado (activo/inactivo)
  - Credenciales de acceso

- **Asignación de pedidos**: Asignar pedidos desde el panel de administración
- **Visualización de pedidos activos**: Ver qué pedidos tiene asignados cada repartidor
- **Rendimiento**: Ver estadísticas de entregas por repartidor

### 5. Dashboard Financiero

**Métricas y estadísticas:**

- **Ventas del día**: Total vendido en el día actual
- **Ventas semanales**: Total vendido en la semana
- **Ventas mensuales**: Total vendido en el mes
- **Gráficos de ventas**: Visualización de tendencias de ventas
- **Control de pagos**:
  - Pedidos pendientes de pago
  - Pedidos pagados
  - Pedidos cancelados
  - Montos por estado de pago

- **Estadísticas de repartidores**:
  - Pedidos entregados por repartidor
  - Montos cobrados por repartidor
  - Eficiencia de cada repartidor

- **Productos más vendidos**: Ranking de productos por cantidad vendida
- **Análisis de horarios**: Identificar horarios pico de pedidos

### 6. Gestión de Stock e Inventario

**Control de inventario:**

- **Stock por producto**: Cantidad disponible de cada producto
- **Alertas de bajo stock**: Notificaciones cuando un producto se está agotando
- **Registro de movimientos**: Historial de entradas y salidas de inventario
- **Reportes de consumo**: Análisis de qué productos se consumen más
- **Actualización manual**: Modificar stock disponible manualmente

### 7. Configuración de Delivery

**Personalización del servicio:**

- **Costos de envío**: Definir precios de envío por zona, distancia o monto mínimo
- **Tiempos de entrega**: Establecer tiempos estimados por zona
- **Zonas de cobertura**: Definir áreas donde se realiza entrega
- **Horarios de servicio**: Configurar horarios en los que se reciben pedidos
- **Métodos de pago aceptados**: Configurar qué métodos de pago se aceptan

### 8. Panel de Administración

**Funcionalidades administrativas:**

- **Gestión de usuarios**: Crear y administrar cuentas de administradores
- **Configuración general**: Ajustes del sistema
- **Historial de eventos**: Registro de acciones realizadas en el sistema
- **Exportación de datos**: Exportar reportes y datos en diferentes formatos

---

## Flujo de Trabajo

### Recepción de Pedido

1. Cliente envía mensaje por WhatsApp con su pedido
2. n8n procesa el mensaje y extrae información (productos, cantidades, datos del cliente)
3. El sistema crea automáticamente el pedido en la base de datos
4. El pedido aparece en el panel de administración con estado "Pendiente"

### Procesamiento del Pedido

1. Administrador visualiza el pedido en el panel
2. Puede editar productos, cantidades o totales si es necesario
3. Asigna un repartidor al pedido
4. El pedido cambia a estado "En proceso" o "Listo"
5. El repartidor recibe notificación en su panel

### Entrega del Pedido

1. Repartidor accede a su panel y ve el pedido asignado
2. Marca el pedido como "En camino" cuando sale a entregar
3. Al llegar, marca como "Entregado"
4. Registra el método de pago recibido
5. Marca el pedido como "Pagado" si corresponde

### Seguimiento y Análisis

1. Administrador puede ver el estado de todos los pedidos en tiempo real
2. Dashboard muestra métricas y estadísticas actualizadas
3. Reportes disponibles para análisis de ventas y rendimiento

---

## Características Técnicas

### Acceso y Usabilidad

- **Interfaz web responsive**: Funciona en computadoras, tablets y celulares
- **Navegación intuitiva**: Diseño simple y fácil de usar
- **Acceso desde cualquier lugar**: Solo se requiere conexión a internet
- **Múltiples usuarios**: Soporte para varios administradores y repartidores

### Integración con WhatsApp

- **Automatización mediante n8n**: Flujos automatizados para procesar mensajes
- **Recepción 24/7**: El sistema recibe pedidos en cualquier momento
- **Procesamiento inteligente**: Identificación automática de productos y cantidades
- **Confirmaciones automáticas**: Respuestas automáticas al cliente

### Seguridad

- **Autenticación por usuario**: Cada usuario tiene credenciales propias
- **Control de acceso**: Diferentes niveles de permisos (administrador, repartidor)
- **Datos encriptados**: Información protegida
- **Respaldo automático**: Datos respaldados regularmente

---

## Módulos Adicionales (Opcionales)

### Gestión de Meseros (Para atención en local)

- Panel para meseros con login independiente
- Creación de comandas desde el panel
- Asignación de mesas
- Control de pedidos de consumo en local

### Panel de Cocina

- Vista de pedidos pendientes de preparar
- Actualización de estado de preparación
- Organización por prioridad
- Notificaciones de pedidos nuevos

### Gestión de Stock Avanzada

- Solicitudes de reposición de stock
- Control de proveedores
- Historial de compras
- Alertas automáticas de productos faltantes

---

## Requisitos del Sistema

### Para el Usuario

- Dispositivo con navegador web (Chrome, Firefox, Safari, Edge)
- Conexión a internet
- Cuenta de WhatsApp Business (para automatización)

### Para la Cafetería

- Acceso a internet estable
- Dispositivos para administradores y repartidores (computadora, tablet o celular)
- Configuración inicial de productos y repartidores en el sistema

---

*Este documento describe las funcionalidades disponibles en Botiva. Para más información sobre implementación o configuración, consultar la documentación técnica correspondiente.*
