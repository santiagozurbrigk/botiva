import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/stock/requests - Crear pedido de reposición
// Nota: Puede ser sin autenticación (para cocina) o con autenticación (para admin)
// Si viene con autenticación, se usa req.restaurantId, si no, se requiere restaurant_id en el body
router.post('/requests', async (req, res) => {
  try {
    const { section, requester_name, missing_items, additional_notes, restaurant_id } = req.body;
    const { supabaseAdmin } = req.app.locals;

    console.log('🔵 [STOCK][POST] Creando pedido de stock', { section, requester_name, hasRestaurantId: !!(req.restaurantId || restaurant_id) });

    if (!section || !missing_items) {
      return res.status(400).json({ error: 'La sección y los insumos faltantes son obligatorios' });
    }

    // Obtener restaurant_id: del middleware si hay admin autenticado, o del body
    const restaurantId = req.restaurantId || restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurant_id es requerido' });
    }

    // Si viene del middleware (admin autenticado), validar que el restaurante existe y está activo
    if (req.restaurantId) {
      const { data: restaurant, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, active')
        .eq('id', restaurantId)
        .single();
      
      if (restaurantError || !restaurant) {
        console.error('❌ [STOCK][POST] Restaurante no encontrado:', restaurantId, restaurantError);
        return res.status(400).json({ error: 'Restaurante no encontrado' });
      }
      
      if (!restaurant.active) {
        console.warn('⚠️ [STOCK][POST] Restaurante inactivo:', restaurantId);
        return res.status(400).json({ error: 'El restaurante está inactivo' });
      }
    }

    const payload = {
      section: section.trim(),
      missing_items: missing_items.trim(),
      restaurant_id: restaurantId, // Asociar solicitud al restaurante
    };

    if (requester_name) {
      payload.requester_name = requester_name.trim();
    }

    if (additional_notes) {
      payload.additional_notes = additional_notes.trim();
    }

    const { data, error } = await supabaseAdmin
      .from('stock_requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ [STOCK][POST] Error insertando solicitud:', error);
      throw error;
    }

    console.log('✅ [STOCK][POST] Pedido de stock creado:', data.id);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [STOCK][POST] Error creating stock request:', error);
    res.status(500).json({ error: 'Error al registrar el pedido de stock' });
  }
});

// GET /api/stock/requests - Listar pedidos (solo administradores)
router.get('/requests', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { status } = req.query;
    const restaurantId = req.restaurantId; // Obtener restaurant_id del middleware

    if (!restaurantId) {
      return res.status(403).json({ error: 'No se pudo determinar el restaurante' });
    }

    console.log('🔵 [STOCK][GET] Listando pedidos para restaurante:', restaurantId, 'status:', status || 'todos');

    let query = supabaseAdmin
      .from('stock_requests')
      .select('*')
      .eq('restaurant_id', restaurantId) // Filtrar por restaurant_id
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [STOCK][GET] Error Supabase:', error);
      throw error;
    }

    console.log('✅ [STOCK][GET] Pedidos encontrados:', data?.length || 0);
    res.json(data);
  } catch (error) {
    console.error('❌ [STOCK][GET] Error fetching stock requests:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de stock' });
  }
});

// PATCH /api/stock/requests/:id/status - Actualizar estado (solo administradores)
router.patch('/requests/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { supabaseAdmin } = req.app.locals;
    const restaurantId = req.restaurantId; // Obtener restaurant_id del middleware

    if (!restaurantId) {
      return res.status(403).json({ error: 'No se pudo determinar el restaurante' });
    }

    if (!status) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    const validStatuses = ['pendiente', 'en proceso', 'resuelto'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('stock_requests')
      .update({ status })
      .eq('id', id)
      .eq('restaurant_id', restaurantId) // Asegurar que solo actualice solicitudes de su restaurante
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Pedido de stock no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating stock request status:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del pedido de stock' });
  }
});

export default router;

