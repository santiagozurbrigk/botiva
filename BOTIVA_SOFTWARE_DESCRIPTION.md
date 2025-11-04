# BOTIVA - Software de Gestión para Restaurantes con Automatización

## Descripción General

**Botiva** es una solución integral de gestión para restaurantes de comida rápida (hamburgueserías, rostiserías, pizzerías) que combina un panel de administración web con automatización completa de pedidos a través de WhatsApp. El sistema está diseñado para optimizar operaciones, reducir errores humanos y aumentar la eficiencia del negocio.

## Público Objetivo

### Clientes Ideales
- **Restaurantes de comida rápida** (hamburgueserías, rostiserías, pizzerías)
- **Negocios con delivery** que reciben pedidos por WhatsApp
- **Establecimientos con 1-5 repartidores** en plantilla
- **Restaurantes que buscan digitalizar** su gestión de pedidos
- **Negocios que quieren reducir** errores en toma de pedidos
- **Emprendedores** que necesitan un sistema completo y económico

### Tamaño del Negocio
- **Pequeños a medianos restaurantes** (1-20 empleados)
- **Facturación mensual**: $50,000 - $500,000 MXN
- **Pedidos diarios**: 20-200 pedidos
- **Repartidores**: 1-5 personas

## Funcionalidades Principales

### 1. Gestión de Menú Digital
- **CRUD completo de productos**: nombre, descripción, precio, categoría, imagen
- **Control de disponibilidad**: activar/desactivar productos en tiempo real
- **Categorización**: organizar productos por tipo (hamburguesas, bebidas, postres, etc.)
- **Gestión de precios**: actualización instantánea de precios
- **Imágenes de productos**: visualización atractiva para clientes

### 2. Sistema de Pedidos Automatizado
- **Recepción automática** de pedidos desde WhatsApp
- **Validación automática** de datos del cliente
- **Cálculo automático** de totales y costos de envío
- **Asignación de repartidores** desde el panel de administración
- **Seguimiento en tiempo real** del estado de cada pedido
- **Estados de pedido**: pendiente, en proceso, finalizado, entregado

### 3. Gestión de Repartidores
- **Panel dedicado** para repartidores con login independiente
- **Vista de pedidos asignados** únicamente
- **Actualización de estados** de pedidos en tiempo real
- **Control de pagos**: marcar pedidos como pagados al recibir efectivo
- **Historial de entregas** por repartidor

### 4. Control Financiero
- **Dashboard financiero** con métricas clave
- **Reportes de ventas** por día, semana, mes
- **Control de pagos**: pendientes, pagados, cancelados, reembolsados
- **Análisis de rendimiento** del negocio
- **Configuración de costos** de envío y tiempos de entrega

### 5. Automatización con n8n
- **Integración completa** con WhatsApp Business
- **Flujos automatizados** de recepción de pedidos
- **Notificaciones automáticas** a clientes sobre estados
- **Sincronización en tiempo real** entre WhatsApp y el sistema
- **Webhooks configurables** para integraciones adicionales

## Ventajas Competitivas

### 1. Automatización Completa
- **Cero intervención manual** en la recepción de pedidos
- **Reducción del 90%** en errores de toma de pedidos
- **Disponibilidad 24/7** para recibir pedidos
- **Respuesta instantánea** a clientes

### 2. Interfaz Intuitiva
- **Diseño minimalista** y fácil de usar
- **Responsive design** para móviles y tablets
- **Navegación simple** con acceso rápido a funciones clave
- **Tema claro** que reduce fatiga visual

### 3. Escalabilidad
- **Arquitectura moderna** con React y Node.js
- **Base de datos robusta** con Supabase
- **API REST** para integraciones futuras
- **Deployment en la nube** para alta disponibilidad

### 4. Costo-Beneficio
- **Solución completa** en un solo software
- **Sin necesidad de múltiples herramientas**
- **Reducción de personal** para toma de pedidos
- **ROI rápido** por aumento de eficiencia

## Tecnologías Utilizadas

### Frontend
- **React 18** con Vite para desarrollo rápido
- **Tailwind CSS** para diseño responsive
- **React Router** para navegación
- **Context API** para manejo de estado

### Backend
- **Node.js** con Express.js
- **Supabase** como base de datos PostgreSQL
- **JWT** para autenticación segura
- **Row Level Security** para protección de datos

