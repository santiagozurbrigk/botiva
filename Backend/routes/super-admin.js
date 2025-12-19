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
    const { 
      name, 
      email, 
      phone, 
      address, 
      subscription_status, 
      subscription_end_date, 
      sells_by_weight,
      n8n_webhook_url,
      n8n_order_confirmation_webhook_url
    } = req.body;
    
    console.log('🍽️  Creando restaurante:', { name, email });
    
    // Verificar que req.user y req.user.superAdmin existen
    if (!req.user || !req.user.superAdmin) {
      console.error('❌ Error: req.user.superAdmin no está definido');
      return res.status(500).json({ error: 'Error de autenticación' });
    }

    const superAdminId = req.user.superAdmin.id;
    console.log('✅ Super Admin ID:', superAdminId);

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar que el email no esté en uso
    const { data: existingRestaurant, error: checkError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar email existente:', checkError);
      throw checkError;
    }

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
      sells_by_weight: sells_by_weight || false,
      n8n_webhook_url: n8n_webhook_url || null,
      n8n_order_confirmation_webhook_url: n8n_order_confirmation_webhook_url || null,
    };

    console.log('📝 Datos del restaurante a insertar:', restaurantData);

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar restaurante:', error);
      console.error('   Código:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('   Detalles:', error.details);
      console.error('   Hint:', error.hint);
      throw error;
    }

    console.log('✅ Restaurante creado exitosamente:', restaurant.id);
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    res.status(500).json({ 
      error: 'Error al crear restaurante',
      details: error.message || 'Error desconocido'
    });
  }
});

// POST /api/super-admin/restaurants/:id/admin - Crear cuenta de admin para restaurante
router.post('/restaurants/:id/admin', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { name, email, password } = req.body;

    console.log('👤 Creando admin para restaurante:', { restaurantId, name, email });

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
      console.error('❌ Restaurante no encontrado:', restaurantError);
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    console.log('✅ Restaurante encontrado:', restaurant.name);

    // Verificar que el email no esté en uso
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar email existente:', checkError);
      throw checkError;
    }

    if (existingAdmin) {
      return res.status(409).json({ error: 'Ya existe un administrador con ese email' });
    }

    // Crear usuario en Supabase Auth
    console.log('🔐 Creando usuario en Supabase Auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error al crear usuario en Auth:', authError);
      throw authError;
    }

    console.log('✅ Usuario creado en Auth:', authUser.user.id);

    // Crear perfil de admin asociado al restaurante
    const adminData = {
      auth_user_id: authUser.user.id,
      name,
      email,
      restaurant_id: restaurantId,
    };

    console.log('📝 Insertando admin en base de datos:', adminData);

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .insert(adminData)
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error al insertar admin:', adminError);
      console.error('   Código:', adminError.code);
      console.error('   Mensaje:', adminError.message);
      console.error('   Detalles:', adminError.details);
      console.error('   Hint:', adminError.hint);
      
      // Si falla la inserción, eliminar el usuario de Auth para mantener consistencia
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log('🧹 Usuario eliminado de Auth debido a error en inserción');
      } catch (deleteError) {
        console.error('⚠️  Error al eliminar usuario de Auth:', deleteError);
      }
      
      throw adminError;
    }

    console.log('✅ Admin creado exitosamente:', admin.id);

    res.status(201).json({
      admin,
      restaurant,
      message: 'Cuenta de administrador creada exitosamente',
    });
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({ 
      error: 'Error al crear cuenta de administrador',
      details: error.message || 'Error desconocido'
    });
  }
});

// PATCH /api/super-admin/restaurants/:id - Actualizar restaurante
router.patch('/restaurants/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      address, 
      active, 
      subscription_status, 
      subscription_end_date,
      sells_by_weight,
      n8n_webhook_url,
      n8n_order_confirmation_webhook_url
    } = req.body;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (active !== undefined) updates.active = active;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (subscription_end_date !== undefined) updates.subscription_end_date = subscription_end_date;
    if (sells_by_weight !== undefined) updates.sells_by_weight = sells_by_weight;
    if (n8n_webhook_url !== undefined) updates.n8n_webhook_url = n8n_webhook_url || null;
    if (n8n_order_confirmation_webhook_url !== undefined) updates.n8n_order_confirmation_webhook_url = n8n_order_confirmation_webhook_url || null;

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

// GET /api/super-admin/restaurants/:id/details - Obtener detalles completos del restaurante
router.get('/restaurants/:id/details', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { supabaseAdmin } = req.app.locals;

    // Obtener información del restaurante
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    // Obtener admins
    const { data: admins } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    // Obtener estadísticas básicas
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('restaurant_id', restaurantId);

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, active')
      .eq('restaurant_id', restaurantId);

    const { data: waiters } = await supabaseAdmin
      .from('waiters')
      .select('id, active')
      .eq('restaurant_id', restaurantId);

    const { data: riders } = await supabaseAdmin
      .from('riders')
      .select('id, active')
      .eq('restaurant_id', restaurantId);

    // Calcular estadísticas
    const stats = {
      totalOrders: orders?.length || 0,
      totalProducts: products?.length || 0,
      activeProducts: products?.filter(p => p.active).length || 0,
      totalWaiters: waiters?.length || 0,
      activeWaiters: waiters?.filter(w => w.active).length || 0,
      totalRiders: riders?.length || 0,
      activeRiders: riders?.filter(r => r.active).length || 0,
      totalRevenue: orders
        ?.filter(o => o.status === 'entregado')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0,
      pendingOrders: orders?.filter(o => o.status === 'pendiente').length || 0,
      completedOrders: orders?.filter(o => o.status === 'entregado').length || 0,
    };

    res.json({
      restaurant,
      admins: admins || [],
      statistics: stats,
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Error al obtener detalles del restaurante' });
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

