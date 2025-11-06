-- ============================================
-- MIGRACIÓN: Sistema de Mozos y Comandas
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: waiters (mozos)
-- ============================================
CREATE TABLE IF NOT EXISTS waiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: waiter_tables (mesas asignadas a mozos)
-- ============================================
CREATE TABLE IF NOT EXISTS waiter_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waiter_id UUID REFERENCES waiters(id) ON DELETE CASCADE NOT NULL,
  table_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(waiter_id, table_number)
);

-- ============================================
-- MODIFICAR TABLA: orders
-- Agregar campos para comandas
-- ============================================

-- Agregar columna order_type (tipo de pedido)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_type VARCHAR(50) DEFAULT 'delivery';
  END IF;
END $$;

-- Agregar columna waiter_id (mozo que tomó la comanda)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'waiter_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN waiter_id UUID REFERENCES waiters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Agregar columna table_number (número de mesa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'table_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN table_number INTEGER;
  END IF;
END $$;

-- Agregar columna scheduled_delivery_time (horario específico de entrega)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'scheduled_delivery_time'
  ) THEN
    ALTER TABLE orders ADD COLUMN scheduled_delivery_time TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_waiters_active ON waiters(active);
CREATE INDEX IF NOT EXISTS idx_waiter_tables_waiter ON waiter_tables(waiter_id);
CREATE INDEX IF NOT EXISTS idx_waiter_tables_number ON waiter_tables(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_time ON orders(scheduled_delivery_time);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_tables ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA ADMINS
-- ============================================

-- Admins pueden gestionar waiters
CREATE POLICY "Admins can read all waiters" ON waiters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage waiters" ON waiters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- Admins pueden gestionar waiter_tables
CREATE POLICY "Admins can read all waiter_tables" ON waiter_tables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage waiter_tables" ON waiter_tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- Actualizar políticas de orders para incluir waiters
-- Nota: Si las políticas ya existen, se intentará crearlas y fallará silenciosamente
-- Las políticas de admins en orders ya deberían existir, pero las recreamos para asegurar consistencia

-- Crear políticas solo si no existen (evitar error si ya existen)
DO $$ 
BEGIN
  -- Eliminar políticas existentes si existen (dentro de un bloque DO para evitar advertencia)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Admins can read all orders'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can read all orders" ON orders';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Admins can manage orders'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can manage orders" ON orders';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar errores si las políticas no existen
    NULL;
END $$;

-- Crear las políticas (si ya existen, dará error pero podemos ignorarlo)
DO $$ 
BEGIN
  EXECUTE 'CREATE POLICY "Admins can read all orders" ON orders
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM admins
        WHERE auth_user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    -- La política ya existe, no hacer nada
    NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM admins
        WHERE auth_user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    -- La política ya existe, no hacer nada
    NULL;
END $$;

-- ============================================
-- POLÍTICAS PARA WAITERS
-- ============================================

-- Waiters pueden leer su propio perfil
CREATE POLICY "Waiters can read own profile" ON waiters
  FOR SELECT USING (auth_user_id = auth.uid());

-- Waiters pueden leer sus mesas asignadas
CREATE POLICY "Waiters can read own tables" ON waiter_tables
  FOR SELECT USING (
    waiter_id IN (
      SELECT id FROM waiters WHERE auth_user_id = auth.uid()
    )
  );

-- Waiters pueden leer productos activos
CREATE POLICY "Waiters can read active products" ON products
  FOR SELECT USING (active = true);

-- Waiters pueden crear pedidos (comandas)
CREATE POLICY "Waiters can create orders" ON orders
  FOR INSERT WITH CHECK (
    waiter_id IN (
      SELECT id FROM waiters WHERE auth_user_id = auth.uid()
    )
  );

-- Waiters pueden leer sus propias comandas
CREATE POLICY "Waiters can read own orders" ON orders
  FOR SELECT USING (
    waiter_id IN (
      SELECT id FROM waiters WHERE auth_user_id = auth.uid()
    )
  );

-- Waiters pueden leer items de sus comandas
CREATE POLICY "Waiters can read own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE waiter_id IN (
        SELECT id FROM waiters WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================
-- POLÍTICAS PÚBLICAS (para cocina - sin autenticación)
-- ============================================

-- Permitir lectura de pedidos con estado "pendiente" para cocina
-- (Se puede restringir más adelante con autenticación específica)
CREATE POLICY "Kitchen can read pending orders" ON orders
  FOR SELECT USING (status = 'pendiente' AND order_type IN ('dine_in', 'takeout'));

CREATE POLICY "Kitchen can read pending order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders
      WHERE status = 'pendiente' AND order_type IN ('dine_in', 'takeout')
    )
  );

-- Permitir actualización de estado de pedidos pendientes (para cocina)
CREATE POLICY "Kitchen can update pending orders status" ON orders
  FOR UPDATE USING (
    status = 'pendiente' AND order_type IN ('dine_in', 'takeout')
  ) WITH CHECK (
    status IN ('pendiente', 'listo para retirar')
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para updated_at en waiters
CREATE TRIGGER update_waiters_updated_at
  BEFORE UPDATE ON waiters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE waiters IS 'Mozos del restaurante';
COMMENT ON TABLE waiter_tables IS 'Mesas asignadas a cada mozo';
COMMENT ON COLUMN orders.order_type IS 'Tipo de pedido: delivery, dine_in, takeout';
COMMENT ON COLUMN orders.waiter_id IS 'Mozo que tomó la comanda';
COMMENT ON COLUMN orders.table_number IS 'Número de mesa para comandas';
COMMENT ON COLUMN orders.scheduled_delivery_time IS 'Horario específico de entrega solicitado por el cliente';

