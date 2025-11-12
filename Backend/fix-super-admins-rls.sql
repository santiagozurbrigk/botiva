-- ============================================
-- FIX: Políticas RLS para super_admins
-- ============================================
-- Este script deshabilita RLS en super_admins o crea políticas apropiadas
-- La tabla super_admins debe ser accesible solo desde el backend con Service Role Key

-- Opción 1: Deshabilitar RLS (RECOMENDADO para super_admins)
-- Como el backend usa Service Role Key, no necesita RLS
ALTER TABLE IF EXISTS super_admins DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si prefieres mantener RLS habilitado, crear políticas que permitan acceso al Service Role
-- (Pero esto no es necesario ya que el Service Role Key bypassa RLS)

-- Verificar el estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'super_admins';

