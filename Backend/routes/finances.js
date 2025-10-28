import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/finances/summary - Resumen de finanzas
router.get('/summary', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { date_from, date_to } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('total_amount, status, payment_status, created_at');

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Calcular estadísticas
    const totalSales = orders
      .filter(o => o.status === 'entregado')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingPayments = orders
      .filter(o => o.payment_status === 'pendiente')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'entregado').length;

    // Ventas por día
    const salesByDay = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, total: 0 };
      }
      acc[date].count++;
      acc[date].total += order.total_amount;
      return acc;
    }, {});

    res.json({
      totalSales,
      pendingPayments,
      totalOrders,
      completedOrders,
      salesByDay: Object.values(salesByDay),
    });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen financiero' });
  }
});

// GET /api/finances/payments - Listar pagos
router.get('/payments', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// POST /api/finances/payments - Registrar pago
router.post('/payments', authenticateAdmin, async (req, res) => {
  try {
    const { order_id, amount, payment_method, notes } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { supabaseAdmin } = req.app.locals;

    // Crear registro de pago
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id,
        amount,
        payment_method,
        notes,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Actualizar estado de pago del pedido
    await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'pagado' })
      .eq('id', order_id);

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

export default router;

