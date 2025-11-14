-- ============================================
-- Script SQL para diagnosticar el problema de productos
-- Ejecuta esto directamente en Supabase SQL Editor
-- ============================================

-- 1. Verificar si la columna restaurant_id existe
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name = 'restaurant_id';

-- 2. Si la columna NO existe, ejecuta esto primero:
-- ALTER TABLE products ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
-- CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id);

-- 3. Contar productos sin restaurant_id
SELECT 
  COUNT(*) as total_productos,
  COUNT(*) FILTER (WHERE restaurant_id IS NULL) as productos_sin_restaurant_id,
  COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL) as productos_con_restaurant_id
FROM products;

-- 4. Ver productos sin restaurant_id (estos aparecen en TODOS los restaurantes)
SELECT 
  id,
  name,
  category,
  price,
  active,
  created_at,
  restaurant_id
FROM products
WHERE restaurant_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- 5. Ver productos agrupados por restaurant_id
SELECT 
  restaurant_id,
  COUNT(*) as cantidad_productos,
  COUNT(*) FILTER (WHERE active = true) as productos_activos
FROM products
WHERE restaurant_id IS NOT NULL
GROUP BY restaurant_id
ORDER BY cantidad_productos DESC;

-- 6. Ver restaurantes existentes
SELECT 
  id,
  name,
  email,
  active,
  created_at
FROM restaurants
ORDER BY created_at DESC;

-- 7. Ver admins y sus restaurant_id
SELECT 
  a.id,
  a.name,
  a.email,
  a.restaurant_id,
  r.name as restaurant_name,
  r.active as restaurant_active
FROM admins a
LEFT JOIN restaurants r ON a.restaurant_id = r.id
ORDER BY a.created_at DESC;

-- ============================================
-- SOLUCIÓN: Si hay productos sin restaurant_id
-- ============================================

-- OPCIÓN 1: Eliminar productos sin restaurant_id (CUIDADO: elimina datos)
-- DELETE FROM products WHERE restaurant_id IS NULL;

-- OPCIÓN 2: Asignar productos sin restaurant_id al primer restaurante activo
-- (Solo si estás seguro de que todos pertenecen a ese restaurante)
/*
DO $$
DECLARE
  first_restaurant_id UUID;
BEGIN
  -- Obtener el primer restaurante activo
  SELECT id INTO first_restaurant_id
  FROM restaurants
  WHERE active = true
  ORDER BY created_at ASC
  LIMIT 1;

  IF first_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'No hay restaurantes activos';
  END IF;

  -- Asignar productos sin restaurant_id
  UPDATE products
  SET restaurant_id = first_restaurant_id
  WHERE restaurant_id IS NULL;

  RAISE NOTICE 'Productos actualizados con restaurant_id: %', first_restaurant_id;
END $$;
*/

