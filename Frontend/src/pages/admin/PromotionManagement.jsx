import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PromotionManagement = () => {
  const navigate = useNavigate();
  const { promotions, actions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    isActive: true,
    validUntil: '',
    startDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Cargar promociones al montar el componente
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        await actions.loadPromotions();
      } catch (error) {
        console.error('Error cargando promociones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []); // Removemos actions de las dependencias para evitar el bucle

  // Obtener la promoción actual
  const currentPromotion = promotions.length > 0 ? promotions[0] : null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear URL de preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Actualizar el formData con el archivo
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  const handleSave = async () => {
    try {
      if (currentPromotion) {
        // Actualizar promoción existente
        await actions.updatePromotion(currentPromotion._id, formData);
      } else {
        // Crear nueva promoción
        await actions.createPromotion(formData);
      }
      
      setIsEditing(false);
      // Limpiar archivos seleccionados
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({
        title: '',
        description: '',
        image: null,
        isActive: true,
        validUntil: '',
        startDate: ''
      });
    } catch (error) {
      console.error('Error guardando promoción:', error);
    }
  };

  const handleCancel = () => {
    // Limpiar archivos seleccionados
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    
    setFormData({
      title: '',
      description: '',
      image: null,
      isActive: true,
      validUntil: '',
      startDate: ''
    });
    setIsEditing(false);
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
          <h1 className="text-2xl font-bold" style={{ color: '#7f5539' }}>Gestión de Promociones</h1>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 border"
          style={{ 
            backgroundColor: isEditing ? '#e6ccb2' : '#ddb892', 
            color: '#7f5539',
            borderColor: '#b08968'
          }}
        >
          {isEditing ? 'Cancelar' : (currentPromotion ? 'Editar Promoción' : 'Crear Promoción')}
        </button>
      </div>

      <div className="px-4 pb-8">
        {/* Preview del Flyer */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6" style={{ borderColor: '#b08968' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>Vista Previa del Flyer</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#7f5539' }}></div>
              <p style={{ color: '#b08968' }}>Cargando promociones...</p>
            </div>
          ) : currentPromotion ? (
            <div className="relative rounded-lg overflow-hidden shadow-lg border" style={{ borderColor: '#b08968' }}>
              <div className="relative w-full max-w-sm mx-auto h-96 md:h-[500px] lg:h-[600px]">
                {currentPromotion.image ? (
                  <img
                    src={currentPromotion.image}
                    alt={currentPromotion.title || 'Promoción'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#e6ccb2' }}>
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#b08968' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: '#b08968' }}>No hay promociones activas. Crea una nueva promoción.</p>
            </div>
          )}
        </div>

        {/* Formulario de Edición */}
        {isEditing && (
          <div className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: '#b08968' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7f5539' }}>
              {currentPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                  Título de la Promoción
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#e6ccb2',
                    borderColor: '#b08968',
                    color: '#7f5539'
                  }}
                  placeholder="Ej: ¡Oferta Especial!"
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
                  placeholder="Descripción de la promoción..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                  Imagen del Flyer *
                </label>
                
                {/* Input de archivo */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!currentPromotion}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-3 border border-dashed rounded-lg transition-colors duration-200"
                    style={{ 
                      borderColor: '#b08968',
                      backgroundColor: '#e6ccb2',
                      color: '#7f5539'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ddb892';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#e6ccb2';
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {selectedFile ? selectedFile.name : 'Seleccionar imagen desde tu computadora'}
                  </label>
                </div>

                {/* Preview de la imagen seleccionada */}
                {previewUrl && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: '#7f5539' }}>Vista previa:</p>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border" style={{ borderColor: '#b08968' }}>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm mt-1" style={{ color: '#b08968' }}>
                  Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB. Recomendado: formato vertical (9:16)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#7f5539' }}>
                    Válido Hasta
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#e6ccb2',
                      borderColor: '#b08968',
                      color: '#7f5539'
                    }}
                  />
                </div>
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
                  Promoción Activa
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ddb892', 
                    color: '#7f5539',
                    border: '2px solid #b08968'
                  }}
                >
                  {currentPromotion ? 'Actualizar Promoción' : 'Crear Promoción'}
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
      </div>
    </div>
  );
};

export default PromotionManagement;
