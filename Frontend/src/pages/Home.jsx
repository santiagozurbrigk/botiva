import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import PromotionFlyer from '../components/PromotionFlyer';
import { useApp } from '../context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { categories, products, promotions, actions, loading } = useApp();

  // Los datos se cargan automáticamente desde el contexto
  // No necesitamos hacer llamadas adicionales aquí

  // Los datos se cargan automáticamente desde el contexto

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ede0d4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7f5539' }}></div>
          <p style={{ color: '#7f5539' }}>Cargando menú...</p>
        </div>
      </div>
    );
  }

  const addToCart = (product) => {
    actions.addToCart(product);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ede0d4' }}>

      {/* Menu Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        {/* Promotion Flyer */}
        {promotions.length > 0 && <PromotionFlyer flyerData={promotions[0]} />}
        
        <div className="space-y-12">
          {/* Categorías dinámicas */}
          {categories.length === 0 ? (
            <div className="text-center">
              <p style={{ color: '#7f5539' }}>No hay categorías disponibles</p>
            </div>
          ) : (
            categories.map(category => {
              const categoryProducts = products.filter(product => {
                // Comparar tanto ObjectId como string
                return product.category === category._id || 
                       product.category === category._id.toString() ||
                       (product.category && product.category._id === category._id);
              });
              
              
              if (categoryProducts.length === 0) return null;
              
              return (
                <section key={category._id}>
                  <h2 className="text-2xl font-medium mb-6 text-center" style={{ color: '#7f5539' }}>
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-center mb-6" style={{ color: '#b08968' }}>
                      {category.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
