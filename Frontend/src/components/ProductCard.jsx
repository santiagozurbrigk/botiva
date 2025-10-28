import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1" style={{ backgroundColor: '#ede0d4', border: '1px solid #b08968' }}>
      <div className="aspect-w-16 aspect-h-9 relative">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center" style={{ backgroundColor: '#e6ccb2' }}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#b08968' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#7f5539' }}>{product.name}</h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#b08968' }}>{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold" style={{ color: '#7f5539' }}>${product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: isAdding ? '#b08968' : '#ddb892', 
              color: '#7f5539',
              borderColor: '#b08968'
            }}
            onMouseEnter={(e) => {
              if (!isAdding) {
                e.target.style.backgroundColor = '#b08968';
                e.target.style.color = '#ede0d4';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAdding) {
                e.target.style.backgroundColor = '#ddb892';
                e.target.style.color = '#7f5539';
              }
            }}
          >
            {isAdding ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Agregando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
