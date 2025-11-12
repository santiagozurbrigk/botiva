import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/finances/summary - Resumen de finanzas
router.get('/summary', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { date_from, date_to } = req.query;
    const restaurantId = req.restaurantId; // Obtener restaurant_id del middleware

    let query = supabaseAdmin
      .from('orders')
      .select('total_amount, status, payment_status, created_at')
      .eq('restaurant_id', restaurantId); // Filtrar por restaurant_id

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
    const restaurantId = req.restaurantId;

    // Obtener pagos a través de orders (ya que payments puede no tener restaurant_id directamente)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId);

    if (ordersError) throw ordersError;

    const orderIds = orders?.map(o => o.id) || [];

    let query = supabaseAdmin
      .from('payments')
      .select('*');

    // Si hay orders, filtrar por order_id, si no, retornar array vacío
    if (orderIds.length > 0) {
      query = query.in('order_id', orderIds);
    } else {
      return res.json([]);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
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

// GET /api/finances/statistics - Estadísticas completas del negocio
router.get('/statistics', authenticateAdmin, async (req, res) => {
  try {
    const { supabaseAdmin } = req.app.locals;
    const { date_from, date_to } = req.query;

    // Calcular fechas por defecto (últimos 30 días)
    const defaultDateTo = new Date();
    const defaultDateFrom = new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);

    const dateFrom = date_from || defaultDateFrom.toISOString();
    const dateTo = date_to || defaultDateTo.toISOString();

    // Obtener restaurant_id del admin autenticado
    const restaurantId = req.restaurantId;

    // ========== ESTADÍSTICAS FINANCIERAS ==========
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        waiter:waiters(id, name),
        rider:riders(id, name),
        order_items(*)
      `)
      .eq('restaurant_id', restaurantId) // Filtrar por restaurant_id
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    if (ordersError) throw ordersError;

    const financialStats = {
      totalSales: orders
        .filter(o => o.status === 'entregado')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      pendingPayments: orders
        .filter(o => o.payment_status === 'pendiente')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      paidAmount: orders
        .filter(o => o.payment_status === 'pagado')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      salesByPaymentMethod: orders.reduce((acc, o) => {
        const method = o.payment_method || 'no_definido';
        if (!acc[method]) acc[method] = 0;
        if (o.status === 'entregado') {
          acc[method] += parseFloat(o.total_amount || 0);
        }
        return acc;
      }, {}),
      salesByDay: orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, count: 0, total: 0 };
        }
        if (order.status === 'entregado') {
          acc[date].count++;
          acc[date].total += parseFloat(order.total_amount || 0);
        }
        return acc;
      }, {}),
    };

    // ========== ESTADÍSTICAS DEL NEGOCIO ==========
    const businessStats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'entregado').length,
      pendingOrders: orders.filter(o => o.status === 'pendiente').length,
      inProcessOrders: orders.filter(o => o.status === 'en_proceso').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelado').length,
      ordersByType: orders.reduce((acc, o) => {
        const type = o.order_type || 'delivery';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      ordersByStatus: orders.reduce((acc, o) => {
        const status = o.status || 'pendiente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) / orders.length
        : 0,
      ordersByHour: orders.reduce((acc, o) => {
        const hour = new Date(o.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {}),
    };

    // ========== ESTADÍSTICAS DE MOZOS ==========
    const { data: waiters, error: waitersError } = await supabaseAdmin
      .from('waiters')
      .select('id, name, active');

    if (waitersError) throw waitersError;

    const waiterStats = waiters.map(waiter => {
      const waiterOrders = orders.filter(o => o.waiter_id === waiter.id);
      const completedWaiterOrders = waiterOrders.filter(o => o.status === 'entregado');
      
      // Calcular tiempo promedio de comandas (si hay eventos de tiempo)
      const avgTime = completedWaiterOrders.length > 0
        ? completedWaiterOrders.reduce((sum, o) => {
            // Intentar calcular tiempo desde created_at hasta updated_at o status change
            const created = new Date(o.created_at);
            const updated = o.updated_at ? new Date(o.updated_at) : new Date();
            const diffMinutes = (updated - created) / (1000 * 60);
            return sum + diffMinutes;
          }, 0) / completedWaiterOrders.length
        : 0;

      return {
        id: waiter.id,
        name: waiter.name,
        active: waiter.active,
        totalComandas: waiterOrders.length,
        completedComandas: completedWaiterOrders.length,
        totalRevenue: completedWaiterOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
        averageTime: Math.round(avgTime),
        averageOrderValue: completedWaiterOrders.length > 0
          ? completedWaiterOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) / completedWaiterOrders.length
          : 0,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ========== ESTADÍSTICAS DE COCINA ==========
    const kitchenOrders = orders.filter(o => 
      ['dine_in', 'takeout'].includes(o.order_type) && 
      ['pendiente', 'en_proceso', 'listo_para_retirar', 'entregado'].includes(o.status)
    );

    const kitchenStats = {
      totalKitchenOrders: kitchenOrders.length,
      pendingKitchenOrders: kitchenOrders.filter(o => o.status === 'pendiente').length,
      inProcessKitchenOrders: kitchenOrders.filter(o => o.status === 'en_proceso').length,
      readyKitchenOrders: kitchenOrders.filter(o => o.status === 'listo_para_retirar').length,
      averagePreparationTime: kitchenOrders
        .filter(o => o.status === 'entregado' && o.updated_at)
        .reduce((acc, o) => {
          const created = new Date(o.created_at);
          const updated = new Date(o.updated_at);
          const diffMinutes = (updated - created) / (1000 * 60);
          return acc + diffMinutes;
        }, 0) / (kitchenOrders.filter(o => o.status === 'entregado' && o.updated_at).length || 1),
      ordersByHour: kitchenOrders.reduce((acc, o) => {
        const hour = new Date(o.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {}),
      mostOrderedItems: orders.reduce((acc, o) => {
        if (o.order_items && Array.isArray(o.order_items)) {
          o.order_items.forEach(item => {
            const productName = item.product_name || 'Desconocido';
            acc[productName] = (acc[productName] || 0) + (item.quantity || 1);
          });
        }
        return acc;
      }, {}),
    };

    // Convertir mostOrderedItems a array y ordenar
    kitchenStats.mostOrderedItems = Object.entries(kitchenStats.mostOrderedItems)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // ========== ESTADÍSTICAS DE REPARTIDORES ==========
    const { data: riders, error: ridersError } = await supabaseAdmin
      .from('riders')
      .select('id, name, active');

    if (ridersError) throw ridersError;

    const riderStats = riders.map(rider => {
      const riderOrders = orders.filter(o => o.assigned_rider_id === rider.id);
      const deliveredOrders = riderOrders.filter(o => o.status === 'entregado');
      
      // Calcular tiempo promedio de entrega
      const avgDeliveryTime = deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, o) => {
            const created = new Date(o.created_at);
            const updated = o.updated_at ? new Date(o.updated_at) : new Date();
            const diffMinutes = (updated - created) / (1000 * 60);
            return sum + diffMinutes;
          }, 0) / deliveredOrders.length
        : 0;

      return {
        id: rider.id,
        name: rider.name,
        active: rider.active,
        totalDeliveries: riderOrders.length,
        completedDeliveries: deliveredOrders.length,
        totalRevenue: deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
        averageDeliveryTime: Math.round(avgDeliveryTime),
        averageOrderValue: deliveredOrders.length > 0
          ? deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) / deliveredOrders.length
          : 0,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ========== ESTADÍSTICAS DE PRODUCTOS ==========
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, category, active');

    if (productsError) throw productsError;

    const productStats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.active).length,
      productsByCategory: products.reduce((acc, p) => {
        const category = p.category || 'Sin categoría';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      topProducts: orders.reduce((acc, o) => {
        if (o.order_items && Array.isArray(o.order_items)) {
          o.order_items.forEach(item => {
            const productId = item.product_id;
            const productName = item.product_name || 'Desconocido';
            if (!acc[productId]) {
              acc[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
            }
            acc[productId].quantity += (item.quantity || 1);
            acc[productId].revenue += parseFloat(item.unit_price || 0) * (item.quantity || 1);
          });
        }
        return acc;
      }, {}),
    };

    // Convertir topProducts a array y ordenar
    productStats.topProducts = Object.values(productStats.topProducts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      period: {
        from: dateFrom,
        to: dateTo,
      },
      financial: financialStats,
      business: businessStats,
      waiters: waiterStats,
      kitchen: kitchenStats,
      riders: riderStats,
      products: productStats,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;

