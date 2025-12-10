import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import CustomSelect from '../../components/common/CustomSelect';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';

export default function Orders() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [deliveryConfig, setDeliveryConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmWeightModal, setShowConfirmWeightModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [weightFormData, setWeightFormData] = useState({ items: [], total_amount: '' });
  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    items: [],
    total_amount: '',
    payment_method: '',
    scheduled_delivery_time: '',
  });

  useEffect(() => {
    fetchRiders();
    fetchDeliveryConfig();
    fetchProducts();
    fetchExtras();
  }, [token, filter]);

  // Función para obtener pedidos iniciales (usada por Realtime)
  // useCallback asegura que la función no cambie en cada render
  const fetchInitialOrders = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const data = await api.getOrders(token, params);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.message && error.message.includes('No autorizado')) {
        logout();
        navigate('/login');
        return [];
      }
      return [];
    }
  }, [token, filter, logout, navigate]);

  // Usar hook de Realtime
  const { orders: realtimeOrders, loading: realtimeLoading, setOrders: setRealtimeOrders } = useRealtimeOrders(
    token,
    filter,
    fetchInitialOrders
  );

  // Sincronizar estado local con Realtime
  useEffect(() => {
    if (realtimeOrders.length > 0 || !realtimeLoading) {
      setOrders(realtimeOrders);
      setLoading(realtimeLoading);
    }
  }, [realtimeOrders, realtimeLoading]);

  // Mantener fetchOrders para compatibilidad y actualizaciones manuales
  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const data = await api.getOrders(token, params);
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      setRealtimeOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.message && error.message.includes('No autorizado')) {
        logout();
        navigate('/login');
        return;
      }
      setOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(token);
      setProducts(Array.isArray(data) ? data.filter(p => p.active) : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchExtras = async () => {
    try {
      const data = await api.getExtras(token);
      setExtras(Array.isArray(data) ? data.filter(e => e.active) : []);
    } catch (error) {
      console.error('Error fetching extras:', error);
      setExtras([]);
    }
  };

  const fetchRiders = async () => {
    try {
      const data = await api.getRiders(token);
      // Asegurarse de que siempre sea un array
      setRiders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching riders:', error);
      // Si es un error 401 (no autorizado), cerrar sesión
      if (error.message && error.message.includes('No autorizado')) {
        logout();
        navigate('/login');
        return;
      }
      setRiders([]); // Establecer array vacío en caso de error
    }
  };

  const fetchDeliveryConfig = async () => {
    try {
      const data = await api.getDeliveryConfig(token);
      setDeliveryConfig(data);
    } catch (error) {
      console.error('Error fetching delivery config:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrder(token, orderId, { status: newStatus });
      // No necesitamos llamar fetchOrders() porque Realtime actualizará automáticamente
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleRiderAssign = async (orderId, riderId) => {
    try {
      await api.updateOrder(token, orderId, { assigned_rider_id: riderId });
      // No necesitamos llamar fetchOrders() porque Realtime actualizará automáticamente
    } catch (error) {
      console.error('Error assigning rider:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await api.updateOrder(token, orderId, { payment_status: newPaymentStatus });
      // No necesitamos llamar fetchOrders() porque Realtime actualizará automáticamente
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleOpenConfirmWeight = (order) => {
    setSelectedOrder(order);
    // Inicializar formData con los items del pedido
    const itemsWithWeight = (order.order_items || []).map(item => ({
      id: item.id,
      name: item.product_name,
      weight_kg: item.weight_kg || '',
    }));
    setWeightFormData({
      items: itemsWithWeight,
      total_amount: order.total_amount > 0 ? order.total_amount : '',
    });
    setShowConfirmWeightModal(true);
  };

  const handleConfirmWeight = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.confirmOrderWeight(token, selectedOrder.id, {
        items: weightFormData.items,
        total_amount: parseFloat(weightFormData.total_amount),
      });
      setShowConfirmWeightModal(false);
      setSelectedOrder(null);
      setWeightFormData({ items: [], total_amount: '' });
      // Realtime actualizará automáticamente
    } catch (error) {
      console.error('Error confirming weight:', error);
      alert(error.message || 'Error al confirmar peso del pedido');
    }
  };

  const updateItemWeight = (index, weight) => {
    setWeightFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], weight_kg: weight };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: null, name: '', quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index) => {
    setFormData(prevFormData => {
      const newItems = prevFormData.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);
      return {
        ...prevFormData,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const updateItem = (index, field, value) => {
    setFormData(prevFormData => {
      const newItems = [...prevFormData.items];
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        let price = 0;
        if (product) {
          if (typeof product.price === 'string') {
            price = parseFloat(product.price.replace(',', '.')) || 0;
          } else {
            price = parseFloat(product.price) || 0;
          }
        }
        newItems[index] = {
          ...newItems[index],
          product_id: value || null,
          name: product ? product.name : '',
          unit_price: price,
        };
      } else if (field === 'quantity') {
        const numValue = parseFloat(value) || 1;
        newItems[index] = { ...newItems[index], quantity: numValue };
      } else if (field === 'unit_price') {
        const numValue = parseFloat(value) || 0;
        newItems[index] = { ...newItems[index], unit_price: numValue };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      
      // Calcular total con los nuevos items
      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);
      
      return {
        ...prevFormData,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const addExtraToItem = (itemIndex, extraId) => {
    setFormData(prevFormData => {
      const newItems = [...prevFormData.items];
      const extra = extras.find(e => e.id === extraId);
      if (!extra) return prevFormData;

      if (!newItems[itemIndex].extras) {
        newItems[itemIndex].extras = [];
      }

      const extraPrice = typeof extra.price === 'string' ? parseFloat(extra.price.replace(',', '.')) : parseFloat(extra.price);
      newItems[itemIndex].extras.push({
        extra_id: extra.id,
        name: extra.name,
        unit_price: extraPrice || 0,
      });

      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);

      return {
        ...prevFormData,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const removeExtraFromItem = (itemIndex, extraIndex) => {
    setFormData(prevFormData => {
      const newItems = [...prevFormData.items];
      if (newItems[itemIndex].extras) {
        newItems[itemIndex].extras = newItems[itemIndex].extras.filter((_, i) => i !== extraIndex);
      }

      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);

      return {
        ...prevFormData,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => {
      const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
        return extraSum + (parseFloat(extra.unit_price) || 0);
      }, 0);
      return sum + itemTotal + extrasTotal;
    }, 0);
    setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      // Generar external_id único
      const external_id = `MANUAL-${Date.now()}`;
      
      // Preparar items para el backend
      const items = formData.items.map(item => ({
        product_id: item.product_id || null,
        name: item.name || 'Producto sin nombre',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        extras: (item.extras || []).map(extra => ({
          extra_id: extra.extra_id || null,
          name: extra.name || 'Extra sin nombre',
          unit_price: parseFloat(extra.unit_price) || 0,
        })),
      }));

      const orderData = {
        external_id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address || null,
        items,
        total_amount: parseFloat(formData.total_amount) || 0,
        payment_method: formData.payment_method || null,
        scheduled_delivery_time: formData.scheduled_delivery_time || null,
      };

      await api.createOrder(token, orderData);
      setShowCreateModal(false);
      resetForm();
      // No necesitamos llamar fetchOrders() porque Realtime agregará el nuevo pedido automáticamente
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.message || 'Error al crear el pedido');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      items: [],
      total_amount: '',
      payment_method: '',
      scheduled_delivery_time: '',
    });
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

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'finalizado', label: 'Listo para retirar' },
    { value: 'entregado', label: 'Entregado' },
  ];

  const paymentStatusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagado', label: 'Pagado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'reembolsado', label: 'Reembolsado' },
  ];

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona los pedidos del restaurante</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-sm rounded-xl px-6 py-2"
        >
          + Nuevo Pedido
        </button>
      </div>

      {/* Configuración de entrega actual */}
      {deliveryConfig && deliveryConfig.delivery_cost !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Configuración de Entrega Actual</h3>
              <div className="mt-1 flex space-x-6 text-sm text-blue-700">
                <span>Tiempo de demora: <strong>{deliveryConfig.delivery_time_minutes || 0} minutos</strong></span>
                <span>Costo de envío: <strong>${(deliveryConfig.delivery_cost || 0).toFixed(2)}</strong></span>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/delivery-config')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Cambiar configuración →
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Todos', value: '' },
          { label: 'Pendientes', value: 'pendiente' },
          { label: 'En Proceso', value: 'en_proceso' },
          { label: 'Finalizados', value: 'finalizado' },
          { label: 'Entregados', value: 'entregado' },
        ].map(option => (
          <button
            key={option.value || 'all'}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repartidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className={order.pending_weight_confirmation ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      </div>
                      {order.pending_weight_confirmation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚖️ Pendiente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.pending_weight_confirmation ? (
                      <span className="text-gray-400 italic">Pendiente</span>
                    ) : (
                      `$${order.total_amount}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomSelect
                      value={order.status}
                      onChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      options={statusOptions}
                      getColorClass={getStatusColor}
                      getLabel={getStatusLabel}
                      className="min-w-[140px]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomSelect
                      value={order.payment_status || 'pendiente'}
                      onChange={(newPaymentStatus) => handlePaymentStatusChange(order.id, newPaymentStatus)}
                      options={paymentStatusOptions}
                      getColorClass={getPaymentStatusColor}
                      getLabel={getPaymentStatusLabel}
                      className="min-w-[140px]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.assigned_rider_id || ''}
                      onChange={(e) => handleRiderAssign(order.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sin asignar</option>
                      {riders.map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      {order.pending_weight_confirmation && (
                        <button
                          onClick={() => handleOpenConfirmWeight(order)}
                          className="text-yellow-600 hover:text-yellow-900 font-medium"
                        >
                          Confirmar Peso
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear pedido */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-6 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nuevo Pedido</h3>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                {/* Información del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Cliente *</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <textarea
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horario Específico (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_delivery_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_delivery_time: e.target.value })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Si el cliente quiere el pedido para un horario específico</p>
                </div>

                {/* Items del pedido */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Productos *</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Agregar Producto
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.items.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay productos agregados</p>
                    ) : (
                      formData.items.map((item, index) => (
                        <div key={index} className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
                              <select
                                value={item.product_id || ''}
                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                className="block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                              >
                                <option value="">Seleccionar producto...</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - ${product.price}
                                  </option>
                                ))}
                              </select>
                              {item.name && (
                                <div className="mt-2 p-2 bg-indigo-50 rounded-md border border-indigo-200">
                                  <p className="text-sm font-semibold text-indigo-900">{item.name}</p>
                                  {item.unit_price > 0 && (
                                    <p className="text-xs text-indigo-700">Precio: ${item.unit_price}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                className="block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit.</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price || 0}
                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                className="block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                              />
                            </div>
                          </div>
                          
                          {/* Extras para este item */}
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-medium text-gray-700">Extras</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addExtraToItem(index, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="block px-3 py-1.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-xs transition-colors bg-white"
                              >
                                <option value="">+ Agregar extra</option>
                                {extras.map((extra) => (
                                  <option key={extra.id} value={extra.id}>
                                    {extra.name} (+${extra.price})
                                  </option>
                                ))}
                              </select>
                            </div>
                            {item.extras && item.extras.length > 0 && (
                              <div className="space-y-1">
                                {item.extras.map((extra, extraIndex) => (
                                  <div key={extraIndex} className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200">
                                    <span className="text-sm text-gray-700">{extra.name} (+${extra.unit_price})</span>
                                    <button
                                      type="button"
                                      onClick={() => removeExtraFromItem(index, extraIndex)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar producto
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total y método de pago */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formData.items.length === 0}
                    className="btn-primary text-sm px-6 py-2 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Crear Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar peso */}
      {showConfirmWeightModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-6 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Peso y Total</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cliente: {selectedOrder.customer_name} - Pedido #{selectedOrder.external_id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmWeightModal(false);
                    setSelectedOrder(null);
                    setWeightFormData({ items: [], total_amount: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleConfirmWeight} className="space-y-4">
                {/* Items con peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Productos y Peso (kg)
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {weightFormData.items.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay productos en este pedido</p>
                    ) : (
                      weightFormData.items.map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Peso (kg):</label>
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={item.weight_kg || ''}
                              onChange={(e) => updateItemWeight(index, e.target.value)}
                              className="w-24 px-3 py-1.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm"
                              placeholder="0.000"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total del Pedido *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={weightFormData.total_amount}
                    onChange={(e) => setWeightFormData({ ...weightFormData, total_amount: e.target.value })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                    placeholder="0.00"
                  />
                </div>

                {/* Botones */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmWeightModal(false);
                      setSelectedOrder(null);
                      setWeightFormData({ items: [], total_amount: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-sm px-6 py-2 rounded-xl"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

