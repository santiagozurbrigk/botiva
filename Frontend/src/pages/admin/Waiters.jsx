import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function Waiters() {
  const { token } = useAuth();
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [tableNumbers, setTableNumbers] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');

  useEffect(() => {
    fetchWaiters();
  }, [token]);

  const fetchWaiters = async () => {
    try {
      const data = await api.getWaiters(token);
      setWaiters(data);
    } catch (error) {
      console.error('Error fetching waiters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createWaiter(token, formData);
      fetchWaiters();
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating waiter:', error);
      alert('Error al crear mozo: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este mozo?')) return;
    try {
      await api.deleteWaiter(token, id);
      fetchWaiters();
    } catch (error) {
      console.error('Error deleting waiter:', error);
      alert('Error al eliminar mozo: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleOpenTablesModal = async (waiter) => {
    setSelectedWaiter(waiter);
    try {
      const tables = await api.getWaiterTables(token, waiter.id);
      setTableNumbers(tables.map(t => t.table_number));
      setShowTablesModal(true);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTableNumbers([]);
      setShowTablesModal(true);
    }
  };

  const handleAddTable = () => {
    const tableNum = parseInt(newTableNumber);
    if (tableNum && !tableNumbers.includes(tableNum)) {
      setTableNumbers([...tableNumbers, tableNum].sort((a, b) => a - b));
      setNewTableNumber('');
    }
  };

  const handleRemoveTable = (tableNum) => {
    setTableNumbers(tableNumbers.filter(t => t !== tableNum));
  };

  const handleSaveTables = async () => {
    try {
      await api.assignTablesToWaiter(token, selectedWaiter.id, tableNumbers);
      setShowTablesModal(false);
      setSelectedWaiter(null);
      setTableNumbers([]);
      alert('Mesas asignadas correctamente');
    } catch (error) {
      console.error('Error assigning tables:', error);
      alert('Error al asignar mesas: ' + (error.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mozos</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona los mozos del restaurante</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm rounded-xl px-6 py-2"
        >
          + Nuevo Mozo
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waiters.map((waiter) => (
                <tr key={waiter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{waiter.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waiter.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waiter.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      waiter.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {waiter.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        onClick={() => handleOpenTablesModal(waiter)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Mesas
                      </button>
                      <button
                        onClick={() => handleDelete(waiter.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Mozo */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nuevo Mozo</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3 flex-wrap pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-sm px-6 py-2 rounded-xl"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Mesas */}
      {showTablesModal && selectedWaiter && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Asignar Mesas - {selectedWaiter.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Mesa
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="number"
                      min="1"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTable();
                        }
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Ej: 5"
                    />
                    <button
                      type="button"
                      onClick={handleAddTable}
                      className="btn-primary text-sm px-6 py-2 rounded-xl w-full sm:w-auto"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesas Asignadas
                  </label>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-2 border border-gray-300 rounded-md">
                    {tableNumbers.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay mesas asignadas</p>
                    ) : (
                      tableNumbers.map((tableNum) => (
                        <span
                          key={tableNum}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          Mesa {tableNum}
                          <button
                            type="button"
                            onClick={() => handleRemoveTable(tableNum)}
                            className="ml-2 text-indigo-600 hover:text-indigo-900"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 flex-wrap pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTablesModal(false);
                      setSelectedWaiter(null);
                      setTableNumbers([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTables}
                    className="btn-primary text-sm px-6 py-2 rounded-xl"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

