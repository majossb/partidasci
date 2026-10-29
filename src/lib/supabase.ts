import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'
import { customSessionStorage, limpiarMarcasSesion, setMotivoExpiracion } from './sessionManager'
import { useAuthStore } from '@/store/auth.store'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Configuración de Supabase con almacenamiento de sesión dinámico y seguro
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customSessionStorage,
  }
})

/**
 * Cierre de sesión seguro y centralizado:
 * 1. Invalida la sesión en el servidor Supabase (scope: 'global')
 * 2. Limpia tokens y marcas de sesión en localStorage y sessionStorage
 * 3. Limpia el store en memoria
 * 4. Reemplaza el historial para evitar volver con el botón 'Atrás'
 */
export async function cerrarSesionSegura(motivo?: string): Promise<void> {
  if (motivo) {
    setMotivoExpiracion(motivo);
  }

  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  } finally {
    limpiarMarcasSesion();

    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sb-')) localStorage.removeItem(k);
      });
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('sb-')) sessionStorage.removeItem(k);
      });
    } catch {}

    useAuthStore.getState().logout();

    // Evitar volver atrás con el botón del navegador
    window.history.replaceState(null, '', '/login');
    window.location.href = '/login';
  }
}

