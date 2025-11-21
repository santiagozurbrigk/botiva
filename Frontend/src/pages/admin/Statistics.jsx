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
  const [salesPeriod, setSalesPeriod] = useState('day'); // 'day', 'week', 'month'

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

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatPeriod = (period) => {
    if (salesPeriod === 'week') {
      const [year, week] = period.split('-W');
      return `Semana ${week} ${year}`;
    } else if (salesPeriod === 'month') {
      const [year, month] = period.split('-');
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return formatDate(period);
  };

  const getSalesData = () => {
    if (!statistics) return [];
    const { financial } = statistics;
    
    if (salesPeriod === 'week') {
      return Object.values(financial.salesByWeek || {}).sort((a, b) => a.period.localeCompare(b.period));
    } else if (salesPeriod === 'month') {
      return Object.values(financial.salesByMonth || {}).sort((a, b) => a.period.localeCompare(b.period));
    }
    return Object.values(financial.salesByDay || {}).sort((a, b) => new Date(a.date) - new Date(b.date));
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
  const LineChart = ({ data, labelKey, valueKey, color = 'indigo', formatLabel }) => {
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
          {data.slice(0, Math.min(5, data.length)).map((item, index) => {
            const label = item[labelKey];
            const formattedLabel = formatLabel ? formatLabel(label) : (labelKey === 'date' ? formatDate(label).slice(0, 5) : label);
            return <span key={index}>{formattedLabel}</span>;
          })}
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

      {/* Gráfico de Ventas */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            Análisis de Ventas
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSalesPeriod('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                salesPeriod === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Día
            </button>
            <button
              onClick={() => setSalesPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                salesPeriod === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Semana
            </button>
            <button
              onClick={() => setSalesPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                salesPeriod === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Mes
            </button>
          </div>
        </div>
        <LineChart
          data={getSalesData()}
          labelKey={salesPeriod === 'day' ? 'date' : 'period'}
          valueKey="total"
          formatLabel={salesPeriod === 'day' ? undefined : formatPeriod}
        />
      </div>

      {/* Horarios Pico */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Horarios Pico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Pedidos por Hora del Día</h3>
            <BarChart
              data={Object.values(business.ordersByHour || {})
                .sort((a, b) => a.hour - b.hour)
                .map(h => ({ label: formatHour(h.hour), value: h.count }))}
              maxValue={Math.max(...Object.values(business.ordersByHour || {}).map(h => h.count || 0), 1)}
              labelKey="label"
              valueKey="value"
              color="bg-blue-600"
            />
            {business.peakHours && business.peakHours.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Horarios con más pedidos: {business.peakHours.map(h => formatHour(h)).join(', ')}
                </p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Horarios Pico de Cocina</h3>
            <BarChart
              data={Object.values(kitchen.ordersByHour || {})
                .sort((a, b) => a.hour - b.hour)
                .map(h => ({ label: formatHour(h.hour), value: h.count }))}
              maxValue={Math.max(...Object.values(kitchen.ordersByHour || {}).map(h => h.count || 0), 1)}
              labelKey="label"
              valueKey="value"
              color="bg-orange-600"
            />
            {kitchen.peakHours && kitchen.peakHours.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">
                  Horarios con más pedidos de cocina: {kitchen.peakHours.map(h => formatHour(h)).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
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
        {waiters && waiters.length > 0 ? (
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {waiter.name}
                      {!waiter.active && <span className="ml-2 text-xs text-gray-400">(Inactivo)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{waiter.totalComandas}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{waiter.completedComandas}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(waiter.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(waiter.averageOrderValue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{waiter.averageTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay mozos registrados</p>
        )}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Pedidos en Cocina</h2>
          {kitchen.mostOrderedItems && kitchen.mostOrderedItems.length > 0 ? (
            <BarChart
              data={kitchen.mostOrderedItems}
              maxValue={Math.max(...kitchen.mostOrderedItems.map(i => i.quantity), 1)}
              labelKey="name"
              valueKey="quantity"
              color="bg-orange-600"
            />
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Estadísticas de Repartidores */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Repartidores</h2>
        {riders && riders.length > 0 ? (
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {rider.name}
                      {!rider.active && <span className="ml-2 text-xs text-gray-400">(Inactivo)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rider.totalDeliveries}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rider.completedDeliveries}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(rider.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(rider.averageOrderValue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rider.averageDeliveryTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay repartidores registrados</p>
        )}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.topProducts.length > 0 ? (
                  products.topProducts.map((product, index) => (
                    <tr key={product.id || index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        {formatCurrency(product.revenue || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
                      No hay productos vendidos en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

