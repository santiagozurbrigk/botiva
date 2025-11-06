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
    <div className="relative">
      <div
        ref={cardRef}
        className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 transition-all duration-200 relative cursor-grab active:cursor-grabbing"
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

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Mesa {order.table_number}
            </h3>
            <p className="text-sm text-gray-500">
              {order.waiter?.name || 'Sin mozo asignado'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Hora</div>
            <div className="text-sm font-medium text-gray-900">
              {formatTime(order.created_at)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Cliente:</span> {order.customer_name}
          </div>
          {order.customer_phone && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Tel:</span> {order.customer_phone}
            </div>
          )}
          {order.scheduled_delivery_time && (
            <div className="text-sm text-orange-600 font-medium mb-2 bg-orange-50 p-2 rounded">
              ⏰ Para: {formatDateTime(order.scheduled_delivery_time)}
            </div>
          )}
        </div>

        <div className="mb-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Productos:</h4>
          <ul className="space-y-2">
            {order.order_items && order.order_items.map((item, index) => (
              <li key={index} className="text-sm text-gray-900">
                <span className="font-medium">{item.quantity}x</span> {item.product_name}
                {item.unit_price && (
                  <span className="text-gray-500 ml-2">
                    (${parseFloat(item.unit_price).toFixed(2)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(order.total_amount || 0).toFixed(2)}
            </span>
          </div>
          {order.payment_method && (
            <div className="text-xs text-gray-500 mt-1">
              Pago: {order.payment_method}
            </div>
          )}
        </div>

        <button
          onClick={onSwipeRight}
          className="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          ✓ Marcar como Listo para Retirar
        </button>

        {/* Instrucciones de swipe */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Desliza → Listo | ← Ocultar
        </div>
      </div>
    </div>
  );
}

