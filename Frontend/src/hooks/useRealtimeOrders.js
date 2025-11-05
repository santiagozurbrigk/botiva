import { useEffect, useState, useRef } from 'react';
import { getSupabaseClient } from '../lib/supabase';

export function useRealtimeOrders(token, filter = '', fetchInitialOrders) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);
  const supabaseClientRef = useRef(null);
  const fetchInitialOrdersRef = useRef(fetchInitialOrders);

  // Actualizar la referencia cuando fetchInitialOrders cambie
  useEffect(() => {
    fetchInitialOrdersRef.current = fetchInitialOrders;
  }, [fetchInitialOrders]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Obtener cliente singleton de Supabase con el token
    const supabaseClient = getSupabaseClient(token);
    supabaseClientRef.current = supabaseClient;

    // Limpiar canal anterior si existe
    if (channelRef.current && supabaseClientRef.current) {
      supabaseClientRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Cargar pedidos iniciales
    const loadInitialOrders = async () => {
      try {
        if (fetchInitialOrdersRef.current) {
          const initialOrders = await fetchInitialOrdersRef.current();
          setOrders(initialOrders || []);
        }
      } catch (error) {
        console.error('Error loading initial orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialOrders();

    // Configurar suscripción a cambios en tiempo real
    const channel = supabaseClient
      .channel(`orders-changes-${filter || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          // Solo loguear en desarrollo (no en producción)
          if (import.meta.env.DEV) {
            console.log('Cambio recibido en tiempo real:', payload.eventType, payload.new?.id || payload.old?.id);
          }
          
          if (payload.eventType === 'INSERT') {
            // Nuevo pedido creado - necesitamos obtener los datos completos
            try {
              const { data: newOrder, error } = await supabaseClient
                .from('orders')
                .select(`
                  *,
                  rider:riders(id, name, phone),
                  order_items(*)
                `)
                .eq('id', payload.new.id)
                .single();

              if (error) throw error;

              setOrders((prevOrders) => {
                // Verificar si el pedido ya existe (evitar duplicados)
                const exists = prevOrders.find(o => o.id === newOrder.id);
                if (exists) return prevOrders;
                
                // Si hay filtro, verificar que coincida
                if (filter && newOrder.status !== filter) {
                  return prevOrders;
                }
                
                // Agregar el nuevo pedido al inicio
                return [newOrder, ...prevOrders];
              });
            } catch (error) {
              console.error('Error fetching new order details:', error);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Pedido actualizado
            setOrders((prevOrders) => {
              const orderIndex = prevOrders.findIndex(o => o.id === payload.new.id);
              
              // Si el pedido no está en la lista y no hay filtro, intentar obtenerlo
              if (orderIndex === -1 && !filter) {
                // No hacer nada, esperar a que se cargue con fetchInitialOrders
                return prevOrders;
              }

              // Si hay filtro y el pedido actualizado no coincide, removerlo
              if (filter && payload.new.status !== filter) {
                return prevOrders.filter(o => o.id !== payload.new.id);
              }

              // Actualizar el pedido existente
              if (orderIndex !== -1) {
                const updatedOrders = [...prevOrders];
                updatedOrders[orderIndex] = {
                  ...updatedOrders[orderIndex],
                  ...payload.new,
                };
                return updatedOrders;
              }

              return prevOrders;
            });
          } else if (payload.eventType === 'DELETE') {
            // Pedido eliminado
            setOrders((prevOrders) =>
              prevOrders.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        // Solo loguear cambios de estado importantes
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (import.meta.env.DEV) {
            console.log('Realtime:', status);
          }
        }
      });

    channelRef.current = channel;

    // Limpiar suscripción al desmontar o cuando cambien las dependencias
    return () => {
      if (channelRef.current && supabaseClientRef.current) {
        supabaseClientRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [token, filter]); // Removido fetchInitialOrders de las dependencias para evitar re-renders

  return { orders, loading, setOrders };
}

