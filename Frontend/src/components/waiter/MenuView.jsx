import { useState, useMemo } from 'react';

export default function MenuView({ products, extras, onAddProduct, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});

  // Obtener todas las categorías únicas de los productos
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...cats];
  }, [products]);

  // Filtrar productos por categoría
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const newQuantity = Math.max(0, current + change);
      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToOrder = (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > 0) {
      const price = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(',', '.')) 
        : parseFloat(product.price) || 0;
      
      onAddProduct({
        product_id: product.id,
        name: product.name,
        quantity: quantity,
        unit_price: price,
        extras: [],
      });
      
      // Reset quantity for this product
      setQuantities(prev => {
        const { [product.id]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón de volver */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Menú</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Volver a Comanda
        </button>
      </div>

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'Todos' : category}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const quantity = quantities[product.id] || 0;
          const price = typeof product.price === 'string' 
            ? parseFloat(product.price.replace(',', '.')) 
            : parseFloat(product.price) || 0;

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-indigo-600">
                  ${price.toFixed(2)}
                </span>
                {product.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, -1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, 1)}
                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToOrder(product)}
                  disabled={quantity === 0}
                  className={`px-3 py-1 rounded-lg font-medium text-sm transition-colors ${
                    quantity > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay productos en esta categoría</p>
        </div>
      )}
    </div>
  );
}

