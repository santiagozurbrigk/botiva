import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { products, categories, actions } = useApp();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          actions.loadProducts(),
          actions.loadCategories()
        ]);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Removemos actions de las dependencias para evitar el bucle

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0]?._id || '',
      image: null
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category._id || product.category,
      image: null // No pre-cargar imagen para edición
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await actions.deleteProduct(productId);
      } catch (error) {
        console.error('Error eliminando producto:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image
      };

      if (editingProduct) {
        // Editar producto existente
        await actions.updateProduct(editingProduct._id, productData);
      } else {
        // Agregar nuevo producto
        await actions.createProduct(productData);
      }
      
      setIsAddingProduct(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null
      });
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleCancel = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: null
    });
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ede0d4' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 py-4 px-4 flex items-center justify-between" style={{ backgroundColor: '#ede0d4' }}>
        <div className="flex items-center space-x-4">
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
          <h1 className="text-2xl font-bold" style={{ color: '#7f5539' }}>Gestión del Menú</h1>
        </div>
        <button
          onClick={handleAddProduct}
          className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 border"
          style={{ 
            backgroundColor: '#ddb892', 
            color: '#7f5539',
            borderColor: '#b08968'
          }}
        >
          Agregar Producto
        </button>
      </div>

      <div className="px-4 pb-8">
        {/* Add/Edit Product Form */}
        {isAddingProduct && (
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                    placeholder="Ej: Clásica Ala-Burguer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#e6ccb2',
                    borderColor: '#b08968',
                    color: '#7f5539'
                  }}
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Imagen del Producto *
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!editingProduct}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                  />
                  {editingProduct && (
                    <p className="text-sm mt-1" style={{ color: '#b08968' }}>
                      Deja vacío para mantener la imagen actual
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ddb892', 
                    color: '#7f5539',
                    border: '2px solid #b08968'
                  }}
                >
                  {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200 border"
                  style={{ 
                    backgroundColor: '#e6ccb2', 
                    color: '#7f5539',
                    borderColor: '#b08968'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border" style={{ borderColor: '#b08968' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#7f5539' }}></div>
              <p className="text-lg" style={{ color: '#b08968' }}>Cargando productos...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border" style={{ borderColor: '#b08968' }}>
              <p className="text-lg" style={{ color: '#b08968' }}>No hay categorías disponibles. Crea una categoría primero.</p>
            </div>
          ) : (
            categories.map(category => {
              const categoryProducts = products.filter(product => {
                return product.category === category._id || 
                       product.category === category._id.toString() ||
                       (product.category && product.category._id === category._id);
              });
              
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category._id}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#7f5539' }}>
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryProducts.map(product => (
                      <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: '#b08968' }}>
                        <div className="aspect-w-16 aspect-h-9">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-40 object-cover"
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
                          <p className="text-lg font-bold mb-4" style={{ color: '#7f5539' }}>${product.price}</p>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors duration-200 border"
                              style={{ 
                                backgroundColor: '#ddb892', 
                                color: '#7f5539',
                                borderColor: '#b08968'
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors duration-200 border"
                              style={{ 
                                backgroundColor: '#fef2f2', 
                                color: '#dc2626',
                                borderColor: '#dc2626'
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
