-- Paso 2: Insertar configuración inicial
INSERT INTO delivery_config (delivery_time_minutes, delivery_cost, is_active) 
VALUES (30, 0.00, true)
ON CONFLICT DO NOTHING;
