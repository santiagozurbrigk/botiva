import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id, token]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRestaurantDetails(token, id);
      setRestaurant(data.restaurant);
      setAdmins(data.admins);
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError(err.message || 'Error al obtener detalles del restaurante');
      if (err.message && err.message.includes('No autorizado')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('UUID copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('UUID copiado al portapapeles');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando detalles del restaurante...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => navigate('/super-admin')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Restaurante no encontrado</p>
        <button
          onClick={() => navigate('/super-admin')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/super-admin')}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Volver a restaurantes
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-gray-600">Detalles y estadísticas del restaurante</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            restaurant.active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {restaurant.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Información del Restaurante */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Restaurante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant ID (UUID)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 font-mono break-all">
                {restaurant.id}
              </code>
              <button
                onClick={() => copyToClipboard(restaurant.id)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                title="Copiar UUID"
              >
                📋 Copiar
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Usa este ID para configurar n8n y vincular pedidos a este restaurante</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{restaurant.email}</p>
          </div>
          {restaurant.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <p className="mt-1 text-sm text-gray-900">{restaurant.phone}</p>
            </div>
          )}
          {restaurant.address && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <p className="mt-1 text-sm text-gray-900">{restaurant.address}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado de Suscripción</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{restaurant.subscription_status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(restaurant.created_at)}</p>
          </div>
          {restaurant.subscription_end_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Suscripción hasta</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(restaurant.subscription_end_date)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Pedidos Totales</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{statistics.totalOrders}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(statistics.totalRevenue)}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Productos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {statistics.activeProducts} / {statistics.totalProducts}
            </p>
            <p className="mt-1 text-xs text-gray-500">activos / totales</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Personal</h3>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              Mozos: {statistics.activeWaiters} / {statistics.totalWaiters}
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              Repartidores: {statistics.activeRiders} / {statistics.totalRiders}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Pedidos Pendientes</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{statistics.pendingOrders}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500">Pedidos Completados</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{statistics.completedOrders}</p>
          </div>
        </div>
      )}

      {/* Administradores */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Administradores</h2>
          <p className="mt-1 text-sm text-gray-600">{admins.length} administrador(es) registrado(s)</p>
        </div>
        {admins.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(admin.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No hay administradores registrados para este restaurante</p>
          </div>
        )}
      </div>
    </div>
  );
}

