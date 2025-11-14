-- ============================================
-- Script para diagnosticar y corregir productos sin restaurant_id
-- ============================================

-- 1. Verificar productos sin restaurant_id
SELECT 
  COUNT(*) as productos_sin_restaurant_id,
  COUNT(*) FILTER (WHERE active = true) as productos_activos_sin_restaurant_id
FROM products
WHERE restaurant_id IS NULL;

-- 2. Ver productos sin restaurant_id (primeros 10)
SELECT 
  id,
  name,
  category,
  active,
  created_at,
  restaurant_id
FROM products
WHERE restaurant_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Ver restaurantes disponibles
SELECT 
  id,
  name,
  active
FROM restaurants
ORDER BY created_at DESC;

-- ============================================
-- OPCIONES DE CORRECCIÓN:
-- ============================================

-- OPCIÓN 1: Eliminar productos sin restaurant_id (CUIDADO: esto elimina datos)
-- DELETE FROM products WHERE restaurant_id IS NULL;

-- OPCIÓN 2: Asignar productos sin restaurant_id al primer restaurante activo
-- (Solo si estás seguro de que todos los productos pertenecen a ese restaurante)
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

  -- Asignar productos sin restaurant_id a ese restaurante
  UPDATE products
  SET restaurant_id = first_restaurant_id
  WHERE restaurant_id IS NULL;

  RAISE NOTICE 'Productos actualizados con restaurant_id: %', first_restaurant_id;
END $$;
*/

-- OPCIÓN 3: Verificar que la columna restaurant_id existe y no tiene valores por defecto incorrectos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name = 'restaurant_id';

