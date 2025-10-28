import React, { useState, useEffect } from 'react';

const LoadingAnimation = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Tiempo mínimo de carga (2 segundos)
    const minLoadTime = setTimeout(() => {
      if (progress >= 100) {
        finishLoading();
      }
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minLoadTime);
    };
  }, [progress]);

  const finishLoading = () => {
    setIsVisible(false);
    setTimeout(() => {
      onFinish();
    }, 500); // Tiempo para la animación de salida
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ 
        backgroundColor: '#ede0d4',
        opacity: isVisible ? 1 : 0
      }}
    >
      {/* Logo de la hamburguesería */}
      <div className="relative animate-scale-in">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 animate-float" 
             style={{ borderColor: '#b08968' }}>
          <img
            src="/la.jpg"
            alt="Ala-Burguer Logo"
            className="w-full h-full object-cover"
            onLoad={() => {
              // Asegurar que el progreso llegue a 100% cuando la imagen se carga
              if (progress < 100) {
                setProgress(100);
              }
            }}
          />
        </div>
        
        {/* Efecto de brillo rotatorio */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin"
             style={{ animationDuration: '3s' }}>
        </div>
        
        {/* Efecto shimmer */}
        <div className="absolute inset-0 rounded-full animate-shimmer">
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Partículas flotantes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-ping"
             style={{ backgroundColor: '#b08968', animationDelay: '0s' }}>
        </div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full animate-ping"
             style={{ backgroundColor: '#ddb892', animationDelay: '1s' }}>
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full animate-ping"
             style={{ backgroundColor: '#7f5539', animationDelay: '2s' }}>
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 rounded-full animate-ping"
             style={{ backgroundColor: '#b08968', animationDelay: '0.5s' }}>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
