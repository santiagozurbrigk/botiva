import React, { useState } from 'react';

const PromotionFlyer = ({ flyerData }) => {
  const [imageError, setImageError] = useState(false);

  if (!flyerData || !flyerData.isActive) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="relative rounded-lg overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ borderColor: '#b08968' }}>
        {/* Imagen del flyer en formato vertical 9:16 */}
        <div className="relative w-full max-w-sm mx-auto h-96 md:h-[500px] lg:h-[600px]">
          {flyerData.image && !imageError ? (
            <img
              src={flyerData.image}
              alt={flyerData.title || 'Promoción'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#e6ccb2' }}>
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#b08968' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-semibold" style={{ color: '#7f5539' }}>
                  {flyerData.title || 'Promoción Especial'}
                </p>
                {flyerData.description && (
                  <p className="text-sm mt-2" style={{ color: '#b08968' }}>
                    {flyerData.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionFlyer;
