import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products - Listar productos
// Nota: Esta ruta puede ser pública (para cocina) o con autenticación (para admin)
router.get('/', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { category, active } = req.query;
    
    // Si hay un admin autenticado, filtrar por restaurant_id
    const restaurantId = req.restaurantId;

    let query = supabaseAdmin.from('products').select('*');
    
    // Filtrar por restaurant_id si está disponible (admin autenticado)
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    } else {
      // Si no hay restaurantId, solo mostrar productos activos (para acceso público como cocina)
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
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/products - Crear producto (solo admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, active } = req.body;
    const restaurantId = req.restaurantId;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        image_url,
        active: active !== undefined ? active : true,
        restaurant_id: restaurantId, // Asociar producto al restaurante
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PATCH /api/products/:id - Actualizar producto (solo admin)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, active } = req.body;
    const restaurantId = req.restaurantId;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (image_url !== undefined) updates.image_url = image_url;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('restaurant_id', restaurantId) // Asegurar que solo actualice productos de su restaurante
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurantId;
    const { supabaseAdmin } = req.app.locals;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId); // Asegurar que solo elimine productos de su restaurante

    if (error) throw error;

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
