-- ============================================
-- Agregar restaurant_id a stock_requests
-- ============================================
-- Esta tabla almacena solicitudes de reposición de stock desde la cocina
-- Cada solicitud debe estar asociada a un restaurante específico

-- Agregar columna restaurant_id si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_requests' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE stock_requests ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_stock_requests_restaurant_id ON stock_requests(restaurant_id);
  END IF;
END $$;

-- Comentario
COMMENT ON COLUMN stock_requests.restaurant_id IS 'ID del restaurante al que pertenece esta solicitud de stock';

