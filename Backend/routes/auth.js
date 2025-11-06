import express from 'express';
import { authenticateAdmin, authenticateRider, authenticateWaiter } from '../middleware/auth.js';

const router = express.Router();

// Login Admin
router.post('/login-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que es admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
        admin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Login Rider
router.post('/login-rider', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que es rider
    const { data: rider, error: riderError } = await supabaseAdmin
      .from('riders')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (riderError || !rider) {
      return res.status(403).json({ error: 'No tienes permisos de repartidor' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'rider',
        rider,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Login Waiter
router.post('/login-waiter', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que es waiter
    const { data: waiter, error: waiterError } = await supabaseAdmin
      .from('waiters')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (waiterError || !waiter) {
      return res.status(403).json({ error: 'No tienes permisos de mozo' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'waiter',
        waiter,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Verificar token
router.get('/verify', authenticateAdmin, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
