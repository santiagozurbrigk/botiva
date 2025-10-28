-- Paso 5: Agregar comentarios
COMMENT ON TABLE delivery_config IS 'Configuración global de entrega (tiempo de demora y costo)';
COMMENT ON COLUMN delivery_config.delivery_time_minutes IS 'Tiempo de demora en minutos';
COMMENT ON COLUMN delivery_config.delivery_cost IS 'Costo de envío en la moneda local';
COMMENT ON COLUMN delivery_config.is_active IS 'Indica si esta configuración está activa';
