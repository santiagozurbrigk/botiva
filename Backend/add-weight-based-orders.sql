-- ============================================
-- MIGRACIÓN: Soporte para pedidos por kilo
-- ============================================

-- 1. Agregar campo sells_by_weight a restaurants
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'sells_by_weight'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN sells_by_weight BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Agregar campo price_per_kg a products (opcional, para productos que se venden por kilo)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price_per_kg'
  ) THEN
    ALTER TABLE products ADD COLUMN price_per_kg DECIMAL(10, 2);
  END IF;
END $$;

-- 3. Agregar campo weight_kg a order_items (para almacenar el peso real cuando se confirma)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE order_items ADD COLUMN weight_kg DECIMAL(10, 3);
  END IF;
END $$;

-- 4. Agregar campo pending_weight_confirmation a orders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'pending_weight_confirmation'
  ) THEN
    ALTER TABLE orders ADD COLUMN pending_weight_confirmation BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 5. Agregar campo chat_id a orders (si no existe, para poder enviar confirmación a n8n)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'chat_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN chat_id VARCHAR(50);
  END IF;
END $$;

-- 6. Crear índice para mejorar búsquedas de pedidos pendientes de confirmación
CREATE INDEX IF NOT EXISTS idx_orders_pending_weight ON orders(pending_weight_confirmation) 
WHERE pending_weight_confirmation = true;

-- 7. Comentarios
COMMENT ON COLUMN restaurants.sells_by_weight IS 'Indica si el restaurante vende productos por kilo';
COMMENT ON COLUMN products.price_per_kg IS 'Precio por kilogramo (opcional, para productos vendidos por peso)';
COMMENT ON COLUMN order_items.weight_kg IS 'Peso real en kilogramos cuando se confirma el pedido';
COMMENT ON COLUMN orders.pending_weight_confirmation IS 'Indica si el pedido está pendiente de confirmación de peso/total';
COMMENT ON COLUMN orders.chat_id IS 'ID del chat de WhatsApp para enviar confirmaciones al cliente';

