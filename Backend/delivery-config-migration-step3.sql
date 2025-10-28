-- Paso 3: Crear función y trigger
CREATE OR REPLACE FUNCTION update_delivery_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_config_updated_at
    BEFORE UPDATE ON delivery_config
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_config_updated_at();
