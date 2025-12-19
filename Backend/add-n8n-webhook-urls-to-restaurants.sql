-- ============================================
-- AGREGAR URLs DE WEBHOOK DE N8N A RESTAURANTES
-- ============================================
-- Este script agrega campos para almacenar las URLs de webhook de n8n
-- en la tabla restaurants, permitiendo que cada restaurante tenga su propia
-- configuración de webhook sin necesidad de variables de entorno.

-- PASO 1: Agregar columna 'n8n_webhook_url' a la tabla 'restaurants'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'n8n_webhook_url') THEN
    ALTER TABLE restaurants ADD COLUMN n8n_webhook_url TEXT;
    COMMENT ON COLUMN restaurants.n8n_webhook_url IS 'URL del webhook de n8n para notificaciones de pedidos listos para retirar';
    RAISE NOTICE 'Columna n8n_webhook_url agregada a la tabla restaurants.';
  ELSE
    RAISE NOTICE 'Columna n8n_webhook_url ya existe en la tabla restaurants.';
  END IF;
END $$;

-- PASO 2: Agregar columna 'n8n_order_confirmation_webhook_url' a la tabla 'restaurants'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'n8n_order_confirmation_webhook_url') THEN
    ALTER TABLE restaurants ADD COLUMN n8n_order_confirmation_webhook_url TEXT;
    COMMENT ON COLUMN restaurants.n8n_order_confirmation_webhook_url IS 'URL del webhook de n8n para confirmación de pedidos por peso (restaurantes que venden por kilo)';
    RAISE NOTICE 'Columna n8n_order_confirmation_webhook_url agregada a la tabla restaurants.';
  ELSE
    RAISE NOTICE 'Columna n8n_order_confirmation_webhook_url ya existe en la tabla restaurants.';
  END IF;
END $$;

-- PASO 3: (Opcional) Migrar URLs existentes desde variables de entorno
-- Si tienes restaurantes existentes y quieres migrar las URLs desde variables de entorno,
-- puedes ejecutar manualmente:
-- UPDATE restaurants SET n8n_webhook_url = 'https://tu-n8n.com/webhook/order-ready' WHERE id = 'restaurant-uuid';
-- UPDATE restaurants SET n8n_order_confirmation_webhook_url = 'https://tu-n8n.com/webhook/order-confirmation' WHERE id = 'restaurant-uuid';

