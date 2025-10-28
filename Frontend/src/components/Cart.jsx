import React from 'react';

const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md h-full overflow-y-auto shadow-lg" style={{ backgroundColor: '#ede0d4', borderLeft: '1px solid #b08968' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #b08968' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium" style={{ color: '#7f5539' }}>Tu Pedido</h2>
            <button
              onClick={onClose}
              className="transition-colors"
              style={{ color: '#b08968' }}
              onMouseEnter={(e) => e.target.style.color = '#7f5539'}
              onMouseLeave={(e) => e.target.style.color = '#b08968'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 flex-1">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#b08968' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <p style={{ color: '#b08968' }}>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-md p-3 border" style={{ backgroundColor: '#e6ccb2', borderColor: '#b08968' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm" style={{ color: '#7f5539' }}>{item.name}</h3>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="transition-colors"
                      style={{ color: '#b08968' }}
                      onMouseEnter={(e) => e.target.style.color = '#7f5539'}
                      onMouseLeave={(e) => e.target.style.color = '#b08968'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded flex items-center justify-center transition-colors text-sm"
                        style={{ backgroundColor: '#ddb892', color: '#7f5539' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b08968';
                          e.target.style.color = '#ede0d4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ddb892';
                          e.target.style.color = '#7f5539';
                        }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-medium w-6 text-center text-sm" style={{ color: '#7f5539' }}>{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded flex items-center justify-center transition-colors text-sm"
                        style={{ backgroundColor: '#ddb892', color: '#7f5539' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b08968';
                          e.target.style.color = '#ede0d4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ddb892';
                          e.target.style.color = '#7f5539';
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold" style={{ color: '#7f5539' }}>${item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4" style={{ borderTop: '1px solid #b08968' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-medium" style={{ color: '#7f5539' }}>Total:</span>
              <span className="text-xl font-semibold" style={{ color: '#7f5539' }}>${total}</span>
            </div>
            <button
              onClick={onCheckout}
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
              Proceder al Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
