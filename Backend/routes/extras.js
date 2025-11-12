import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/extras - Listar extras
// Nota: Esta ruta puede ser pública (para cocina) o con autenticación (para admin)
router.get('/', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { category, active } = req.query;
    const restaurantId = req.restaurantId; // Obtener restaurant_id si hay admin autenticado

    let query = supabaseAdmin.from('extras').select('*');
    
    // Filtrar por restaurant_id si está disponible
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    } else {
      // Si no hay restaurantId, solo mostrar extras activos (para acceso público como cocina)
      query = query.eq('active', true);
    }
    
    query = query.order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching extras:', error);
    res.status(500).json({ error: 'Error al obtener extras' });
  }
});

// GET /api/extras/:id - Obtener extra por ID
router.get('/:id', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('extras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Extra no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching extra:', error);
    res.status(500).json({ error: 'Error al obtener extra' });
  }
});

// POST /api/extras - Crear extra (solo admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, active } = req.body;
    const restaurantId = req.restaurantId;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('extras')
      .insert({
        name,
        description,
        price,
        category,
        image_url,
        active: active !== undefined ? active : true,
        restaurant_id: restaurantId, // Asociar extra al restaurante
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating extra:', error);
    res.status(500).json({ error: 'Error al crear extra' });
  }
});

// PATCH /api/extras/:id - Actualizar extra (solo admin)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, active } = req.body;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (image_url !== undefined) updates.image_url = image_url;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabaseAdmin
      .from('extras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Extra no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating extra:', error);
    res.status(500).json({ error: 'Error al actualizar extra' });
  }
});

// DELETE /api/extras/:id - Eliminar extra (solo admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseAdmin } = req.app.locals;

    const { error } = await supabaseAdmin
      .from('extras')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Extra eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting extra:', error);
    res.status(500).json({ error: 'Error al eliminar extra' });
  }
});

export default router;

