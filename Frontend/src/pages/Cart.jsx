import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, actions, cartTotal } = useApp();

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      actions.removeFromCart(productId);
      return;
    }
    
    actions.updateCartItem(productId, newQuantity);
  };

  const removeFromCart = (productId) => {
    actions.removeFromCart(productId);
  };

  const handleContinue = () => {
    navigate('/checkout');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ede0d4' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 py-4 px-4 flex items-center justify-between" style={{ backgroundColor: '#ede0d4' }}>
        <button
          onClick={handleBack}
          className="flex items-center space-x-2"
          style={{ color: '#7f5539' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#7f5539' }}>Mi Pedido</h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <div className="px-4 pb-20">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6ccb2' }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#b08968' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#7f5539' }}>Carrito Vacío</h2>
            <p className="text-lg mb-8" style={{ color: '#b08968' }}>
              ¡La buena comida siempre se está cocinando! Ve y ordena algunos deliciosos elementos del menú.
            </p>
            <button
              onClick={handleBack}
              className="px-8 py-3 rounded-lg font-semibold transition-colors duration-200 border"
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
              Ver Menú
            </button>
          </div>
        ) : (
          <>
            {/* Restaurant Info */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border" style={{ borderColor: '#b08968' }}>
              <h3 className="font-bold text-lg mb-1" style={{ color: '#7f5539' }}>Ala-Burguer</h3>
              <p className="text-sm mb-2" style={{ color: '#b08968' }}>Av. Principal 123, Centro</p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#ddb892', color: '#7f5539' }}>
                  20-30 min
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border" style={{ borderColor: '#b08968' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: '#7f5539' }}>{item.name}</h3>
                      <p className="text-sm mb-2" style={{ color: '#b08968' }}>{item.description}</p>
                      <p className="font-bold text-lg" style={{ color: '#7f5539' }}>${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: '#e6ccb2', color: '#7f5539' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b08968';
                          e.target.style.color = '#ede0d4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#e6ccb2';
                          e.target.style.color = '#7f5539';
                        }}
                      >
                        -
                      </button>
                      <span className="font-semibold text-lg w-8 text-center" style={{ color: '#7f5539' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: '#e6ccb2', color: '#7f5539' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b08968';
                          e.target.style.color = '#ede0d4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#e6ccb2';
                          e.target.style.color = '#7f5539';
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-lg" style={{ color: '#7f5539' }}>${item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Items */}
            <div className="text-center mb-6">
              <button
                onClick={handleBack}
                className="text-pink-500 hover:text-pink-700 font-medium transition-colors"
              >
                Agregar más elementos
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border" style={{ borderColor: '#b08968' }}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#b08968' }}>Subtotal</span>
                  <span style={{ color: '#7f5539' }}>${cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#b08968' }}>Impuestos y tarifas</span>
                  <span style={{ color: '#7f5539' }}>$2.00</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#b08968' }}>Delivery</span>
                  <span style={{ color: '#7f5539' }}>Gratis</span>
                </div>
                <div className="border-t pt-2 mt-2" style={{ borderColor: '#b08968' }}>
                  <div className="flex justify-between">
                    <span className="font-bold text-lg" style={{ color: '#7f5539' }}>Total</span>
                    <span className="font-bold text-lg" style={{ color: '#7f5539' }}>${cartTotal + 2}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-lg font-bold text-lg transition-colors duration-200 flex items-center justify-between px-6"
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
              <span>Continuar</span>
              <span>${cartTotal + 2}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
