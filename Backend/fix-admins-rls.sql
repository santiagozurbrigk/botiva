-- ============================================
-- FIX: Políticas RLS para admins
-- ============================================
-- La tabla admins debe ser accesible desde el backend con Service Role Key
-- Como el backend usa Service Role Key, no necesita RLS habilitado para operaciones del backend

-- IMPORTANTE: Si ya tienes políticas RLS para admins que permiten a los admins leer sus propios datos,
-- puedes mantener RLS habilitado pero necesitas permitir que el Service Role Key pueda insertar/actualizar

-- Opción 1: Deshabilitar RLS completamente (MÁS SIMPLE)
-- Esto permite que el backend (Service Role Key) pueda hacer cualquier operación
ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si prefieres mantener RLS habilitado para seguridad adicional,
-- puedes crear una política que permita al Service Role Key hacer todo
-- (Pero esto no es necesario ya que el Service Role Key bypassa RLS automáticamente)

-- Verificar el estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'admins';

-- Ver políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'admins';

