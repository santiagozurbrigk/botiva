-- ============================================
-- Agregar restaurant_id a delivery_config
-- ============================================

-- Agregar columna restaurant_id si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'delivery_config' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE delivery_config ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_delivery_config_restaurant_id ON delivery_config(restaurant_id);
  END IF;
END $$;

-- Deshabilitar RLS en delivery_config (el backend usa Service Role Key)
ALTER TABLE delivery_config DISABLE ROW LEVEL SECURITY;
