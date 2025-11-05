-- ============================================
-- VERIFICAR TABLAS HABILITADAS PARA REALTIME
-- ============================================

-- Ver todas las tablas en la publicación supabase_realtime
SELECT 
  tablename,
  schemaname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Verificar específicamente nuestras tablas
SELECT 
  CASE 
    WHEN tablename = 'orders' THEN '✅ orders está habilitada'
    WHEN tablename = 'order_items' THEN '✅ order_items está habilitada'
    WHEN tablename = 'order_events' THEN '✅ order_events está habilitada'
    ELSE '❌ ' || tablename || ' no es una de nuestras tablas'
  END as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('orders', 'order_items', 'order_events');

-- Verificar REPLICA IDENTITY
SELECT 
  tablename,
  CASE replicaidentity
    WHEN 'f' THEN 'FULL (correcto)'
    WHEN 'n' THEN 'NOTHING (necesita cambiarse)'
    WHEN 'd' THEN 'DEFAULT (necesita cambiarse)'
    WHEN 'i' THEN 'INDEX (puede funcionar)'
    ELSE replicaidentity
  END as replica_identity_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items', 'order_events');

