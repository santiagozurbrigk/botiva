import express from 'express';

const router = express.Router();

// GET /api/kitchen/orders - Obtener pedidos pendientes para cocina
// Este endpoint es público (sin autenticación) para facilitar el acceso desde tablets
// En producción, se puede agregar autenticación específica si es necesario
router.get('/orders', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    // Obtener pedidos pendientes de tipo dine_in o takeout
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        waiter:waiters(id, name),
        order_items(*)
      `)
      .eq('status', 'pendiente')
      .in('order_type', ['dine_in', 'takeout'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(orders || []);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de cocina' });
  }
});

// PATCH /api/kitchen/orders/:id/status - Actualizar estado de pedido (de pendiente a listo para retirar)
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Validar que el estado sea válido
    if (status !== 'listo para retirar') {
      return res.status(400).json({ error: 'Estado inválido. Solo se puede cambiar a "listo para retirar"' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar que el pedido existe y está en estado pendiente
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('status', 'pendiente')
      .in('order_type', ['dine_in', 'takeout'])
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Pedido no encontrado o no está pendiente' });
    }

    // Actualizar estado
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        waiter:waiters(id, name),
        order_items(*)
      `)
      .single();

    if (updateError) throw updateError;

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating kitchen order status:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
});

export default router;

