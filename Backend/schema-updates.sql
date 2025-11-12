-- ============================================
-- ACTUALIZACIONES DE SCHEMA PARA BOTIVA
-- Sistema Multi-Tenant con Super Admin
-- ============================================

-- ============================================
-- TABLA: super_admins (Creador de Botiva)
-- ============================================
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS en super_admins (el backend usa Service Role Key que bypassa RLS)
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: restaurants (Restaurantes/Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  active BOOLEAN DEFAULT true,
  subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, suspended, cancelled
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES super_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS en restaurants (el backend usa Service Role Key que bypassa RLS)
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;

-- ============================================
-- MODIFICAR TABLA: admins (agregar restaurant_id)
-- ============================================
-- Primero verificar si la columna ya existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admins' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE admins ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Agregar índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_admins_restaurant_id ON admins(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_created_by ON restaurants(created_by);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(active);

-- Deshabilitar RLS en admins para permitir que el backend (Service Role Key) pueda crear/actualizar admins
-- NOTA: El backend maneja la seguridad mediante middleware, por lo que RLS no es necesario aquí
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- ============================================
-- MODIFICAR OTRAS TABLAS PARA MULTI-TENANT
-- ============================================
-- Agregar restaurant_id a las tablas principales para separar datos por restaurante

-- Products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE products ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id);
  END IF;
END $$;

-- Orders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
  END IF;
END $$;

-- Riders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'riders' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE riders ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_riders_restaurant_id ON riders(restaurant_id);
  END IF;
END $$;

-- Waiters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waiters' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE waiters ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_waiters_restaurant_id ON waiters(restaurant_id);
  END IF;
END $$;

-- Extras
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'extras' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE extras ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_extras_restaurant_id ON extras(restaurant_id);
  END IF;
END $$;

