import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { categories, actions } = useApp();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        await actions.loadCategories();
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []); // Removemos actions de las dependencias para evitar el bucle

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsAddingCategory(true);
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await actions.deleteCategory(categoryId);
      } catch (error) {
        console.error('Error eliminando categoría:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Editar categoría existente
        await actions.updateCategory(editingCategory._id, formData);
      } else {
        // Agregar nueva categoría
        await actions.createCategory(formData);
      }
      
      setIsAddingCategory(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error guardando categoría:', error);
    }
  };

  const handleCancel = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const toggleCategoryStatus = async (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category) {
      try {
        await actions.updateCategory(categoryId, { isActive: !category.isActive });
      } catch (error) {
        console.error('Error actualizando estado de categoría:', error);
      }
    }
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
          <h1 className="text-2xl font-bold" style={{ color: '#7f5539' }}>Gestión de Categorías</h1>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 border"
          style={{ 
            backgroundColor: '#ddb892', 
            color: '#7f5539',
            borderColor: '#b08968'
          }}
        >
          Agregar Categoría
        </button>
      </div>

      <div className="px-4 pb-8">
        {/* Add/Edit Category Form */}
        {isAddingCategory && (
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>
              {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                  Nombre de la Categoría *
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
                  placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#e6ccb2',
                    borderColor: '#b08968',
                    color: '#7f5539'
                  }}
                  placeholder="Descripción de la categoría..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                  style={{ accentColor: '#b08968' }}
                />
                <label className="text-sm font-medium" style={{ color: '#7f5539' }}>
                  Categoría Activa
                </label>
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
                  {editingCategory ? 'Actualizar Categoría' : 'Agregar Categoría'}
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

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border" style={{ borderColor: '#b08968' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#7f5539' }}></div>
              <p className="text-lg" style={{ color: '#b08968' }}>Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border" style={{ borderColor: '#b08968' }}>
              <p className="text-lg" style={{ color: '#b08968' }}>No hay categorías creadas</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: '#b08968' }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ color: '#7f5539' }}>{category.name}</h3>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: '#b08968' }}>{category.description}</p>
                    <p className="text-xs" style={{ color: '#b08968' }}>Orden: {category.order || 0}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCategoryStatus(category._id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        category.isActive 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {category.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      style={{ 
                        backgroundColor: '#ddb892', 
                        color: '#7f5539'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                      style={{ 
                        backgroundColor: '#fef2f2', 
                        color: '#dc2626'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
