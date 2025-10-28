import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/delivery-config - Obtener configuración actual
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('delivery_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (!data) {
      // Si no hay configuración activa, crear una por defecto
      const { data: newConfig, error: insertError } = await supabaseAdmin
        .from('delivery_config')
        .insert({
          delivery_time_minutes: 30,
          delivery_cost: 0.00,
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json(newConfig);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching delivery config:', error);
    res.status(500).json({ error: 'Error al obtener configuración de entrega' });
  }
});

// PUT /api/delivery-config - Actualizar configuración
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { delivery_time_minutes, delivery_cost } = req.body;
    const { supabaseAdmin } = req.app.locals;

    // Validar datos de entrada
    if (delivery_time_minutes === undefined || delivery_cost === undefined) {
      return res.status(400).json({ 
        error: 'Se requieren delivery_time_minutes y delivery_cost' 
      });
    }

    if (delivery_time_minutes < 0 || delivery_cost < 0) {
      return res.status(400).json({ 
        error: 'Los valores no pueden ser negativos' 
      });
    }

    // Desactivar configuración actual
    await supabaseAdmin
      .from('delivery_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Crear nueva configuración activa
    const { data, error } = await supabaseAdmin
      .from('delivery_config')
      .insert({
        delivery_time_minutes: parseInt(delivery_time_minutes),
        delivery_cost: parseFloat(delivery_cost),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating delivery config:', error);
    res.status(500).json({ error: 'Error al actualizar configuración de entrega' });
  }
});

// GET /api/delivery-config/history - Obtener historial de configuraciones
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('delivery_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching delivery config history:', error);
    res.status(500).json({ error: 'Error al obtener historial de configuración' });
  }
});

export default router;
