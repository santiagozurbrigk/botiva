-- ============================================
-- CONFIGURACIÓN DE SUPABASE REALTIME
-- ============================================
-- IMPORTANTE: Este script debe ejecutarse en el SQL Editor de Supabase
-- NO en la sección "Replication" (esa es para replicar datos a otros destinos)

-- Verificar que la publicación supabase_realtime existe
-- Si no existe, Supabase la crea automáticamente, pero podemos verificarlo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE NOTICE 'La publicación supabase_realtime no existe. Esto puede indicar que Realtime no está habilitado en tu proyecto.';
  END IF;
END $$;

-- Habilitar Realtime para la tabla orders
-- Esto agrega la tabla a la publicación de Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Configurar REPLICA IDENTITY para que Realtime pueda enviar los datos completos en las actualizaciones
-- Esto es necesario para que Realtime pueda enviar los valores antiguos y nuevos en las actualizaciones
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Habilitar Realtime para order_items (opcional, si quieres actualizaciones en tiempo real de items)
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER TABLE order_items REPLICA IDENTITY FULL;

-- Habilitar Realtime para order_events (opcional, para actualizaciones de eventos)
ALTER PUBLICATION supabase_realtime ADD TABLE order_events;
ALTER TABLE order_events REPLICA IDENTITY FULL;

-- Verificar que las tablas fueron agregadas correctamente
SELECT 
  tablename,
  'Habilitada para Realtime' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('orders', 'order_items', 'order_events');

-- Nota: Las políticas RLS existentes ya están configuradas correctamente
-- y Realtime respetará estas políticas automáticamente

