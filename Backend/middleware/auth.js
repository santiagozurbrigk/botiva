export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No valid authorization header');
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    console.log('Auth middleware - Token:', token);
    const { supabaseAdmin } = req.app.locals;

    // Verificar el token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    console.log('Auth middleware - User:', user);
    console.log('Auth middleware - Error:', error);

    if (error || !user) {
      console.log('Auth middleware - Invalid token or user');
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar si es admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    req.user = { ...user, admin };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

export const authenticateRider = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    const { supabaseAdmin } = req.app.locals;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar si es rider
    const { data: rider, error: riderError } = await supabaseAdmin
      .from('riders')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (riderError || !rider) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    req.user = { ...user, rider };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

