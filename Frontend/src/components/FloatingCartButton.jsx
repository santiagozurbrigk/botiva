import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const { cart, actions } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleClick = () => {
    setIsAnimating(true);
    // Navegar a la página del carrito
    navigate('/cart');
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${isAnimating ? 'animate-bounce' : ''}`}
      style={{ 
        backgroundColor: '#ddb892',
        border: '2px solid #b08968'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#b08968';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#ddb892';
      }}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#7f5539' }}>
        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
      {totalItems > 0 && (
        <span 
          className={`absolute -top-2 -right-2 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold transition-all duration-300 ${totalItems > 9 ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: '#7f5539' }}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;