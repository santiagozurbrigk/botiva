import express from 'express';
import { authenticateAdmin, authenticateWaiter } from '../middleware/auth.js';

const router = express.Router();

// GET /api/waiters - Listar mozos (solo admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('waiters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching waiters:', error);
    res.status(500).json({ error: 'Error al obtener mozos' });
  }
});

// GET /api/waiters/:id - Obtener mozo por ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('waiters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Mozo no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching waiter:', error);
    res.status(500).json({ error: 'Error al obtener mozo' });
  }
});

// GET /api/waiters/me/profile - Obtener perfil del mozo autenticado
router.get('/me/profile', authenticateWaiter, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const waiterId = req.user.waiter.id;

    const { data, error } = await supabaseAdmin
      .from('waiters')
      .select('*')
      .eq('id', waiterId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching waiter profile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// POST /api/waiters - Crear mozo (solo admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Crear perfil de waiter
    const { data: waiter, error: waiterError } = await supabaseAdmin
      .from('waiters')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        phone,
        email,
        active: true,
      })
      .select()
      .single();

    if (waiterError) throw waiterError;

    res.status(201).json(waiter);
  } catch (error) {
    console.error('Error creating waiter:', error);
    res.status(500).json({ error: 'Error al crear mozo' });
  }
});

// PATCH /api/waiters/:id - Actualizar mozo (solo admin)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, active } = req.body;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabaseAdmin
      .from('waiters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Mozo no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating waiter:', error);
    res.status(500).json({ error: 'Error al actualizar mozo' });
  }
});

// DELETE /api/waiters/:id - Eliminar mozo (solo admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = req.app.locals;

    // Obtener el waiter para eliminar su cuenta de auth
    const { data: waiter } = await supabaseAdmin
      .from('waiters')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    // Eliminar waiter
    const { error } = await supabaseAdmin
      .from('waiters')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Eliminar usuario de auth
    if (waiter?.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(waiter.auth_user_id);
    }

    res.json({ message: 'Mozo eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting waiter:', error);
    res.status(500).json({ error: 'Error al eliminar mozo' });
  }
});

export default router;

