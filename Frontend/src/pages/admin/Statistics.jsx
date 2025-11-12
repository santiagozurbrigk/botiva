import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function Statistics() {
  const { token, logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [token, dateFrom, dateTo]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const data = await api.getStatistics(token, params);
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Error al obtener estadísticas');
      if (err.message && err.message.includes('No autorizado')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Componente para gráfico de barras simple
  const BarChart = ({ data, maxValue, labelKey, valueKey, color = 'bg-indigo-600' }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No hay datos</p>;
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const value = typeof item === 'object' ? item[valueKey] : item;
          const label = typeof item === 'object' ? item[labelKey] : String(item);
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-24 text-sm text-gray-600 truncate">{label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`${color} h-6 rounded-full flex items-center justify-end pr-2 transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-xs text-white font-medium">{value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Componente para gráfico de líneas simple
  const LineChart = ({ data, labelKey, valueKey, color = 'indigo' }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No hay datos</p>;
    
    const values = data.map(item => item[valueKey] || 0);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={`rgb(99, 102, 241)`}
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1 || 1)) * 400;
              const y = 200 - (((item[valueKey] || 0) - minValue) / range) * 200;
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * 400;
            const y = 200 - (((item[valueKey] || 0) - minValue) / range) * 200;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={`rgb(99, 102, 241)`}
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          {data.slice(0, 5).map((item, index) => (
            <span key={index}>{formatDate(item[labelKey]).slice(0, 5)}</span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-gray-600">No hay estadísticas disponibles</div>
    );
  }

  const { financial, business, waiters, kitchen, riders, products, period } = statistics;

  return (
    <div className="space-y-6">
      {/* Header con filtros de fecha */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Estadísticas del Negocio</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Desde"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Hasta"
            />
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Período: {formatDate(period.from)} - {formatDate(period.to)}
        </p>
      </div>

      {/* Estadísticas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Ventas Totales</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {formatCurrency(financial.totalSales)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Pagos Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {formatCurrency(financial.pendingPayments)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Pagos Recibidos</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(financial.paidAmount)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Ticket Promedio</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(business.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Gráfico de Ventas por Día */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Día</h2>
        <LineChart
          data={Object.values(financial.salesByDay).sort((a, b) => new Date(a.date) - new Date(b.date))}
          labelKey="date"
          valueKey="total"
        />
      </div>

      {/* Estadísticas del Negocio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Estado</h2>
          <BarChart
            data={Object.entries(business.ordersByStatus).map(([key, value]) => ({
              label: key,
              value: value,
            }))}
            maxValue={Math.max(...Object.values(business.ordersByStatus), 1)}
            labelKey="label"
            valueKey="value"
            color="bg-indigo-600"
          />
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Tipo</h2>
          <BarChart
            data={Object.entries(business.ordersByType).map(([key, value]) => ({
              label: key,
              value: value,
            }))}
            maxValue={Math.max(...Object.values(business.ordersByType), 1)}
            labelKey="label"
            valueKey="value"
            color="bg-green-600"
          />
        </div>
      </div>

      {/* Estadísticas de Mozos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Mozos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mozo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comandas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completadas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Promedio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Promedio (min)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waiters.map((waiter) => (
                <tr key={waiter.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{waiter.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{waiter.totalComandas}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{waiter.completedComandas}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(waiter.totalRevenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(waiter.averageOrderValue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{waiter.averageTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Cocina</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{kitchen.totalKitchenOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-semibold text-yellow-600">{kitchen.pendingKitchenOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-xl font-semibold text-blue-600">{kitchen.inProcessKitchenOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tiempo Promedio de Preparación</p>
              <p className="text-xl font-semibold text-green-600">{Math.round(kitchen.averagePreparationTime)} min</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Pedidos</h2>
          <BarChart
            data={kitchen.mostOrderedItems}
            maxValue={Math.max(...kitchen.mostOrderedItems.map(i => i.quantity), 1)}
            labelKey="name"
            valueKey="quantity"
            color="bg-orange-600"
          />
        </div>
      </div>

      {/* Estadísticas de Repartidores */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Repartidores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repartidor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entregas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completadas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Promedio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Promedio (min)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riders.map((rider) => (
                <tr key={rider.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{rider.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rider.totalDeliveries}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rider.completedDeliveries}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(rider.totalRevenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(rider.averageOrderValue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rider.averageDeliveryTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total de Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.totalProducts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos Activos</p>
              <p className="text-xl font-semibold text-green-600">{products.activeProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Productos Más Vendidos</h2>
          <BarChart
            data={products.topProducts}
            maxValue={Math.max(...products.topProducts.map(p => p.quantity), 1)}
            labelKey="name"
            valueKey="quantity"
            color="bg-purple-600"
          />
        </div>
      </div>
    </div>
  );
}

