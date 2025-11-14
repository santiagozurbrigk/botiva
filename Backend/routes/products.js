import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products - Listar productos
// Nota: Esta ruta puede ser pública (para cocina) o con autenticación (para admin)
// Si hay token, usar authenticateAdmin para establecer req.restaurantId
router.get('/', async (req, res, next) => {
  // Si hay token de autorización, usar el middleware de autenticación primero
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Llamar al middleware de autenticación para establecer req.restaurantId
    return authenticateAdmin(req, res, () => {
      // Continuar con el handler después de la autenticación
      handleGetProducts(req, res);
    });
  } else {
    // Sin token, continuar sin autenticación (acceso público para cocina)
    handleGetProducts(req, res);
  }
});

async function handleGetProducts(req, res) {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { category, active } = req.query;
    
    // Si hay un admin autenticado, filtrar por restaurant_id
    const restaurantId = req.restaurantId;

    console.log('🔵 [PRODUCTS GET] restaurantId del request:', restaurantId);
    console.log('🔵 [PRODUCTS GET] req.restaurantId:', req.restaurantId);
    console.log('🔵 [PRODUCTS GET] req.user:', req.user ? 'existe' : 'no existe');

    let query = supabaseAdmin.from('products').select('*');
    
    // Filtrar por restaurant_id si está disponible (admin autenticado)
    if (restaurantId) {
      console.log('🔵 [PRODUCTS GET] Filtrando por restaurant_id:', restaurantId);
      query = query.eq('restaurant_id', restaurantId);
    } else {
      // Si no hay restaurantId, solo mostrar productos activos (para acceso público como cocina)
      console.log('🔵 [PRODUCTS GET] Sin restaurantId, filtrando solo por active=true');
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

    console.log('🔵 [PRODUCTS GET] Productos encontrados:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔵 [PRODUCTS GET] Primeros productos:', data.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        restaurant_id: p.restaurant_id
      })));
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;
    const restaurantId = req.restaurantId; // Puede ser undefined si es acceso público (cocina)

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id);

    // Si hay restaurantId (admin autenticado), filtrar por él
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    } else {
      // Si es acceso público, solo mostrar productos activos
      query = query.eq('active', true);
    }

    const { data, error } = await query.single();

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

    // Validación de campos requeridos
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validación crítica: asegurar que restaurantId existe
    if (!restaurantId) {
      console.error('Error: restaurantId no está definido en req.restaurantId');
      return res.status(403).json({ error: 'No se pudo determinar el restaurante. Contacta al administrador.' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar que el restaurante existe y está activo
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id, active')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      console.error('Error: Restaurante no encontrado:', restaurantId);
      return res.status(403).json({ error: 'Restaurante no encontrado' });
    }

    if (!restaurant.active) {
      return res.status(403).json({ error: 'El restaurante está inactivo' });
    }

    console.log('🔵 [PRODUCTS] Creando producto para restaurante:', restaurantId);
    console.log('🔵 [PRODUCTS] Datos del producto:', { name, price, category, restaurant_id: restaurantId });

    const productData = {
      name,
      description,
      price,
      category,
      image_url,
      active: active !== undefined ? active : true,
      restaurant_id: restaurantId, // Asociar producto al restaurante
    };

    console.log('🔵 [PRODUCTS] Datos a insertar:', JSON.stringify(productData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('❌ [PRODUCTS] Error al insertar producto:', error);
      console.error('❌ [PRODUCTS] Detalles del error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ [PRODUCTS] Producto creado exitosamente:', data.id);
    console.log('✅ [PRODUCTS] Producto creado con restaurant_id:', data.restaurant_id);
    console.log('✅ [PRODUCTS] Datos completos del producto creado:', JSON.stringify(data, null, 2));
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
