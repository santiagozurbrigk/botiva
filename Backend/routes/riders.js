import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/riders - Listar repartidores
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ error: 'Error al obtener repartidores' });
  }
});

// GET /api/riders/:id - Obtener repartidor por ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('riders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Repartidor no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).json({ error: 'Error al obtener repartidor' });
  }
});

// POST /api/riders - Crear repartidor
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

    // Crear perfil de rider
    const { data: rider, error: riderError } = await supabaseAdmin
      .from('riders')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        phone,
        email,
        active: true,
      })
      .select()
      .single();

    if (riderError) throw riderError;

    res.status(201).json(rider);
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ error: 'Error al crear repartidor' });
  }
});

// PATCH /api/riders/:id - Actualizar repartidor
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
      .from('riders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Repartidor no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ error: 'Error al actualizar repartidor' });
  }
});

// DELETE /api/riders/:id - Eliminar repartidor
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = req.app.locals;

    // Obtener el rider para eliminar su cuenta de auth
    const { data: rider } = await supabaseAdmin
      .from('riders')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    // Eliminar rider
    const { error } = await supabaseAdmin
      .from('riders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Eliminar usuario de auth
    if (rider?.auth_user_id) {
      await supabaseAdmin.auth.admin.deleteUser(rider.auth_user_id);
    }

    res.json({ message: 'Repartidor eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ error: 'Error al eliminar repartidor' });
  }
});

export default router;

