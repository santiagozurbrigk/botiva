import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import MenuView from '../../components/waiter/MenuView';

export default function WaiterDashboard() {
  const { token, user } = useAuth();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showComandaModal, setShowComandaModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    items: [],
    total_amount: '0.00',
    payment_method: 'no_definido',
    scheduled_delivery_time: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    fetchProducts();
    fetchExtras();
  }, [token]);

  const fetchTables = async () => {
    try {
      const data = await api.getMyTables(token);
      setTables(data.map(t => t.table_number).sort((a, b) => a - b));
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setLoading(false);
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

  const handleTableClick = (tableNumber) => {
    setSelectedTable(tableNumber);
    setFormData({
      items: [],
      total_amount: '0.00',
      payment_method: 'no_definido',
      scheduled_delivery_time: '',
    });
    setShowMenu(false);
    setShowComandaModal(true);
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
    calculateTotal();
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
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
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return { ...prev, items: newItems };
    });
    calculateTotal();
  };

  const addExtraToItem = (itemIndex, extraId) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const extra = extras.find(e => e.id === extraId);
      if (!extra) return prev;

      if (!newItems[itemIndex].extras) {
        newItems[itemIndex].extras = [];
      }

      const extraPrice = typeof extra.price === 'string' 
        ? parseFloat(extra.price.replace(',', '.')) 
        : parseFloat(extra.price) || 0;

      newItems[itemIndex].extras.push({
        extra_id: extra.id,
        name: extra.name,
        unit_price: extraPrice,
      });

      return { ...prev, items: newItems };
    });
    calculateTotal();
  };

  const removeExtraFromItem = (itemIndex, extraIndex) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      if (newItems[itemIndex].extras) {
        newItems[itemIndex].extras = newItems[itemIndex].extras.filter((_, i) => i !== extraIndex);
      }
      return { ...prev, items: newItems };
    });
    calculateTotal();
  };

  const calculateTotal = () => {
    setTimeout(() => {
      setFormData(prev => {
        const total = prev.items.reduce((sum, item) => {
          const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
          const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
            return extraSum + (parseFloat(extra.unit_price) || 0);
          }, 0);
          return sum + itemTotal + extrasTotal;
        }, 0);
        return { ...prev, total_amount: total.toFixed(2) };
      });
    }, 0);
  };

  const handleAddProductFromMenu = (productData) => {
    setFormData(prev => {
      const newItems = [...prev.items, productData];
      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);
      return {
        ...prev,
        items: newItems,
        total_amount: total.toFixed(2),
      };
    });
  };

  const handleCreateComanda = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Por favor agrega al menos un producto a la comanda');
      return;
    }

    try {
      const items = formData.items.map(item => ({
        product_id: item.product_id || null,
        name: item.name || 'Producto sin nombre',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        extras: item.extras || [],
      }));

      const comandaData = {
        customer_name: 'Cliente de mesa', // Nombre por defecto para comandas
        customer_phone: '', // No requerido para comandas
        items,
        total_amount: parseFloat(formData.total_amount) || 0,
        payment_method: formData.payment_method || 'no_definido',
        table_number: selectedTable,
        scheduled_delivery_time: formData.scheduled_delivery_time || null,
      };

      await api.createComanda(token, comandaData);
      alert('Comanda creada exitosamente');
      setShowComandaModal(false);
      setShowMenu(false);
      setSelectedTable(null);
      setFormData({
        items: [],
        total_amount: '0.00',
        payment_method: 'no_definido',
        scheduled_delivery_time: '',
      });
    } catch (error) {
      console.error('Error creating comanda:', error);
      alert('Error al crear comanda: ' + (error.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando mesas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tomar Comanda</h1>
        <p className="mt-1 text-sm text-gray-600">Selecciona una mesa para tomar la comanda</p>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {tables.map((tableNumber) => (
          <button
            key={tableNumber}
            onClick={() => handleTableClick(tableNumber)}
            className="aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center justify-center text-2xl font-bold transition-colors"
          >
            {tableNumber}
          </button>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">No tienes mesas asignadas. Contacta al administrador.</p>
        </div>
      )}

      {/* Modal de Comanda */}
      {showComandaModal && selectedTable && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nueva Comanda - Mesa {selectedTable}
                </h3>
                <button
                  onClick={() => {
                    setShowComandaModal(false);
                    setShowMenu(false);
                    setSelectedTable(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {showMenu ? (
                <div className="mt-4">
                  <MenuView
                    products={products}
                    extras={extras}
                    onAddProduct={handleAddProductFromMenu}
                    onBack={() => setShowMenu(false)}
                  />
                </div>
              ) : (
                <form onSubmit={handleCreateComanda} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horario Específico (Opcional)</label>
                    <input
                      type="text"
                      value={formData.scheduled_delivery_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_delivery_time: e.target.value })}
                      className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors bg-white"
                      placeholder="Ej: Para las 20:00, En 30 minutos, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">Escribe el horario específico si el cliente lo solicita</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Productos</label>
                      <button
                        type="button"
                        onClick={() => setShowMenu(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        📋 Ver Menú
                      </button>
                    </div>
                    {formData.items.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 mb-2">No hay productos agregados</p>
                        <button
                          type="button"
                          onClick={() => setShowMenu(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Agregar desde el menú
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.quantity}x</span>
                                  <span className="text-gray-700">{item.name}</span>
                                  <span className="text-sm text-gray-500">
                                    (${parseFloat(item.unit_price || 0).toFixed(2)} c/u)
                                  </span>
                                </div>
                                {item.extras && item.extras.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {item.extras.map((extra, extraIndex) => (
                                      <span key={extraIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">
                                        +{extra.name}
                                        <button
                                          type="button"
                                          onClick={() => removeExtraFromItem(index, extraIndex)}
                                          className="ml-1 text-indigo-600 hover:text-indigo-900"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="mt-2">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        addExtraToItem(index, e.target.value);
                                        e.target.value = '';
                                      }
                                    }}
                                    className="block w-full px-2 py-1 text-xs rounded border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                                  >
                                    <option value="">Agregar extra...</option>
                                    {extras.map(extra => (
                                      <option key={extra.id} value={extra.id}>
                                        {extra.name} (+${parseFloat(extra.price || 0).toFixed(2)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = Math.max(1, (item.quantity || 1) - 1);
                                    updateItem(index, 'quantity', newQuantity);
                                  }}
                                  className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-gray-700 font-bold"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = (item.quantity || 1) + 1;
                                    updateItem(index, 'quantity', newQuantity);
                                  }}
                                  className="w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="ml-2 px-2 py-1 text-red-600 hover:text-red-900 text-sm"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="mt-1 block w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-white"
                      >
                        <option value="no_definido">No definido</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <div className="mt-1 px-4 py-2.5 bg-gray-100 rounded-lg text-lg font-bold text-gray-900">
                        ${formData.total_amount}
                      </div>
                    </div>
                  </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowComandaModal(false);
                      setShowMenu(false);
                      setSelectedTable(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Crear Comanda
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

