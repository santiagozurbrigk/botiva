import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import CustomSelect from '../../components/common/CustomSelect';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';

export default function RiderDashboard() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener pedidos iniciales (usada por Realtime)
  const fetchInitialOrders = async () => {
    try {
      const data = await api.getOrders(token, { rider_id: user.rider.id });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  // Usar hook de Realtime
  const { orders: realtimeOrders, loading: realtimeLoading, setOrders: setRealtimeOrders } = useRealtimeOrders(
    token,
    '',
    fetchInitialOrders
  );

  // Sincronizar estado local con Realtime
  useEffect(() => {
    if (realtimeOrders.length > 0 || !realtimeLoading) {
      // Filtrar solo los pedidos asignados a este rider
      const riderOrders = realtimeOrders.filter(order => 
        order.assigned_rider_id === user.rider.id
      );
      setOrders(riderOrders);
      setLoading(realtimeLoading);
    }
  }, [realtimeOrders, realtimeLoading, user.rider.id]);

  // Mantener fetchOrders para compatibilidad
  const fetchOrders = async () => {
    try {
      const data = await api.getOrders(token, { rider_id: user.rider.id });
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      setRealtimeOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(token, orderId, newStatus);
      // No necesitamos llamar fetchOrders() porque Realtime actualizará automáticamente
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      finalizado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      pagado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      reembolsado: 'bg-gray-100 text-gray-800',
    };
    return colors[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      finalizado: 'Listo para retirar',
      entregado: 'Entregado',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    const labels = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      cancelado: 'Cancelado',
      reembolsado: 'Reembolsado',
    };
    return labels[paymentStatus] || paymentStatus;
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hola {user.rider.name}, aquí están tus pedidos asignados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id.slice(0, 8)}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {order.customer_name}
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {order.customer_phone}
                  </div>
                  <div className="flex items-start">
                    <svg className="h-4 w-4 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="flex-1">{order.customer_address}</span>
                    {order.customer_address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        title="Abrir en Google Maps"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Maps
                      </a>
                    )}
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total: ${order.total_amount}
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-gray-600">Pago: </span>
                    <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status || 'pendiente')}`}>
                      {getPaymentStatusLabel(order.payment_status || 'pendiente')}
                    </span>
                  </div>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                    <ul className="space-y-1">
                      {order.order_items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          {item.quantity}x {item.product_name} - ${item.unit_price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="ml-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado del Pedido</label>
                  <CustomSelect
                    value={order.status}
                    onChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                    options={[
                      { value: 'pendiente', label: 'Pendiente' },
                      { value: 'en_proceso', label: 'En Proceso' },
                      { value: 'finalizado', label: 'Listo para retirar' },
                      { value: 'entregado', label: 'Entregado' },
                    ]}
                    getColorClass={getStatusColor}
                    getLabel={getStatusLabel}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin pedidos asignados</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes pedidos asignados en este momento.
          </p>
        </div>
      )}
    </div>
  );
}

