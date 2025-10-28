import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function DeliveryConfig() {
  const { token } = useAuth();
  const [config, setConfig] = useState({
    delivery_time_minutes: 30,
    delivery_cost: 0.00
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [token]);

  const fetchConfig = async () => {
    try {
      const data = await api.getDeliveryConfig(token);
      setConfig(data);
    } catch (error) {
      console.error('Error fetching delivery config:', error);
      setMessage('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.getDeliveryConfigHistory(token);
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      setMessage('Error al cargar el historial');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.updateDeliveryConfig(token, config);
      setMessage('Configuración actualizada correctamente');
      fetchConfig(); // Recargar configuración actual
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage('Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'delivery_time_minutes' ? parseInt(value) || 0 : parseFloat(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Configuración de Entrega
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configura el tiempo de demora y costo de envío para todos los pedidos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="delivery_time_minutes" className="block text-sm font-medium text-gray-700">
                Tiempo de Demora (minutos)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="delivery_time_minutes"
                  id="delivery_time_minutes"
                  value={config.delivery_time_minutes}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="block w-full pr-3 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="30"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">min</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Tiempo estimado de preparación y entrega
              </p>
            </div>

            <div>
              <label htmlFor="delivery_cost" className="block text-sm font-medium text-gray-700">
                Costo de Envío
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="delivery_cost"
                  id="delivery_cost"
                  value={config.delivery_cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="block w-full pr-3 pl-7 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Costo adicional por envío a domicilio
              </p>
            </div>
          </div>

          {message && (
            <div className={`rounded-md p-4 ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${
                message.includes('Error') ? 'text-red-800' : 'text-green-800'
              }`}>
                {message}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ver Historial
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de configuraciones */}
      {showHistory && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Historial de Configuraciones
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cambios realizados en la configuración de entrega
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className={item.is_active ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.delivery_time_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.delivery_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setShowHistory(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
