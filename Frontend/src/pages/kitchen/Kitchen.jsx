import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '../../lib/api';
import SwipeableOrderCard from '../../components/kitchen/SwipeableOrderCard';

export default function Kitchen() {
  const restaurantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurant_id') || '';
  }, []);

  const [orders, setOrders] = useState([]);
  const [hiddenOrderIds, setHiddenOrderIds] = useState(new Set());
  const hiddenOrderIdsRef = useRef(new Set());
  const previousOrderIdsRef = useRef(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(() => {
    // Verificar si el audio estaba habilitado anteriormente
    return localStorage.getItem('kitchenAudioEnabled') === 'true';
  });
  const audioContextRef = useRef(null);

  // Función para activar audio (requerido por algunos navegadores)
  const enableAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      
      // Intentar reanudar el contexto (requiere interacción del usuario)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Reproducir un sonido de prueba muy corto para activar el audio
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + 0.001);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.002);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.002);
      
      setAudioEnabled(true);
      localStorage.setItem('kitchenAudioEnabled', 'true');
    } catch (error) {
      console.error('Error enabling audio:', error);
    }
  }, []);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (!audioEnabled) return; // No reproducir si el audio no está habilitado
    
    try {
      // Crear AudioContext si no existe
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Algunos navegadores requieren que el contexto esté en estado "running"
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {
          // Si no se puede reanudar, el audio no está disponible
          setAudioEnabled(false);
        });
        return;
      }

      const now = audioContext.currentTime;

      // Primer tono (ding)
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();

      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);

      oscillator1.frequency.setValueAtTime(800, now);
      oscillator1.frequency.setValueAtTime(600, now + 0.1);
      oscillator1.type = 'sine';

      gainNode1.gain.setValueAtTime(0, now);
      gainNode1.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator1.start(now);
      oscillator1.stop(now + 0.3);

      // Segundo tono (dong) después de 150ms
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      const secondToneStart = now + 0.15;
      oscillator2.frequency.setValueAtTime(600, secondToneStart);
      oscillator2.frequency.setValueAtTime(400, secondToneStart + 0.1);
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0, secondToneStart);
      gainNode2.gain.linearRampToValueAtTime(0.3, secondToneStart + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, secondToneStart + 0.3);

      oscillator2.start(secondToneStart);
      oscillator2.stop(secondToneStart + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [audioEnabled]);

  // Función para obtener y actualizar pedidos
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) {
      setErrorMessage('Este panel debe abrirse desde el enlace personalizado que incluye el restaurant_id.');
      setLoading(false);
      return;
    }

    try {
      setErrorMessage('');
      const data = await api.getKitchenOrders(restaurantId);
      const ordersArray = Array.isArray(data) ? data : [];
      // Filtrar comandas que ya están marcadas como "listo para retirar" o están ocultas
      const filteredOrders = ordersArray.filter(order => 
        order.status === 'pendiente' && !hiddenOrderIdsRef.current.has(order.id)
      );

      // Detectar nuevas comandas comparando IDs
      if (previousOrderIdsRef.current.size > 0) {
        const currentOrderIds = new Set(filteredOrders.map(order => order.id));
        const newOrderIds = filteredOrders
          .filter(order => !previousOrderIdsRef.current.has(order.id))
          .map(order => order.id);

        // Si hay nuevas comandas, reproducir sonido
        if (newOrderIds.length > 0) {
          playNotificationSound();
        }

        // Actualizar referencia de IDs anteriores
        previousOrderIdsRef.current = currentOrderIds;
      } else {
        // Primera carga: guardar los IDs sin reproducir sonido
        previousOrderIdsRef.current = new Set(filteredOrders.map(order => order.id));
      }

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      setErrorMessage(error.message || 'No pudimos cargar las comandas.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, playNotificationSound]);

  // Usar polling cada 5 segundos para cocina
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Actualizar la referencia cuando cambie hiddenOrderIds
  useEffect(() => {
    hiddenOrderIdsRef.current = hiddenOrderIds;
  }, [hiddenOrderIds]);

  // Intentar activar el audio automáticamente si estaba habilitado anteriormente (solo al cargar)
  useEffect(() => {
    const wasAudioEnabled = localStorage.getItem('kitchenAudioEnabled') === 'true';
    if (wasAudioEnabled && audioEnabled) {
      // Intentar activar el contexto de audio si ya estaba habilitado
      const tryEnableAudio = async () => {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          }
          const audioContext = audioContextRef.current;
          if (audioContext.state === 'suspended') {
            // Intentar reanudar, pero si falla, el usuario tendrá que hacer clic
            await audioContext.resume();
          }
        } catch (error) {
          // Si falla, desactivar el audio y requerir que el usuario active manualmente
          console.log('Audio no disponible automáticamente, se requiere interacción del usuario');
          setAudioEnabled(false);
          localStorage.removeItem('kitchenAudioEnabled');
        }
      };
      tryEnableAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al cargar

  const handleMarkReady = async (orderId) => {
    if (!restaurantId) {
      alert('Falta el restaurant_id. Abra este panel desde el enlace provisto por Botiva.');
      return;
    }

    try {
      await api.updateKitchenOrderStatus(orderId, 'listo para retirar', restaurantId);
      // Ocultar la comanda de la vista ya que cambió de estado
      const newHiddenSet = new Set([...hiddenOrderIdsRef.current, orderId]);
      setHiddenOrderIds(newHiddenSet);
      hiddenOrderIdsRef.current = newHiddenSet;
      // Remover de la lista de órdenes visibles
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleHideOrder = (orderId) => {
    // Solo ocultar de la vista, no eliminar de la base de datos
    const newHiddenSet = new Set([...hiddenOrderIdsRef.current, orderId]);
    setHiddenOrderIds(newHiddenSet);
    hiddenOrderIdsRef.current = newHiddenSet;
    // Remover de la lista de órdenes visibles
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">Cargando comandas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Cocina</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comandas pendientes - {orders.length} {orders.length === 1 ? 'comanda' : 'comandas'}
            </p>
          </div>
          {!audioEnabled && (
            <button
              onClick={enableAudio}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m-2.828-9.9a9 9 0 0112.728 0" />
              </svg>
              Activar Sonidos
            </button>
          )}
          {audioEnabled && (
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Sonidos Activados
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay comandas pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="relative w-full">
                <SwipeableOrderCard
                  order={order}
                  onSwipeRight={() => handleMarkReady(order.id)}
                  onSwipeLeft={() => handleHideOrder(order.id)}
                  formatTime={formatTime}
                  formatDateTime={formatDateTime}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

