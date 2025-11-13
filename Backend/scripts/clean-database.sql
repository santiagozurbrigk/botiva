-- ============================================
-- SCRIPT PARA VACIAR LA BASE DE DATOS
-- Mantiene solo el super admin especificado
-- ============================================

-- IMPORTANTE: 
-- 1. Reemplaza 'TU_EMAIL_SUPER_ADMIN@ejemplo.com' con el email del super admin que quieres mantener
-- 2. Este script eliminará TODOS los datos excepto el super admin especificado
-- 3. Ejecuta este script con precaución y haz un backup primero
-- 4. Después de ejecutar este script, ejecuta el script Node.js para limpiar usuarios de Auth

-- ============================================
-- PASO 1: Verificar que el super admin existe
-- ============================================
-- Descomenta y reemplaza el email del super admin que quieres mantener:
-- DO $$
-- DECLARE
--   super_admin_email VARCHAR(255) := 'TU_EMAIL_SUPER_ADMIN@ejemplo.com'; -- CAMBIAR ESTE EMAIL
--   super_admin_count INTEGER;
-- BEGIN
--   SELECT COUNT(*) INTO super_admin_count
--   FROM super_admins
--   WHERE email = super_admin_email;
--   
--   IF super_admin_count = 0 THEN
--     RAISE EXCEPTION 'Super admin con email % no encontrado. Verifica el email.', super_admin_email;
--   END IF;
--   
--   RAISE NOTICE 'Super admin encontrado: %', super_admin_email;
-- END $$;

-- ============================================
-- PASO 2: ELIMINAR DATOS EN ORDEN
-- (Respetando foreign keys con CASCADE)
-- ============================================

-- 1. Eliminar datos de tablas dependientes de orders
DELETE FROM order_items;
DELETE FROM order_events;
DELETE FROM payments;

-- 2. Eliminar todos los pedidos
DELETE FROM orders;

-- 3. Eliminar datos de tablas relacionadas con usuarios
DELETE FROM waiter_tables;
-- Eliminar todos los waiters (tanto los que tienen restaurant_id como los que no)
DELETE FROM waiters;
-- Eliminar todos los riders (tanto los que tienen restaurant_id como los que no)
DELETE FROM riders;

-- 4. Eliminar productos y extras (todos, ya que están relacionados con restaurantes)
DELETE FROM products;
DELETE FROM extras;

-- 5. Eliminar configuración de delivery (todos los registros)
DELETE FROM delivery_config;

-- 6. Eliminar stock requests
DELETE FROM stock_requests;

-- 7. Eliminar todos los admins (todos están relacionados con restaurantes)
DELETE FROM admins;

-- 8. Eliminar restaurantes
DELETE FROM restaurants;

-- 9. Eliminar otros super admins
-- NOTA: Reemplaza 'TU_EMAIL_SUPER_ADMIN@ejemplo.com' con el email del super admin que quieres mantener
DELETE FROM super_admins 
WHERE email != 'TU_EMAIL_SUPER_ADMIN@ejemplo.com'; -- CAMBIAR ESTE EMAIL

-- ============================================
-- PASO 3: Verificar resultado
-- ============================================
-- Ejecuta las siguientes consultas para verificar que todo se eliminó correctamente:

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que solo queda el super admin deseado
SELECT 
  'Super admins restantes:' as info,
  COUNT(*) as count
FROM super_admins;

-- Verificar que todas las demás tablas están vacías
SELECT 
  'orders' as tabla, COUNT(*) as count FROM orders
UNION ALL
SELECT 
  'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 
  'admins', COUNT(*) FROM admins
UNION ALL
SELECT 
  'products', COUNT(*) FROM products
UNION ALL
SELECT 
  'extras', COUNT(*) FROM extras
UNION ALL
SELECT 
  'waiters', COUNT(*) FROM waiters
UNION ALL
SELECT 
  'riders', COUNT(*) FROM riders
UNION ALL
SELECT 
  'payments', COUNT(*) FROM payments
UNION ALL
SELECT 
  'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 
  'order_events', COUNT(*) FROM order_events
UNION ALL
SELECT 
  'waiter_tables', COUNT(*) FROM waiter_tables
UNION ALL
SELECT 
  'delivery_config', COUNT(*) FROM delivery_config
UNION ALL
SELECT 
  'stock_requests', COUNT(*) FROM stock_requests;

