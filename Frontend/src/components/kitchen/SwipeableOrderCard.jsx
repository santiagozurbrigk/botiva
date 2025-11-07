import { useState, useRef, useCallback, useEffect } from 'react';

export default function SwipeableOrderCard({ order, onSwipeRight, onSwipeLeft, formatTime, formatDateTime }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const cardRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    const x = e.touches[0].clientX;
    setStartX(x);
    setCurrentX(x);
    startXRef.current = x;
    currentXRef.current = x;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.touches[0].clientX;
    setCurrentX(x);
    currentXRef.current = x;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    
    const diff = currentXRef.current - startXRef.current;
    const threshold = 100; // Mínimo de píxeles para activar el swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe a la derecha - Marcar como listo
        onSwipeRight();
      } else {
        // Swipe a la izquierda - Ocultar
        setIsHidden(true);
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    isDraggingRef.current = false;
    setStartX(0);
    setCurrentX(0);
    startXRef.current = 0;
    currentXRef.current = 0;
  };

  const handleMouseMoveGlobal = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    setCurrentX(x);
    currentXRef.current = x;
  }, []);

  const handleMouseUpGlobal = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    const diff = currentXRef.current - startXRef.current;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeRight();
      } else {
        setIsHidden(true);
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    isDraggingRef.current = false;
    setStartX(0);
    setCurrentX(0);
    startXRef.current = 0;
    currentXRef.current = 0;
    
    // Remover event listeners globales
    document.removeEventListener('mousemove', handleMouseMoveGlobal);
    document.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [onSwipeRight, onSwipeLeft]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    const x = e.clientX;
    setStartX(x);
    setCurrentX(x);
    startXRef.current = x;
    currentXRef.current = x;
    
    // Agregar event listeners globales para manejar cuando el mouse sale del componente
    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    setCurrentX(x);
    currentXRef.current = x;
  };

  const handleMouseUp = () => {
    handleMouseUpGlobal();
  };

  // Limpiar event listeners cuando el componente se desmonte
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [handleMouseMoveGlobal, handleMouseUpGlobal]);

  if (isHidden) {
    return null;
  }

  const translateX = isDragging ? currentX - startX : 0;
  const opacity = isDragging ? 1 - Math.abs(translateX) / 300 : 1;

  return (
    <div className="relative w-full">
      <div
        ref={cardRef}
        className="bg-white rounded-lg shadow-md p-4 lg:p-5 border-l-4 border-yellow-500 transition-all duration-200 relative cursor-grab active:cursor-grabbing w-full"
        style={{
          transform: `translateX(${translateX}px)`,
          opacity: Math.max(0.3, opacity),
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Indicadores visuales de swipe */}
        {isDragging && (
          <>
            {translateX > 50 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-lg z-10 pointer-events-none">
                ✓ Listo
              </div>
            )}
            {translateX < -50 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-600 font-bold text-lg z-10 pointer-events-none">
                ✕ Ocultar
              </div>
            )}
          </>
        )}

        <div className="flex flex-row items-center justify-between gap-4 lg:gap-6">
          {/* Columna 1: Mesa y Mozo */}
          <div className="flex-shrink-0 w-24 lg:w-32">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
              Mesa {order.table_number}
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              {order.waiter?.name || 'Sin mozo'}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              {formatTime(order.created_at)}
            </div>
          </div>

          {/* Columna 2: Cliente y Teléfono */}
          <div className="flex-shrink-0 w-40 lg:w-52">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Cliente:</span>{' '}
              <span className="break-words">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                <span className="font-medium">Tel:</span> {order.customer_phone}
              </div>
            )}
            {order.scheduled_delivery_time && (
              <div className="text-xs text-orange-600 font-medium mt-2 bg-orange-50 px-2 py-1 rounded inline-block">
                ⏰ {formatDateTime(order.scheduled_delivery_time)}
              </div>
            )}
          </div>

          {/* Columna 3: Productos */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-gray-500 mb-1 uppercase">Productos:</h4>
            <div className="flex flex-wrap gap-x-3 lg:gap-x-4 gap-y-1">
              {order.order_items && order.order_items.map((item, index) => (
                <div key={index} className="text-sm text-gray-900 whitespace-nowrap">
                  <span className="font-bold text-gray-700">{item.quantity}x</span>{' '}
                  <span>{item.product_name}</span>
                  {item.unit_price && (
                    <span className="text-gray-500 ml-1">
                      (${parseFloat(item.unit_price).toFixed(2)})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columna 4: Total y Botón */}
          <div className="flex-shrink-0 w-28 lg:w-36 flex flex-col items-end justify-center gap-2">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase">Total</div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900">
                ${parseFloat(order.total_amount || 0).toFixed(2)}
              </div>
              {order.payment_method && (
                <div className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
                  {order.payment_method}
                </div>
              )}
            </div>
            <button
              onClick={onSwipeRight}
              className="px-3 lg:px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-xs lg:text-sm whitespace-nowrap"
            >
              ✓ Listo
            </button>
          </div>
        </div>

        {/* Instrucciones de swipe - Solo en pantallas pequeñas */}
        <div className="mt-2 text-xs text-gray-400 text-center lg:hidden">
          Desliza → Listo | ← Ocultar
        </div>
      </div>
    </div>
  );
}

