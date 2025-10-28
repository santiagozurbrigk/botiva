import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state || null;

  const handleNewOrder = () => {
    navigate('/');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ede0d4' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#7f5539' }}>No se encontró información del pedido</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200 border"
            style={{ 
              backgroundColor: '#ddb892', 
              color: '#7f5539',
              borderColor: '#b08968'
            }}
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ede0d4' }}>
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6ccb2' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7f5539' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#7f5539' }}>¡Pedido Confirmado!</h1>
            <p className="text-lg" style={{ color: '#b08968' }}>Tu pedido fue enviado correctamente</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>Detalles del Pedido</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: '#b08968' }}>Número de Pedido:</span>
                <span className="font-semibold" style={{ color: '#7f5539' }}>#{orderData.order?.orderNumber || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: '#b08968' }}>Cliente:</span>
                <span style={{ color: '#7f5539' }}>{orderData.customerData.firstName} {orderData.customerData.lastName}</span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: '#b08968' }}>Teléfono:</span>
                <span style={{ color: '#7f5539' }}>{orderData.customerData.phone}</span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: '#b08968' }}>Dirección:</span>
                <span className="text-right" style={{ color: '#7f5539' }}>{orderData.customerData.address}</span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: '#b08968' }}>Método de Pago:</span>
                <span style={{ color: '#7f5539' }}>
                  {orderData.customerData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>Productos</h2>
            
            <div className="space-y-3">
              {orderData.order?.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium" style={{ color: '#7f5539' }}>{item.quantity}x</span>
                    <span style={{ color: '#b08968' }}>{item.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: '#7f5539' }}>${item.price * item.quantity}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3" style={{ borderColor: '#b08968' }}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg" style={{ color: '#7f5539' }}>Total</span>
                  <span className="font-bold text-lg" style={{ color: '#7f5539' }}>${orderData.order?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>Próximos Pasos</h2>
            <ul className="space-y-2" style={{ color: '#b08968' }}>
              <li className="flex items-start space-x-2">
                <span className="text-sm">•</span>
                <span>Te contactaremos por teléfono para confirmar tu pedido</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sm">•</span>
                <span>Tiempo estimado de preparación: 20-30 minutos</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sm">•</span>
                <span>Recuerda abonar {orderData.customerData.paymentMethod === 'cash' ? 'en efectivo' : 'por transferencia'} antes de retirar</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sm">•</span>
                <span>Te notificaremos cuando tu pedido esté listo</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleNewOrder}
            className="w-full py-4 rounded-lg font-bold text-lg transition-colors duration-200"
            style={{ 
              backgroundColor: '#ddb892', 
              color: '#7f5539',
              border: '2px solid #b08968'
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
            Hacer Otro Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
