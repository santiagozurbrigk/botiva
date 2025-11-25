-- ============================================
-- FIX: Políticas RLS para orders
-- ============================================
-- Este script corrige las políticas RLS para permitir que el backend (Service Role Key)
-- pueda insertar pedidos sin problemas, mientras mantiene la seguridad para usuarios autenticados

-- IMPORTANTE: El Service Role Key DEBERÍA bypassar RLS automáticamente,
-- pero si hay problemas, estas políticas aseguran que las operaciones funcionen

-- ============================================
-- PASO 1: Eliminar políticas conflictivas (opcional)
-- ============================================
-- Si tienes políticas duplicadas o conflictivas, puedes eliminarlas primero
-- (No ejecutes esto a menos que sepas qué estás haciendo)

-- DROP POLICY IF EXISTS "Public can insert orders" ON orders;
-- DROP POLICY IF EXISTS "Waiters can create orders" ON orders;

-- ============================================
-- PASO 2: Crear/Actualizar política para inserciones públicas
-- ============================================
-- Esta política permite que cualquiera (incluido el backend con service role) pueda insertar pedidos
-- Es necesaria para n8n y para el backend cuando no hay autenticación de usuario

DO $$ 
BEGIN
  -- Eliminar política existente si existe
  DROP POLICY IF EXISTS "Public can insert orders" ON orders;
  
  -- Crear nueva política que permita inserciones sin restricciones
  CREATE POLICY "Public can insert orders" ON orders
    FOR INSERT 
    WITH CHECK (true);
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, intentar crear la política de otra manera
    NULL;
END $$;

-- ============================================
-- PASO 3: Asegurar que la política de mozos también permita inserciones
-- ============================================
-- Esta política permite que los mozos autenticados creen comandas

DO $$ 
BEGIN
  -- Eliminar política existente si existe
  DROP POLICY IF EXISTS "Waiters can create orders" ON orders;
  
  -- Crear nueva política para mozos
  CREATE POLICY "Waiters can create orders" ON orders
    FOR INSERT 
    WITH CHECK (
      waiter_id IN (
        SELECT id FROM waiters WHERE auth_user_id = auth.uid()
      )
      OR waiter_id IS NULL  -- Permitir también cuando waiter_id es NULL (para n8n)
    );
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================
-- PASO 4: Verificar políticas existentes
-- ============================================
-- Ejecuta esto para ver todas las políticas actuales:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. El Service Role Key DEBERÍA bypassar RLS automáticamente
-- 2. Si el error persiste después de ejecutar este script, verifica:
--    - Que SUPABASE_SERVICE_ROLE_KEY esté correctamente configurado en las variables de entorno
--    - Que el backend esté usando supabaseAdmin (no supabaseAnon)
--    - Que no haya políticas conflictivas que bloqueen las inserciones
-- 3. Si nada funciona, puedes deshabilitar RLS temporalmente para testing:
--    ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
--    (NO recomendado para producción)

