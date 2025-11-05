import { useEffect, useState, useRef } from 'react';
import { createSupabaseClientWithToken } from '../lib/supabase';

export function useRealtimeOrders(token, filter = '', fetchInitialOrders) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);
  const supabaseClientRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Crear cliente de Supabase con el token
    const supabaseClient = createSupabaseClientWithToken(token);
    supabaseClientRef.current = supabaseClient;

    // Cargar pedidos iniciales
    const loadInitialOrders = async () => {
      try {
        if (fetchInitialOrders) {
          const initialOrders = await fetchInitialOrders();
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
          console.log('Cambio recibido en tiempo real:', payload);
          
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
        console.log('Estado de suscripción Realtime:', status);
      });

    channelRef.current = channel;

    // Limpiar suscripción al desmontar
    return () => {
      if (channelRef.current && supabaseClientRef.current) {
        supabaseClientRef.current.removeChannel(channelRef.current);
      }
    };
  }, [token, filter, fetchInitialOrders]);

  return { orders, loading, setOrders };
}

