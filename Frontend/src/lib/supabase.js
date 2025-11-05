import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente singleton de Supabase (evita múltiples instancias)
let supabaseClientInstance = null;

export const getSupabaseClient = (token = null) => {
  // Si no hay cliente o el token cambió, crear uno nuevo
  if (!supabaseClientInstance || (token && supabaseClientInstance._token !== token)) {
    const options = {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    };

    // Si hay token, agregarlo a los headers
    if (token) {
      options.global = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      options.auth = {
        persistSession: false, // No guardar sesión para evitar conflictos
        autoRefreshToken: false,
      };
    }

    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, options);
    supabaseClientInstance._token = token; // Guardar token para comparación
  }

  return supabaseClientInstance;
};

// Cliente base (sin token) para compatibilidad
export const supabase = getSupabaseClient();

