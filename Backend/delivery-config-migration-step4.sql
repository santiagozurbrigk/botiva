-- Paso 4: Habilitar RLS y crear política
ALTER TABLE delivery_config ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden leer y modificar la configuración
CREATE POLICY "Admins can manage delivery config" ON delivery_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.auth_user_id = auth.uid()
        )
    );
