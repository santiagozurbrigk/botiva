import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente singleton global de Supabase (una sola instancia para toda la app)
// Esto evita el warning de múltiples instancias de GoTrueClient
let supabaseClientInstance = null;

// Función para obtener o crear el cliente singleton
// Esta función garantiza que solo se cree UNA instancia en toda la aplicación
const getSupabaseClientInstance = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // No guardar sesión para evitar conflictos
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          // Usar un storage personalizado que no persista nada
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        // Headers se configurarán dinámicamente por llamada
        headers: {},
      },
    });
  }
  return supabaseClientInstance;
};

// Exportar cliente singleton (esta es la única instancia que se usará)
export const supabase = getSupabaseClientInstance();

// Función para obtener cliente con token
// Siempre devuelve la misma instancia singleton
export const getSupabaseClient = (token = null) => {
  const client = getSupabaseClientInstance();
  
  // Guardar el token en el cliente para uso en queries
  if (token) {
    client._currentToken = token;
  }
  
  return client;
};

