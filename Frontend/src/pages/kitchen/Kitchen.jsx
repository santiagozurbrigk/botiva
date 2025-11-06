import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api';
import SwipeableOrderCard from '../../components/kitchen/SwipeableOrderCard';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [hiddenOrderIds, setHiddenOrderIds] = useState(new Set());
  const hiddenOrderIdsRef = useRef(new Set());
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

  // Actualizar la referencia cuando cambie hiddenOrderIds
  useEffect(() => {
    hiddenOrderIdsRef.current = hiddenOrderIds;
  }, [hiddenOrderIds]);

  const fetchOrders = async () => {
    try {
      const data = await api.getKitchenOrders();
      const ordersArray = Array.isArray(data) ? data : [];
      // Filtrar comandas que ya están marcadas como "listo para retirar" o están ocultas
      setOrders(ordersArray.filter(order => 
        order.status === 'pendiente' && !hiddenOrderIdsRef.current.has(order.id)
      ));
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await api.updateKitchenOrderStatus(orderId, 'listo para retirar');
      // Ocultar la comanda de la vista ya que cambió de estado
      const newHiddenSet = new Set([...hiddenOrderIdsRef.current, orderId]);
      setHiddenOrderIds(newHiddenSet);
      hiddenOrderIdsRef.current = newHiddenSet;
      // Remover de la lista de órdenes visibles
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleHideOrder = (orderId) => {
    // Solo ocultar de la vista, no eliminar de la base de datos
    const newHiddenSet = new Set([...hiddenOrderIdsRef.current, orderId]);
    setHiddenOrderIds(newHiddenSet);
    hiddenOrderIdsRef.current = newHiddenSet;
    // Remover de la lista de órdenes visibles
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
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
              <div key={order.id} className="relative">
                <SwipeableOrderCard
                  order={order}
                  onSwipeRight={() => handleMarkReady(order.id)}
                  onSwipeLeft={() => handleHideOrder(order.id)}
                  formatTime={formatTime}
                  formatDateTime={formatDateTime}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

