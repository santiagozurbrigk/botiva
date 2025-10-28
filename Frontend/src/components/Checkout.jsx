import React, { useState } from 'react';

const Checkout = ({ isOpen, onClose, cartItems, onConfirmOrder }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    paymentMethod: 'cash'
  });

  const [errors, setErrors] = useState({});

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConfirmOrder({
        ...formData,
        items: cartItems,
        total: total
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg shadow-xl" style={{ backgroundColor: '#ede0d4', border: '1px solid #b08968' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #b08968' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold" style={{ color: '#7f5539' }}>Finalizar Pedido</h2>
            <button
              onClick={onClose}
              className="transition-colors"
              style={{ color: '#b08968' }}
              onMouseEnter={(e) => e.target.style.color = '#7f5539'}
              onMouseLeave={(e) => e.target.style.color = '#b08968'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7f5539' }}>
                Nombre *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#e6ccb2',
                  borderColor: errors.firstName ? '#dc2626' : '#b08968',
                  color: '#7f5539'
                }}
                placeholder="Tu nombre"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7f5539' }}>
                Apellido *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#e6ccb2',
                  borderColor: errors.lastName ? '#dc2626' : '#b08968',
                  color: '#7f5539'
                }}
                placeholder="Tu apellido"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7f5539' }}>
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#e6ccb2',
                  borderColor: errors.phone ? '#dc2626' : '#b08968',
                  color: '#7f5539'
                }}
                placeholder="Tu número de teléfono"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                Método de Pago
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#b08968' }}
                  />
                  <span className="ml-2" style={{ color: '#7f5539' }}>Efectivo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={formData.paymentMethod === 'transfer'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#b08968' }}
                  />
                  <span className="ml-2" style={{ color: '#7f5539' }}>Transferencia</span>
                </label>
              </div>
            </div>

            <div className="rounded-lg p-3 border" style={{ backgroundColor: '#e6ccb2', borderColor: '#b08968' }}>
              <p className="text-sm" style={{ color: '#7f5539' }}>
                <strong>Importante:</strong> Todos los pedidos deben ser abonados en el local antes de retirar, 
                o al momento de recibir el delivery.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid #b08968' }}>
              <span className="text-lg font-semibold" style={{ color: '#7f5539' }}>Total:</span>
              <span className="text-2xl font-bold" style={{ color: '#7f5539' }}>${total}</span>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-semibold transition-colors duration-200 border"
              style={{ 
                backgroundColor: '#e6ccb2', 
                color: '#7f5539',
                borderColor: '#b08968'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b08968';
                e.target.style.color = '#ede0d4';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#e6ccb2';
                e.target.style.color = '#7f5539';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg font-semibold transition-colors duration-200 border"
              style={{ 
                backgroundColor: '#ddb892', 
                color: '#7f5539',
                borderColor: '#b08968'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b08968';
                e.target.style.color = '#ede0d4';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ddb892';
                e.target.style.color = '#7f5539';
              }}
            >
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
