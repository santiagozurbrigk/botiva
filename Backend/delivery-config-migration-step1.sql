-- Paso 1: Crear la tabla delivery_config
CREATE TABLE IF NOT EXISTS delivery_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_time_minutes INTEGER NOT NULL DEFAULT 30,
    delivery_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
