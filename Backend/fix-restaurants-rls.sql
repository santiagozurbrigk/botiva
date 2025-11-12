-- ============================================
-- FIX: Políticas RLS para restaurants
-- ============================================
-- La tabla restaurants debe ser accesible desde el backend con Service Role Key
-- Como el backend usa Service Role Key, no necesita RLS habilitado

-- Deshabilitar RLS en restaurants (RECOMENDADO)
ALTER TABLE IF EXISTS restaurants DISABLE ROW LEVEL SECURITY;

-- Verificar el estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'restaurants';

-- Si prefieres mantener RLS habilitado, puedes crear políticas que permitan acceso al Service Role
-- Pero esto no es necesario ya que el Service Role Key bypassa RLS automáticamente

