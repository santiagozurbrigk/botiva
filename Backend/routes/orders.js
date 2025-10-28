import express from 'express';
import { authenticateAdmin, authenticateRider } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders - Crear pedido (llamado por n8n)
router.post('/', async (req, res) => {
  try {
    const { external_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method } = req.body;

    // Validación básica
    if (!external_id || !customer_name || !customer_phone || !items || !total_amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Verificar si el pedido ya existe (por external_id)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('external_id', external_id)
      .single();

    if (existingOrder) {
      return res.status(409).json({ error: 'El pedido ya existe' });
    }

    // Crear el pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        external_id,
        customer_name,
        customer_phone,
        customer_address,
        total_amount,
        payment_method,
        status: 'pendiente',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear los items del pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Registrar evento
    await supabaseAdmin
      .from('order_events')
      .insert({
        order_id: order.id,
        event_type: 'created',
        description: 'Pedido creado desde WhatsApp',
      });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// GET /api/orders - Listar pedidos
router.get('/', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { status, rider_id, date_from, date_to } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        rider:riders(id, name, phone),
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (rider_id) {
      query = query.eq('assigned_rider_id', rider_id);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// GET /api/orders/:id - Obtener pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        rider:riders(id, name, phone),
        order_items(*),
        events:order_events(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
});

// PATCH /api/orders/:id - Actualizar pedido
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_rider_id, payment_status } = req.body;

    const { supabaseAdmin } = req.app.locals;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (assigned_rider_id !== undefined) {
      // Convertir cadena vacía a null para desasignar el repartidor
      updates.assigned_rider_id = assigned_rider_id === '' ? null : assigned_rider_id;
    }
    if (payment_status !== undefined) updates.payment_status = payment_status;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        rider:riders(id, name, phone),
        order_items(*)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Registrar evento
    let eventDescription = 'Pedido actualizado';
    if (status) {
      eventDescription = `Estado cambiado a: ${status}`;
    } else if (assigned_rider_id !== undefined) {
      if (assigned_rider_id === '' || assigned_rider_id === null) {
        eventDescription = 'Repartidor desasignado del pedido';
      } else {
        eventDescription = `Repartidor asignado al pedido`;
      }
    }

    await supabaseAdmin
      .from('order_events')
      .insert({
        order_id: id,
        event_type: 'updated',
        description: eventDescription,
      });

    res.json(data);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

// PATCH /api/orders/:id/status - Actualizar solo estado (para riders)
router.patch('/:id/status', authenticateRider, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const { supabaseAdmin } = req.app.locals;
    const riderId = req.user.rider.id;

    // Verificar que el pedido está asignado a este rider
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('assigned_rider_id', riderId)
      .single();

    if (orderError || !order) {
      return res.status(403).json({ error: 'No tienes acceso a este pedido' });
    }

    // Actualizar estado
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento
    await supabaseAdmin
      .from('order_events')
      .insert({
        order_id: id,
        event_type: 'status_changed',
        description: `Estado actualizado a: ${status}`,
      });

    res.json(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// PATCH /api/orders/:id/payment-status - Actualizar estado de pago (para riders)
router.patch('/:id/payment-status', authenticateRider, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: 'Estado de pago requerido' });
    }

    // Validar estado de pago
    const validStatuses = ['pendiente', 'pagado', 'cancelado', 'reembolsado'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Estado de pago inválido' });
    }

    const { supabaseAdmin } = req.app.locals;
    const riderId = req.user.rider.id;

    // Verificar que el pedido está asignado a este rider
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('assigned_rider_id', riderId)
      .single();

    if (orderError || !order) {
      return res.status(403).json({ error: 'No tienes acceso a este pedido' });
    }

    // Actualizar estado de pago
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento
    await supabaseAdmin
      .from('order_events')
      .insert({
        order_id: id,
        event_type: 'payment_status_changed',
        description: `Estado de pago cambiado a: ${payment_status}`,
      });

    res.json(data);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Error al actualizar estado de pago' });
  }
});

export default router;
