import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener pedidos de cocina (sin token, endpoint público)
  const fetchInitialKitchenOrders = useCallback(async () => {
    try {
      const data = await api.getKitchenOrders();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      return [];
    }
  }, []);

  // Usar hook de Realtime para actualizaciones en tiempo real
  // Nota: El hook espera un token, pero para cocina no lo necesitamos
  // Vamos a pasar null y modificar el hook si es necesario, o crear uno específico
  // Por ahora, usaremos polling cada 5 segundos para cocina
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getKitchenOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await api.updateKitchenOrderStatus(orderId, 'listo para retirar');
      // Actualizar estado local inmediatamente
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'listo para retirar' } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">Cargando comandas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Cocina</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comandas pendientes - {orders.length} {orders.length === 1 ? 'comanda' : 'comandas'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay comandas pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Mesa {order.table_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.waiter?.name || 'Sin mozo asignado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Hora</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(order.created_at)}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Cliente:</span> {order.customer_name}
                  </div>
                  {order.customer_phone && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Tel:</span> {order.customer_phone}
                    </div>
                  )}
                  {order.scheduled_delivery_time && (
                    <div className="text-sm text-orange-600 font-medium mb-2 bg-orange-50 p-2 rounded">
                      ⏰ Para: {formatDateTime(order.scheduled_delivery_time)}
                    </div>
                  )}
                </div>

                <div className="mb-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Productos:</h4>
                  <ul className="space-y-2">
                    {order.order_items && order.order_items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-900">
                        <span className="font-medium">{item.quantity}x</span> {item.product_name}
                        {item.unit_price && (
                          <span className="text-gray-500 ml-2">
                            (${parseFloat(item.unit_price).toFixed(2)})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  {order.payment_method && (
                    <div className="text-xs text-gray-500 mt-1">
                      Pago: {order.payment_method}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleMarkReady(order.id)}
                  className="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  ✓ Marcar como Listo para Retirar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

