import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import MenuView from '../../components/waiter/MenuView';

// Vista de selección de mesas
function TablesView({ tables, onTableSelect, onTableStatusChange, comandas, onEditComanda, tableStatuses }) {
  const [showTableSelector, setShowTableSelector] = useState(false);
  // Función para determinar el color de la mesa
  const getTableColor = (tableNumber) => {
    const comanda = comandas.find(c => c.table_number === tableNumber);
    
    // Si la comanda está pagada, mesa en blanco
    if (comanda && comanda.payment_status === 'pagado') {
      return 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50';
    }
    
    // Si hay estado manual, usar ese
    if (tableStatuses[tableNumber]) {
      const status = tableStatuses[tableNumber];
      if (status === 'pedido_tomado') {
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      } else if (status === 'pedido_entregado') {
        return 'bg-green-500 hover:bg-green-600 text-white';
      }
    }
    
    // Si hay comanda activa (pendiente o en_proceso), amarillo
    if (comanda && (comanda.status === 'pendiente' || comanda.status === 'en_proceso')) {
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    }
    
    // Si hay comanda finalizada o entregada, verde
    if (comanda && (comanda.status === 'finalizado' || comanda.status === 'entregado')) {
      return 'bg-green-500 hover:bg-green-600 text-white';
    }
    
    // Por defecto, blanco
    return 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50';
  };

  // Función para obtener el texto del estado
  const getTableStatusText = (tableNumber) => {
    const comanda = comandas.find(c => c.table_number === tableNumber);
    
    if (comanda && comanda.payment_status === 'pagado') {
      return '';
    }
    
    if (tableStatuses[tableNumber]) {
      const status = tableStatuses[tableNumber];
      if (status === 'pedido_tomado') {
        return 'Pedido';
      } else if (status === 'pedido_entregado') {
        return 'Entregado';
      }
    }
    
    if (comanda && (comanda.status === 'pendiente' || comanda.status === 'en_proceso')) {
      return 'Pedido';
    }
    
    if (comanda && (comanda.status === 'finalizado' || comanda.status === 'entregado')) {
      return 'Entregado';
    }
    
    return '';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tomar Comanda</h1>
            <p className="mt-1 text-sm text-gray-600">Haz click en una mesa para cambiar su estado</p>
          </div>
          <button
            onClick={() => setShowTableSelector(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Comanda
          </button>
        </div>

        {/* Grid de Mesas */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {tables.map((tableNumber) => {
            return (
              <button
                key={tableNumber}
                onClick={() => onTableStatusChange(tableNumber)}
                className={`aspect-square rounded-xl shadow-md flex flex-col items-center justify-center text-xl md:text-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${getTableColor(tableNumber)}`}
              >
                <span>{tableNumber}</span>
                {getTableStatusText(tableNumber) && (
                  <span className="text-xs md:text-sm mt-1 opacity-90">
                    {getTableStatusText(tableNumber)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tables.length === 0 && (
          <div className="text-center py-12 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">No tienes mesas asignadas. Contacta al administrador.</p>
          </div>
        )}

        {/* Modal para seleccionar mesa */}
        {showTableSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Seleccionar Mesa</h2>
                <button
                  onClick={() => setShowTableSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Selecciona una mesa para crear una nueva comanda:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                {tables.map((tableNumber) => (
                  <button
                    key={tableNumber}
                    onClick={() => {
                      onTableSelect(tableNumber);
                      setShowTableSelector(false);
                    }}
                    className="aspect-square rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-colors shadow-md"
                  >
                    {tableNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de Comandas Pendientes */}
        {comandas.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Comandas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comandas.map((comanda) => (
                <div key={comanda.id} className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Mesa {comanda.table_number}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(comanda.created_at).toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comanda.status === 'pendiente' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {comanda.status === 'pendiente' ? 'Pendiente' : 'En Proceso'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">
                      {comanda.order_items?.length || 0} producto(s)
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      ${comanda.total_amount}
                    </p>
                    {comanda.scheduled_delivery_time && (
                      <p className="text-xs text-gray-500 mt-1">
                        ⏰ {comanda.scheduled_delivery_time}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onEditComanda(comanda)}
                    className="w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Editar Comanda
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Vista de comanda (pantalla completa)
function ComandaView({ 
  tableNumber, 
  formData, 
  setFormData, 
  products, 
  extras, 
  onBack, 
  onCreateComanda, 
  onShowMenu,
  showMenu,
  onAddProductFromMenu,
  removeItem,
  updateItem,
  addExtraToItem,
  removeExtraFromItem,
  calculateTotal
}) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Mesa {tableNumber}
            </h1>
            <p className="text-xs text-gray-500">Nueva Comanda</p>
          </div>
        </div>
        <button
          onClick={() => onShowMenu(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Menú
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto">
        {showMenu ? (
          <div className="p-4 md:p-6">
            <MenuView
              products={products}
              extras={extras}
              onAddProduct={onAddProductFromMenu}
              onBack={() => onShowMenu(false)}
            />
          </div>
        ) : (
          <form onSubmit={onCreateComanda} className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
            {/* Horario específico */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Específico (Opcional)
              </label>
              <input
                type="text"
                value={formData.scheduled_delivery_time}
                onChange={(e) => setFormData({ ...formData, scheduled_delivery_time: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Ej: Para las 20:00, En 30 minutos, etc."
              />
              <p className="mt-1 text-xs text-gray-500">Escribe el horario específico si el cliente lo solicita</p>
            </div>

            {/* Lista de productos */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
                <button
                  type="button"
                  onClick={() => onShowMenu(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  + Agregar
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 mb-4">No hay productos agregados</p>
                  <button
                    type="button"
                    onClick={() => onShowMenu(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Agregar desde el menú
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-lg">{item.quantity}x</span>
                            <span className="text-gray-900 font-medium truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">
                              ${parseFloat(item.unit_price || 0).toFixed(2)} c/u
                            </span>
                            <span className="text-sm font-semibold text-indigo-600">
                              = ${(parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)).toFixed(2)}
                            </span>
                          </div>
                          
                          {/* Extras */}
                          {item.extras && item.extras.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.extras.map((extra, extraIndex) => (
                                <span key={extraIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                  +{extra.name}
                                  <button
                                    type="button"
                                    onClick={() => removeExtraFromItem(index, extraIndex)}
                                    className="text-indigo-600 hover:text-indigo-900 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Selector de extras */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addExtraToItem(index, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                          >
                            <option value="">Agregar extra...</option>
                            {extras.map(extra => (
                              <option key={extra.id} value={extra.id}>
                                {extra.name} (+${parseFloat(extra.price || 0).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Controles de cantidad y eliminar */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newQuantity = Math.max(1, (item.quantity || 1) - 1);
                                updateItem(index, 'quantity', newQuantity);
                              }}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold text-lg"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newQuantity = (item.quantity || 1) + 1;
                                updateItem(index, 'quantity', newQuantity);
                              }}
                              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
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

            {/* Resumen y método de pago */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 sticky bottom-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base"
                  >
                    <option value="no_definido">No definido</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="px-4 py-3 bg-gray-100 rounded-lg text-2xl font-bold text-gray-900">
                    ${formData.total_amount}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formData.items.length === 0}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-base font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Crear Comanda
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Vista de edición de comanda (pantalla completa)
function EditComandaView({
  comanda,
  editFormData,
  setEditFormData,
  products,
  extras,
  onBack,
  onSaveEdit,
  onShowMenu,
  showMenu,
  onAddProductToEdit,
  handleEditItemChange,
  handleRemoveEditItem,
}) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Mesa {comanda.table_number}
            </h1>
            <p className="text-xs text-gray-500">Editar Comanda</p>
          </div>
        </div>
        <button
          onClick={() => onShowMenu(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Menú
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto">
        {showMenu ? (
          <div className="p-4 md:p-6">
            <MenuView
              products={products}
              extras={extras}
              onAddProduct={onAddProductToEdit}
              onBack={() => onShowMenu(false)}
            />
          </div>
        ) : (
          <form onSubmit={onSaveEdit} className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
            {/* Horario específico */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Específico (Opcional)
              </label>
              <input
                type="text"
                value={editFormData.scheduled_delivery_time}
                onChange={(e) => setEditFormData({ ...editFormData, scheduled_delivery_time: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Ej: Para las 20:00, En 30 minutos, etc."
              />
            </div>

            {/* Lista de productos */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
                <button
                  type="button"
                  onClick={() => onShowMenu(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  + Agregar
                </button>
              </div>

              {editFormData.items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No hay productos agregados</p>
                  <button
                    type="button"
                    onClick={() => onShowMenu(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Agregar desde el menú
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {editFormData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-lg">{item.quantity}x</span>
                            <span className="text-gray-900 font-medium truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              ${parseFloat(item.unit_price || 0).toFixed(2)} c/u
                            </span>
                            <span className="text-sm font-semibold text-indigo-600">
                              = ${(parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Controles de cantidad y eliminar */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newQuantity = Math.max(1, (item.quantity || 1) - 1);
                                handleEditItemChange(index, 'quantity', newQuantity);
                              }}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold text-lg"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newQuantity = (item.quantity || 1) + 1;
                                handleEditItemChange(index, 'quantity', newQuantity);
                              }}
                              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditItem(index)}
                            className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
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

            {/* Resumen y método de pago */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 sticky bottom-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={editFormData.payment_method}
                    onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base"
                  >
                    <option value="no_definido">No definido</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="px-4 py-3 bg-gray-100 rounded-lg text-2xl font-bold text-gray-900">
                    ${editFormData.total_amount}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editFormData.items.length === 0}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-base font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function WaiterDashboard() {
  const { token, user } = useAuth();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [extras, setExtras] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [comandas, setComandas] = useState([]);
  const [editingComanda, setEditingComanda] = useState(null);
  const [formData, setFormData] = useState({
    items: [],
    total_amount: '0.00',
    payment_method: 'no_definido',
    scheduled_delivery_time: '',
  });
  const [editFormData, setEditFormData] = useState({
    items: [],
    total_amount: '0.00',
    payment_method: 'no_definido',
    scheduled_delivery_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('tables'); // 'tables', 'comanda', 'edit'
  const [tableStatuses, setTableStatuses] = useState({}); // Estado manual de las mesas

  // Refrescar comandas cuando se cree o edite una
  const fetchComandas = useCallback(async () => {
    try {
      const data = await api.getMyComandas(token);
      setComandas(data);
      
      // Reiniciar estado de mesas cuando se paga una comanda
      setTableStatuses(prev => {
        const newStatuses = { ...prev };
        data.forEach(comanda => {
          if (comanda.payment_status === 'pagado' && newStatuses[comanda.table_number]) {
            delete newStatuses[comanda.table_number];
          }
        });
        return newStatuses;
      });
    } catch (error) {
      console.error('Error fetching comandas:', error);
      setComandas([]);
    }
  }, [token]);

  const fetchTables = useCallback(async () => {
    try {
      const data = await api.getMyTables(token);
      setTables(data.map(t => t.table_number).sort((a, b) => a - b));
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts(token);
      setProducts(Array.isArray(data) ? data.filter(p => p.active) : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  }, [token]);

  const fetchExtras = useCallback(async () => {
    try {
      const data = await api.getExtras(token);
      setExtras(Array.isArray(data) ? data.filter(e => e.active) : []);
    } catch (error) {
      console.error('Error fetching extras:', error);
      setExtras([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) {
          fetchTables();
          fetchProducts();
          fetchExtras();
          fetchComandas();
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading data:', error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleTableClick = (tableNumber) => {
    setSelectedTable(tableNumber);
    setFormData({
      items: [],
      total_amount: '0.00',
      payment_method: 'no_definido',
      scheduled_delivery_time: '',
    });
    setShowMenu(false);
    setView('comanda');
  };

  // Función para cambiar el estado de una mesa al hacer click
  const handleTableStatusChange = (tableNumber) => {
    const comanda = comandas.find(c => c.table_number === tableNumber);
    
    // Si la comanda está pagada, no hacer nada (ya está en blanco)
    if (comanda && comanda.payment_status === 'pagado') {
      return;
    }
    
    setTableStatuses(prev => {
      const currentStatus = prev[tableNumber];
      
      // Ciclo de estados: blanco -> amarillo -> verde -> blanco
      if (!currentStatus) {
        // De blanco a amarillo (pedido tomado)
        return { ...prev, [tableNumber]: 'pedido_tomado' };
      } else if (currentStatus === 'pedido_tomado') {
        // De amarillo a verde (pedido entregado)
        return { ...prev, [tableNumber]: 'pedido_entregado' };
      } else if (currentStatus === 'pedido_entregado') {
        // De verde a blanco (reiniciar)
        const newStatuses = { ...prev };
        delete newStatuses[tableNumber];
        return newStatuses;
      }
      
      return prev;
    });
  };

  const handleBackToTables = () => {
    setSelectedTable(null);
    setShowMenu(false);
    setView('tables');
    setFormData({
      items: [],
      total_amount: '0.00',
      payment_method: 'no_definido',
      scheduled_delivery_time: '',
    });
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);
      return { ...prev, items: newItems, total_amount: total.toFixed(2) };
    });
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
      
      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);
      
      return { ...prev, items: newItems, total_amount: total.toFixed(2) };
    });
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

      const total = newItems.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        const extrasTotal = (item.extras || []).reduce((extraSum, extra) => {
          return extraSum + (parseFloat(extra.unit_price) || 0);
        }, 0);
        return sum + itemTotal + extrasTotal;
      }, 0);

      return { ...prev, items: newItems, total_amount: total.toFixed(2) };
    });
  };

  const removeExtraFromItem = (itemIndex, extraIndex) => {
    setFormData(prev => {
      const newItems = [...prev.items];
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

      return { ...prev, items: newItems, total_amount: total.toFixed(2) };
    });
  };

  const calculateTotal = () => {
    // Ya se calcula automáticamente en updateItem y removeItem
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
    setShowMenu(false); // Volver a la vista de comanda después de agregar
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
        customer_name: 'Cliente de mesa',
        customer_phone: '',
        items,
        total_amount: parseFloat(formData.total_amount) || 0,
        payment_method: formData.payment_method || 'no_definido',
        table_number: selectedTable,
        scheduled_delivery_time: formData.scheduled_delivery_time || null,
      };

      await api.createComanda(token, comandaData);
      alert('Comanda creada exitosamente');
      handleBackToTables();
      fetchComandas();
    } catch (error) {
      console.error('Error creating comanda:', error);
      alert('Error al crear comanda: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleEditComanda = (comanda) => {
    setEditingComanda(comanda);
    setEditFormData({
      items: (comanda.order_items || []).map(item => ({
        product_id: item.product_id || null,
        name: item.product_name || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        extras: [],
      })),
      total_amount: comanda.total_amount || '0.00',
      payment_method: comanda.payment_method || 'no_definido',
      scheduled_delivery_time: comanda.scheduled_delivery_time || '',
    });
    setShowEditMenu(false);
    setView('edit');
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

  const handleRemoveEditItem = (index) => {
    setEditFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
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

  const handleAddProductToEdit = (productData) => {
    setEditFormData(prev => {
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
    setShowEditMenu(false); // Volver a la vista de edición después de agregar
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editFormData.items.length === 0) {
      alert('Por favor agrega al menos un producto a la comanda');
      return;
    }

    try {
      const items = editFormData.items.map(item => ({
        product_id: item.product_id || null,
        name: item.name || 'Producto sin nombre',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        extras: item.extras || [],
      }));

      const comandaData = {
        items,
        total_amount: parseFloat(editFormData.total_amount) || 0,
        payment_method: editFormData.payment_method || 'no_definido',
        scheduled_delivery_time: editFormData.scheduled_delivery_time || null,
      };

      await api.updateComanda(token, editingComanda.id, comandaData);
      alert('Comanda actualizada exitosamente');
      setView('tables');
      setEditingComanda(null);
      setShowEditMenu(false);
      fetchComandas();
    } catch (error) {
      console.error('Error updating comanda:', error);
      alert('Error al actualizar comanda: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleBackFromEdit = () => {
    setView('tables');
    setEditingComanda(null);
    setShowEditMenu(false);
  };

  // Controlar visibilidad del header del layout según la vista actual
  useEffect(() => {
    // Usar setTimeout para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      const layoutHeader = document.querySelector('header');
      if (!layoutHeader) {
        return;
      }

      if (view === 'tables') {
        // Mostrar header en vista de mesas
        layoutHeader.style.display = '';
      } else if (view === 'comanda' || view === 'edit') {
        // Ocultar header en vistas de comanda/edición
        layoutHeader.style.display = 'none';
      }
    }, 0);

    // Cleanup: restaurar header al desmontar
    return () => {
      clearTimeout(timer);
      const layoutHeader = document.querySelector('header');
      if (layoutHeader) {
        layoutHeader.style.display = '';
      }
    };
  }, [view]);

  // Mostrar loading después de todos los hooks (regla de hooks de React)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">Cargando mesas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {view === 'tables' && (
        <TablesView
          tables={tables}
          onTableSelect={handleTableClick}
          onTableStatusChange={handleTableStatusChange}
          comandas={comandas}
          onEditComanda={handleEditComanda}
          tableStatuses={tableStatuses}
        />
      )}
      
      {view === 'comanda' && selectedTable && (
        <ComandaView
          tableNumber={selectedTable}
          formData={formData}
          setFormData={setFormData}
          products={products}
          extras={extras}
          onBack={handleBackToTables}
          onCreateComanda={handleCreateComanda}
          onShowMenu={setShowMenu}
          showMenu={showMenu}
          onAddProductFromMenu={handleAddProductFromMenu}
          removeItem={removeItem}
          updateItem={updateItem}
          addExtraToItem={addExtraToItem}
          removeExtraFromItem={removeExtraFromItem}
          calculateTotal={calculateTotal}
        />
      )}

      {view === 'edit' && editingComanda && (
        <EditComandaView
          comanda={editingComanda}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          products={products}
          extras={extras}
          onBack={handleBackFromEdit}
          onSaveEdit={handleSaveEdit}
          onShowMenu={setShowEditMenu}
          showMenu={showEditMenu}
          onAddProductToEdit={handleAddProductToEdit}
          handleEditItemChange={handleEditItemChange}
          handleRemoveEditItem={handleRemoveEditItem}
        />
      )}
    </div>
  );
}
