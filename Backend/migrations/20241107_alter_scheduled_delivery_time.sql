-- Cambiar el tipo de la columna scheduled_delivery_time a texto para permitir valores flexibles
ALTER TABLE orders
  ALTER COLUMN scheduled_delivery_time TYPE text USING scheduled_delivery_time::text;

-- Opcional: permitir valores vacíos almacenados como NULL para mantener consistencia
UPDATE orders
SET scheduled_delivery_time = NULL
WHERE scheduled_delivery_time = '';

