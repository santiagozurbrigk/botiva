-- ============================================
-- AGREGAR TABLA DELIVERY_CONFIG
-- ============================================

-- Crear la tabla delivery_config
CREATE TABLE IF NOT EXISTS delivery_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_time_minutes INTEGER NOT NULL DEFAULT 30,
    delivery_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO delivery_config (delivery_time_minutes, delivery_cost, is_active) 
VALUES (30, 0.00, true)
ON CONFLICT DO NOTHING;

-- Crear función específica para delivery_config
CREATE OR REPLACE FUNCTION update_delivery_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para delivery_config
CREATE TRIGGER update_delivery_config_updated_at
    BEFORE UPDATE ON delivery_config
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_config_updated_at();

-- Habilitar RLS en delivery_config
ALTER TABLE delivery_config ENABLE ROW LEVEL SECURITY;

-- Política para admins en delivery_config
CREATE POLICY "Admins can manage delivery config" ON delivery_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.auth_user_id = auth.uid()
        )
    );

-- Comentarios para delivery_config
COMMENT ON TABLE delivery_config IS 'Configuración global de entrega (tiempo de demora y costo)';
COMMENT ON COLUMN delivery_config.delivery_time_minutes IS 'Tiempo de demora en minutos';
COMMENT ON COLUMN delivery_config.delivery_cost IS 'Costo de envío en la moneda local';
COMMENT ON COLUMN delivery_config.is_active IS 'Indica si esta configuración está activa';
