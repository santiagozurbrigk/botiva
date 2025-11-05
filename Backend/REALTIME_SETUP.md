# Configuración de Supabase Realtime

## Pasos para habilitar Realtime

### 1. Ejecutar el script SQL en Supabase

Ve a tu proyecto en Supabase Dashboard:
1. Abre el **SQL Editor**
2. Copia y pega el contenido de `supabase-realtime-setup.sql`
3. Ejecuta el script

Este script:
- Habilita Realtime para la tabla `orders`
- Configura `REPLICA IDENTITY FULL` para que Realtime pueda enviar datos completos
- Habilita Realtime para `order_items` y `order_events` (opcional)

### 2. Variables de entorno en el Frontend

Asegúrate de tener estas variables en tu archivo `.env` del frontend:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Verificar que Realtime esté habilitado

**IMPORTANTE:** La sección "Replication" en Supabase Dashboard es para replicar datos a otros destinos (como BigQuery, Iceberg, etc.), NO para Realtime.

Para verificar que Realtime está habilitado:

1. Ve a **Database** → **Publications** (o ejecuta en SQL Editor):
```sql
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
```

2. Verifica que las tablas estén en la publicación:
```sql
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

3. Deberías ver `orders`, `order_items`, y `order_events` en la lista

**Alternativa:** También puedes hacer clic en el botón "3 tables" junto a `supabase_realtime` en la interfaz de Publications para ver qué tablas están incluidas.

### 4. Habilitar Realtime en el proyecto (si no está habilitado)

Si Realtime no está habilitado en tu proyecto:
1. Ve a **Project Settings** → **API**
2. Busca la sección "Realtime"
3. Asegúrate de que esté habilitado
4. En algunos planes de Supabase, Realtime puede requerir habilitación manual

## Cómo funciona

### Admin Panel (`Orders.jsx`)
- Escucha cambios en tiempo real en la tabla `orders`
- Actualiza automáticamente cuando:
  - Se crea un nuevo pedido
  - Se actualiza el estado de un pedido
  - Se asigna un repartidor
  - Se cambia el estado de pago
- Respeta los filtros de estado (pendiente, en_proceso, etc.)

### Rider Panel (`Dashboard.jsx`)
- Escucha cambios en tiempo real para pedidos asignados al rider
- Actualiza automáticamente cuando:
  - Se le asigna un nuevo pedido
  - Se actualiza el estado de un pedido asignado
  - Se cambia el estado de pago

## Beneficios

✅ **Sin recargas manuales**: Los cambios se reflejan automáticamente
✅ **Sincronización en tiempo real**: Todos los usuarios ven los mismos cambios
✅ **Mejor experiencia**: No necesitas refrescar la página
✅ **Eficiencia**: Menos llamadas a la API

## Notas importantes

- Las políticas RLS (Row Level Security) se respetan automáticamente
- Solo los usuarios autorizados verán los cambios según sus permisos
- Si Realtime no funciona, verifica:
  1. Que el script SQL se haya ejecutado correctamente
  2. Que las variables de entorno estén configuradas
  3. Que Realtime esté habilitado en tu proyecto de Supabase (puede requerir un plan pago)

