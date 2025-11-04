-- ============================================
-- MIGRACIÓN: Tabla extras
-- ============================================

-- Crear tabla extras
CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_extras_category ON extras(category);
CREATE INDEX IF NOT EXISTS idx_extras_active ON extras(active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer extras activos
CREATE POLICY "Extras activos son visibles para todos"
  ON extras FOR SELECT
  USING (active = true);

-- Política: Solo admins pueden ver todos los extras
CREATE POLICY "Admins pueden ver todos los extras"
  ON extras FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Política: Solo admins pueden insertar extras
CREATE POLICY "Admins pueden crear extras"
  ON extras FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Política: Solo admins pueden actualizar extras
CREATE POLICY "Admins pueden actualizar extras"
  ON extras FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Política: Solo admins pueden eliminar extras
CREATE POLICY "Admins pueden eliminar extras"
  ON extras FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_extras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_extras_updated_at
  BEFORE UPDATE ON extras
  FOR EACH ROW
  EXECUTE FUNCTION update_extras_updated_at();

-- Comentarios
COMMENT ON TABLE extras IS 'Tabla para almacenar extras adicionales (salsas, aderezos, etc.)';
COMMENT ON COLUMN extras.name IS 'Nombre del extra';
COMMENT ON COLUMN extras.description IS 'Descripción del extra';
COMMENT ON COLUMN extras.price IS 'Precio del extra';
COMMENT ON COLUMN extras.category IS 'Categoría del extra (salsa, aderezo, bebida, etc.)';
COMMENT ON COLUMN extras.image_url IS 'URL de la imagen del extra';
COMMENT ON COLUMN extras.active IS 'Indica si el extra está activo y disponible';

