import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import CustomSelect from '../../components/common/CustomSelect';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState([]);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    items: [],
    total_amount: '0.00',
    payment_method: '',
    table_number: '',
    scheduled_delivery_time: '',
  });

  useEffect(() => {
    fetchOrder();
    fetchProducts();
    fetchExtras();
  }, [id]);

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

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(token, id);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateOrder(token, id, { status: newStatus });
      fetchOrder();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    try {
      await api.updateOrder(token, id, { payment_status: newPaymentStatus });
      fetchOrder();
    } catch (error) {
      console.error('Error updating payment status:', error);
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

  const handleEditClick = () => {
    if (!order) return;
    setEditFormData({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      customer_address: order.customer_address || '',
      items: (order.order_items || []).map(item => ({
        product_id: item.product_id || null,
        name: item.product_name || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        extras: [],
      })),
      total_amount: order.total_amount || '0.00',
      payment_method: order.payment_method || '',
      table_number: order.table_number || '',
      scheduled_delivery_time: order.scheduled_delivery_time || '',
    });
    setShowEditModal(true);
  };

  const handleEditItemChange = (index, field, value) => {
    setEditFormData(prev => {
      const newItems = [...prev.items];
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        let price = 0;
        if (product) {
          price = typeof product.price === 'string' 
            ? parseFloat(product.price.replace(',', '.')) 
            : parseFloat(product.price) || 0;
        }
        newItems[index] = {
          ...newItems[index],
          product_id: value || null,
          name: product ? product.name : '',
          unit_price: price,
        };
      } else if (field === 'quantity') {
        newItems[index] = { ...newItems[index], quantity: parseInt(value) || 1 };
      } else if (field === 'unit_price') {
        newItems[index] = { ...newItems[index], unit_price: parseFloat(value) || 0 };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      
      const total = newItems.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      }, 0);
      
      return {
        ...prev,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const handleAddItem = () => {
    setEditFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: null, name: '', quantity: 1, unit_price: 0, extras: [] }],
    }));
  };

  const handleRemoveItem = (index) => {
    setEditFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      }, 0);
      return {
        ...prev,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const items = editFormData.items.map(item => ({
        product_id: item.product_id || null,
        name: item.name || 'Producto sin nombre',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
      }));

      const orderData = {
        customer_name: editFormData.customer_name,
        customer_phone: editFormData.customer_phone,
        customer_address: editFormData.customer_address || null,
        items,
        total_amount: parseFloat(editFormData.total_amount) || 0,
        payment_method: editFormData.payment_method || null,
        table_number: editFormData.table_number || null,
        scheduled_delivery_time: editFormData.scheduled_delivery_time || null,
      };

      await api.updateOrderFull(token, id, orderData);
      setShowEditModal(false);
      fetchOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar pedido: ' + (error.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Pedido no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {new Date(order.created_at).toLocaleString('es-ES')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <CustomSelect
            value={order.status}
            onChange={handleStatusChange}
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'en_proceso', label: 'En Proceso' },
              { value: 'finalizado', label: 'Listo para retirar' },
              { value: 'entregado', label: 'Entregado' },
            ]}
            getColorClass={getStatusColor}
            getLabel={getStatusLabel}
            className="min-w-[160px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Información del Cliente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-gray-900">Nombre:</span>
              <span className="ml-2">{order.customer_name}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium text-gray-900">Teléfono:</span>
              <a href={`tel:${order.customer_phone}`} className="ml-2 text-indigo-600 hover:text-indigo-800">
                {order.customer_phone}
              </a>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span className="font-medium text-gray-900">Dirección:</span>
                <p className="ml-2">{order.customer_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Pedido */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Pedido</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estado:</span>
              <span className="font-medium text-gray-900">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Método de Pago:</span>
              <span className="font-medium text-gray-900">{order.payment_method || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Estado de Pago:</span>
              <CustomSelect
                value={order.payment_status || 'pendiente'}
                onChange={handlePaymentStatusChange}
                options={[
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'pagado', label: 'Pagado' },
                  { value: 'cancelado', label: 'Cancelado' },
                  { value: 'reembolsado', label: 'Reembolsado' },
                ]}
                getColorClass={getPaymentStatusColor}
                getLabel={getPaymentStatusLabel}
                className="min-w-[140px]"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Repartidor:</span>
              <span className="font-medium text-gray-900">
                {order.rider ? order.rider.name : 'Sin asignar'}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">${order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items del Pedido */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items del Pedido</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.order_items && order.order_items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${item.unit_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.quantity * item.unit_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Eventos */}
      {order.events && order.events.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {order.events.map((event, idx) => (
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== order.events.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {new Date(event.created_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Editar Pedido</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Información del Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Cliente *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.customer_name}
                      onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.customer_phone}
                      onChange={(e) => setEditFormData({ ...editFormData, customer_phone: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editFormData.customer_address}
                    onChange={(e) => setEditFormData({ ...editFormData, customer_address: e.target.value })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                  />
                </div>

                {/* Campos adicionales para comandas */}
                {(order?.order_type === 'dine_in' || order?.order_type === 'takeout') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número de Mesa</label>
                      <input
                        type="number"
                        value={editFormData.table_number}
                        onChange={(e) => setEditFormData({ ...editFormData, table_number: e.target.value })}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Horario Específico</label>
                      <input
                        type="text"
                        placeholder="Ej: 15:45 o En 30 minutos"
                        value={editFormData.scheduled_delivery_time}
                        onChange={(e) => setEditFormData({ ...editFormData, scheduled_delivery_time: e.target.value })}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Items del Pedido */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Items del Pedido *</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Agregar Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editFormData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <select
                          value={item.product_id || ''}
                          onChange={(e) => handleEditItemChange(index, 'product_id', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={item.name}
                          onChange={(e) => handleEditItemChange(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="Cantidad"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          value={item.unit_price}
                          onChange={(e) => handleEditItemChange(index, 'unit_price', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {editFormData.items.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No hay items. Agrega al menos uno.</p>
                  )}
                </div>

                {/* Método de Pago y Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select
                      value={editFormData.payment_method}
                      onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Seleccionar método</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="no_definido">No definido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                      type="text"
                      value={`$${editFormData.total_amount}`}
                      readOnly
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-gray-50 sm:text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editFormData.items.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Guardar Cambios
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
