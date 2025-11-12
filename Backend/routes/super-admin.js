import express from 'express';
import { authenticateSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/super-admin/restaurants - Listar todos los restaurantes
router.get('/restaurants', authenticateSuperAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(restaurants || []);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
});

// GET /api/super-admin/restaurants/:id - Obtener restaurante por ID
router.get('/restaurants/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Error al obtener restaurante' });
  }
});

// POST /api/super-admin/restaurants - Crear nuevo restaurante
router.post('/restaurants', authenticateSuperAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, subscription_status, subscription_end_date } = req.body;
    const superAdminId = req.user.superAdmin.id;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar que el email no esté en uso
    const { data: existingRestaurant } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('email', email)
      .single();

    if (existingRestaurant) {
      return res.status(409).json({ error: 'Ya existe un restaurante con ese email' });
    }

    // Crear restaurante
    const restaurantData = {
      name,
      email,
      phone: phone || null,
      address: address || null,
      subscription_status: subscription_status || 'trial',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: subscription_end_date || null,
      created_by: superAdminId,
      active: true,
    };

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Error al crear restaurante' });
  }
});

// POST /api/super-admin/restaurants/:id/admin - Crear cuenta de admin para restaurante
router.post('/restaurants/:id/admin', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar que el restaurante existe
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    // Verificar que el email no esté en uso
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(409).json({ error: 'Ya existe un administrador con ese email' });
    }

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Crear perfil de admin asociado al restaurante
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        email,
        restaurant_id: restaurantId,
      })
      .select()
      .single();

    if (adminError) throw adminError;

    res.status(201).json({
      admin,
      restaurant,
      message: 'Cuenta de administrador creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Error al crear cuenta de administrador' });
  }
});

// PATCH /api/super-admin/restaurants/:id - Actualizar restaurante
router.patch('/restaurants/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, active, subscription_status, subscription_end_date } = req.body;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (active !== undefined) updates.active = active;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (subscription_end_date !== undefined) updates.subscription_end_date = subscription_end_date;

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Error al actualizar restaurante' });
  }
});

// GET /api/super-admin/restaurants/:id/admins - Listar admins de un restaurante
router.get('/restaurants/:id/admins', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { supabaseAdmin } = req.app.locals;

    const { data: admins, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(admins || []);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
});

// DELETE /api/super-admin/restaurants/:id - Eliminar restaurante (soft delete)
router.delete('/restaurants/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = req.app.locals;

    // En lugar de eliminar, desactivar el restaurante
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json({ message: 'Restaurante desactivado exitosamente', restaurant });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Error al eliminar restaurante' });
  }
});

export default router;

