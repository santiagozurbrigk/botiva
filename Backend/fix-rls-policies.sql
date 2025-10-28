-- Verificar y crear políticas para la tabla admins si no existen

-- Política para que los admins puedan leer su propio perfil
CREATE POLICY IF NOT EXISTS "Admins can read own profile" ON admins
  FOR SELECT USING (auth_user_id = auth.uid());

-- Política para que los admins puedan leer todos los admins
CREATE POLICY IF NOT EXISTS "Admins can read all admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'admins';

