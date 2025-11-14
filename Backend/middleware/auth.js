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
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      console.log('Auth middleware - Error:', error.message || error);
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (!data || !data.user) {
      console.log('Auth middleware - No user data');
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { user } = data;
    console.log('Auth middleware - User authenticated:', user.email);

    // Verificar si es admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar que el admin tenga un restaurant_id asignado
    if (!admin.restaurant_id) {
      console.error('Admin sin restaurant_id asignado:', admin.id);
      return res.status(403).json({ error: 'Admin no tiene restaurante asignado' });
    }

    req.user = { ...user, admin };
    req.restaurantId = admin.restaurant_id; // Agregar restaurant_id al request para facilitar el acceso
    
    console.log('✅ [AUTH MIDDLEWARE] Admin autenticado:', admin.email);
    console.log('✅ [AUTH MIDDLEWARE] restaurant_id asignado:', admin.restaurant_id);
    console.log('✅ [AUTH MIDDLEWARE] req.restaurantId establecido:', req.restaurantId);
    
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

export const authenticateWaiter = async (req, res, next) => {
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

    // Verificar si es waiter
    const { data: waiter, error: waiterError } = await supabaseAdmin
      .from('waiters')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (waiterError || !waiter) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    req.user = { ...user, waiter };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

export const authenticateSuperAdmin = async (req, res, next) => {
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

    // Verificar si es super admin
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (superAdminError || !superAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de super administrador' });
    }

    req.user = { ...user, superAdmin };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

