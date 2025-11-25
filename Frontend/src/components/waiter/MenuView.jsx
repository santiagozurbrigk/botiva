import { useState, useMemo } from 'react';

export default function MenuView({ products, extras, onAddProduct, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});

  // Obtener todas las categorías únicas de los productos
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...cats];
  }, [products]);

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

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
    <div className="space-y-4 md:space-y-6">
      {/* Header con botón de volver */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Menú</h2>
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Comanda
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar platos..."
          className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros de categoría - Scroll horizontal en móvil */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'Todos' : category}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => {
          const quantity = quantities[product.id] || 0;
          const price = typeof product.price === 'string' 
            ? parseFloat(product.price.replace(',', '.')) 
            : parseFloat(product.price) || 0;

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-5 hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 md:h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-semibold text-gray-900 mb-1 text-base md:text-lg">{product.name}</h3>
              {product.description && (
                <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg md:text-xl font-bold text-indigo-600">
                  ${price.toFixed(2)}
                </span>
                {product.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, -1)}
                    className="w-8 h-8 md:w-9 md:h-9 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 text-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 md:w-10 text-center font-medium text-base md:text-lg">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(product.id, 1)}
                    className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToOrder(product)}
                  disabled={quantity === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-colors flex-1 ${
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
          <p className="text-gray-500 text-lg">No hay productos en esta categoría</p>
        </div>
      )}
    </div>
  );
}