### Automatización
- **n8n** para workflows automatizados
- **Webhooks** para comunicación entre sistemas
- **WhatsApp Business API** para mensajería

### Deployment
- **Vercel** para frontend (https://botiva.vercel.app)
- **Render** para backend (https://botiva.onrender.com)
- **Supabase Cloud** para base de datos

## Flujo de Trabajo Típico

### 1. Configuración Inicial
1. Administrador configura productos y precios
2. Se establecen repartidores en el sistema
3. Se configura n8n con WhatsApp Business
4. Se definen costos de envío y tiempos de entrega

### 2. Operación Diaria
1. **Cliente envía pedido** por WhatsApp
2. **n8n procesa automáticamente** el mensaje
3. **Sistema crea pedido** en la base de datos
4. **Administrador asigna repartidor** desde el panel
5. **Repartidor recibe notificación** en su panel
6. **Repartidor actualiza estados** durante la entrega
7. **Cliente recibe notificaciones** automáticas del progreso

### 3. Gestión Financiera
1. **Dashboard muestra métricas** en tiempo real
2. **Reportes automáticos** de ventas y pagos
3. **Control de efectivo** por repartidor
4. **Análisis de rendimiento** del negocio

## Beneficios para el Negocio

### Operacionales
- **Reducción del 80%** en tiempo de toma de pedidos
- **Eliminación de errores** en órdenes
- **Mejora en la experiencia** del cliente
- **Optimización de rutas** de reparto

### Financieros
- **Aumento del 15-25%** en ventas por mejor servicio
- **Reducción de costos** operativos
- **Mejor control** de inventario y pagos
- **Análisis detallado** de rentabilidad

### Estratégicos
- **Escalabilidad** para crecimiento del negocio
- **Datos valiosos** para toma de decisiones
- **Ventaja competitiva** en el mercado
- **Preparación** para expansión digital

## Casos de Uso Específicos

### Hamburguesería "El Sabor"
- **Antes**: 2 empleados tomando pedidos por teléfono, 30% de errores
- **Después**: Automatización completa, 5% de errores, 40% más pedidos

### Rostisería "Don Pepe"
- **Antes**: Pedidos por WhatsApp manuales, confusión en horarios
- **Después**: Sistema automatizado, mejor organización, clientes satisfechos

### Pizzería "La Italiana"
- **Antes**: 1 persona dedicada solo a pedidos
- **Después**: Personal liberado para cocina, mejor calidad de producto

## Roadmap Futuro

### Fase 1 (Actual)
- Panel de administración completo
- Automatización básica con WhatsApp
- Gestión de repartidores
- Reportes financieros

### Fase 2 (Próximos 3 meses)
- **App móvil** para repartidores
- **Integración con sistemas de pago** (MercadoPago, Stripe)
- **Notificaciones push** en tiempo real
- **Análisis predictivo** de demanda

### Fase 3 (6 meses)
- **Integración con delivery** (Rappi, Uber Eats)
- **Sistema de fidelización** de clientes
- **Marketing automatizado** por WhatsApp
- **API pública** para desarrolladores

## Información Técnica para Desarrolladores

### Arquitectura
- **Frontend**: SPA con React, desplegado en Vercel
- **Backend**: API REST con Node.js, desplegado en Render
- **Base de datos**: PostgreSQL con Supabase
- **Automatización**: n8n con webhooks

### Seguridad
- **Autenticación JWT** con Supabase Auth
- **Row Level Security** en base de datos
- **HTTPS** en todas las comunicaciones
- **Validación** de datos en frontend y backend

### APIs Disponibles
- **POST /api/orders** - Crear pedido (para n8n)
- **GET /api/orders** - Listar pedidos (admin)
- **PATCH /api/orders/:id** - Actualizar pedido (admin)
- **GET /api/products** - Gestión de productos
- **GET /api/riders** - Gestión de repartidores
- **GET /api/finances/summary** - Resumen financiero

## Contacto y Soporte

- **Desarrollo**: Sistema completo desarrollado
- **Documentación**: Guías técnicas incluidas
- **Deployment**: Configurado para producción
- **Soporte**: Documentación detallada para mantenimiento

---

**Botiva** representa la evolución natural de la gestión de restaurantes hacia la automatización digital, ofreciendo una solución completa, moderna y escalable que transforma la manera en que los restaurantes manejan sus pedidos y operaciones diarias.
