import React from 'react';

const OrderConfirmation = ({ isOpen, onClose, orderData }) => {
  if (!isOpen) return null;

  const generateOrderNumber = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const orderNumber = generateOrderNumber();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-md shadow-xl" style={{ backgroundColor: '#ede0d4', border: '1px solid #b08968' }}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6ccb2' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7f5539' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#7f5539' }}>¡Pedido Confirmado!</h2>
          <p className="mb-4" style={{ color: '#b08968' }}>Tu pedido ha sido recibido correctamente</p>
          
          <div className="rounded-md p-4 mb-6 text-left border" style={{ backgroundColor: '#e6ccb2', borderColor: '#b08968' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: '#b08968' }}>Número de Pedido:</span>
              <span className="font-semibold" style={{ color: '#7f5539' }}>#{orderNumber}</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: '#b08968' }}>Cliente:</span>
              <span style={{ color: '#7f5539' }}>{orderData.firstName} {orderData.lastName}</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: '#b08968' }}>Teléfono:</span>
              <span style={{ color: '#7f5539' }}>{orderData.phone}</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: '#b08968' }}>Pago:</span>
              <span style={{ color: '#7f5539' }}>
                {orderData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
              </span>
            </div>
            
            <div className="pt-3" style={{ borderTop: '1px solid #b08968' }}>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#b08968' }}>Total:</span>
                <span className="text-lg font-semibold" style={{ color: '#7f5539' }}>${orderData.total}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 mb-6" style={{ backgroundColor: '#e6ccb2', borderColor: '#b08968' }}>
            <h3 className="font-medium mb-2" style={{ color: '#7f5539' }}>Próximos Pasos:</h3>
            <ul className="text-sm space-y-1 text-left" style={{ color: '#b08968' }}>
              <li>• Te contactaremos por teléfono para confirmar</li>
              <li>• Tiempo estimado de preparación: 20-30 min</li>
              <li>• Recuerda abonar {orderData.paymentMethod === 'cash' ? 'en efectivo' : 'por transferencia'} antes de retirar</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-md font-medium transition-colors duration-200 border"
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
            Hacer Otro Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
