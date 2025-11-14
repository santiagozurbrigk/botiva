import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/riders - Listar repartidores
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const restaurantId = req.restaurantId;

    console.log('🔵 [RIDERS][GET] Listando riders para restaurante:', restaurantId);

    const { data, error } = await supabaseAdmin
      .from('riders')
      .select('*')
      .eq('restaurant_id', restaurantId) // Filtrar por restaurant_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [RIDERS][GET] Error en Supabase:', error);
      throw error;
    }

    console.log('✅ [RIDERS][GET] Riders encontrados:', data?.length || 0);
    res.json(data);
  } catch (error) {
    console.error('❌ [RIDERS][GET] Error fetching riders:', error);
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

    console.log('🔵 [RIDERS][POST] Intentando crear rider', { name, email, phone });

    if (!name || !phone || !email || !password) {
      console.warn('⚠️ [RIDERS][POST] Campos faltantes', { name, phone, email, hasPassword: !!password });
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ [RIDERS][POST] Error creando usuario en Auth:', authError);
      throw authError;
    }

    // Crear perfil de rider
    const restaurantId = req.restaurantId;
    console.log('🔵 [RIDERS][POST] Asociando rider al restaurante:', restaurantId);

    const { data: rider, error: riderError } = await supabaseAdmin
      .from('riders')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        phone,
        email,
        active: true,
        restaurant_id: restaurantId, // Asociar rider al restaurante
      })
      .select()
      .single();

    if (riderError) {
      console.error('❌ [RIDERS][POST] Error insertando rider:', riderError);
      // Intentar limpiar usuario de Auth si falla la inserción
      if (authUser?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log('ℹ️ [RIDERS][POST] Usuario de Auth eliminado por rollback');
      }
      throw riderError;
    }

    console.log('✅ [RIDERS][POST] Rider creado correctamente:', rider.id);
    res.status(201).json(rider);
  } catch (error) {
    console.error('❌ [RIDERS][POST] Error creating rider:', error);
    res.status(500).json({ error: 'Error al crear repartidor' });
  }
});

// PATCH /api/riders/:id - Actualizar repartidor
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, active } = req.body;
    const restaurantId = req.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({ error: 'No se pudo determinar el restaurante' });
    }

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabaseAdmin
      .from('riders')
      .update(updates)
      .eq('id', id)
      .eq('restaurant_id', restaurantId) // Asegurar que solo actualice riders de su restaurante
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
    const restaurantId = req.restaurantId;

    if (!restaurantId) {
      return res.status(403).json({ error: 'No se pudo determinar el restaurante' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Obtener el rider para eliminar su cuenta de auth y verificar que pertenece al restaurante
    const { data: rider } = await supabaseAdmin
      .from('riders')
      .select('auth_user_id, restaurant_id')
      .eq('id', id)
      .eq('restaurant_id', restaurantId) // Asegurar que solo pueda eliminar riders de su restaurante
      .single();

    if (!rider) {
      return res.status(404).json({ error: 'Repartidor no encontrado' });
    }

    // Eliminar rider
    const { error } = await supabaseAdmin
      .from('riders')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId);

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

