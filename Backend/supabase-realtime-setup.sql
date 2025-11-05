-- ============================================
-- CONFIGURACIÓN DE SUPABASE REALTIME
-- ============================================

-- Habilitar Realtime para la tabla orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Configurar REPLICA IDENTITY para que Realtime pueda enviar los datos completos en las actualizaciones
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Habilitar Realtime para order_items (opcional, si quieres actualizaciones en tiempo real de items)
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Habilitar Realtime para order_events (opcional, para actualizaciones de eventos)
ALTER PUBLICATION supabase_realtime ADD TABLE order_events;

-- Nota: Las políticas RLS existentes ya están configuradas correctamente
-- y Realtime respetará estas políticas automáticamente

