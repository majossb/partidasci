import { SupportedStorage } from '@supabase/supabase-js';

// Tiempos de configuración para el Despacho Parroquial
export const SESSION_CONFIG = {
  // 15 minutos de inactividad máxima
  INACTIVITY_TIMEOUT_MS: 15 * 60 * 1000,
  // Aviso preventivo a los 13 minutos (2 minutos antes del cierre)
  INACTIVITY_WARNING_MS: 13 * 60 * 1000,
  // Duración máxima de sesión normal (sin recordar): 4 horas
  NORMAL_SESSION_MAX_MS: 4 * 60 * 60 * 1000,
  // Duración máxima de sesión extendida (con recordar): 12 horas (1 turno de despacho)
  REMEMBER_SESSION_MAX_MS: 12 * 60 * 60 * 1000,
};

const STORAGE_KEYS = {
  REMEMBER_ME: 'sc_auth_remember_me',
  SESSION_START: 'sc_session_start_time',
  LAST_ACTIVITY: 'sc_last_activity_time',
  EXPIRED_REASON: 'sc_session_expired_reason',
};

/**
 * Obtiene si el usuario marcó "Mantener mi sesión iniciada"
 */
export function getRememberMePreference(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || sessionStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Registra la preferencia de persistencia seleccionada en el login
 */
export function setRememberMePreference(remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      sessionStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'false');
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  } catch (e) {
    console.error('Error guardando preferencia de sesión:', e);
  }
}

/**
 * Inicia el registro temporal de una nueva sesión
 */
export function iniciarRegistroSesion(remember: boolean): void {
  const ahora = Date.now();
  setRememberMePreference(remember);
  
  const storage = remember ? localStorage : sessionStorage;
  try {
    storage.setItem(STORAGE_KEYS.SESSION_START, ahora.toString());
    storage.setItem(STORAGE_KEYS.LAST_ACTIVITY, ahora.toString());
    
    // Limpiar el otro storage para evitar inconsistencias
    const otroStorage = remember ? sessionStorage : localStorage;
    otroStorage.removeItem(STORAGE_KEYS.SESSION_START);
    otroStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  } catch (e) {
    console.error('Error al iniciar registro de sesión:', e);
  }
}

/**
 * Registra actividad del usuario (con throttle para no saturar I/O)
 */
let ultimoRegistroActividad = 0;
export function registrarActividad(): void {
  const ahora = Date.now();
  // Throttle: actualizar máximo cada 5 segundos
  if (ahora - ultimoRegistroActividad < 5000) return;
  ultimoRegistroActividad = ahora;

  const remember = getRememberMePreference();
  const storage = remember ? localStorage : sessionStorage;
  try {
    storage.setItem(STORAGE_KEYS.LAST_ACTIVITY, ahora.toString());
  } catch {
    // Ignorar errores de cuota de storage
  }
}

/**
 * Obtiene la última marca de actividad registrada
 */
export function obtenerUltimaActividad(): number {
  try {
    const remember = getRememberMePreference();
    const storage = remember ? localStorage : sessionStorage;
    const val = storage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    return val ? parseInt(val, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

/**
 * Verifica si la sesión ha expirado por inactividad o por límite de tiempo absoluto
 */
export function verificarExpiracionSesion(): { expirada: boolean; motivo?: 'inactividad' | 'tiempo_maximo' } {
  const remember = getRememberMePreference();
  const storage = remember ? localStorage : sessionStorage;

  try {
    const sessionStartRaw = storage.getItem(STORAGE_KEYS.SESSION_START);
    const lastActivityRaw = storage.getItem(STORAGE_KEYS.LAST_ACTIVITY);

    if (!sessionStartRaw || !lastActivityRaw) {
      return { expirada: false };
    }

    const ahora = Date.now();
    const sessionStart = parseInt(sessionStartRaw, 10);
    const lastActivity = parseInt(lastActivityRaw, 10);

    // 1. Validar límite máximo de duración de la sesión
    const maxDuracion = remember 
      ? SESSION_CONFIG.REMEMBER_SESSION_MAX_MS 
      : SESSION_CONFIG.NORMAL_SESSION_MAX_MS;

    if (ahora - sessionStart > maxDuracion) {
      return { expirada: true, motivo: 'tiempo_maximo' };
    }

    // 2. Validar inactividad
    if (ahora - lastActivity > SESSION_CONFIG.INACTIVITY_TIMEOUT_MS) {
      return { expirada: true, motivo: 'inactividad' };
    }

    return { expirada: false };
  } catch {
    return { expirada: false };
  }
}

/**
 * Limpia todas las marcas de sesión en ambos tipos de almacenamiento
 */
export function limpiarMarcasSesion(): void {
  try {
    [localStorage, sessionStorage].forEach((storage) => {
      storage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      storage.removeItem(STORAGE_KEYS.SESSION_START);
      storage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    });
  } catch (e) {
    console.error('Error al limpiar marcas de sesión:', e);
  }
}

/**
 * Establece el motivo de expiración para mostrar mensaje informativo en el login
 */
export function setMotivoExpiracion(motivo: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.EXPIRED_REASON, motivo);
  } catch {}
}

/**
 * Obtiene y limpia el motivo de expiración registrado
 */
export function consumirMotivoExpiracion(): string | null {
  try {
    const motivo = sessionStorage.getItem(STORAGE_KEYS.EXPIRED_REASON);
    if (motivo) {
      sessionStorage.removeItem(STORAGE_KEYS.EXPIRED_REASON);
    }
    return motivo;
  } catch {
    return null;
  }
}

/**
 * Adaptador de almacenamiento dinámico para el cliente de Supabase
 * Permite alternar entre sessionStorage (normal) y localStorage (recordar)
 */
export const customSessionStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    // Si la sesión ha expirado por inactividad o tiempo máximo, no entregar el token
    const { expirada } = verificarExpiracionSesion();
    if (expirada) {
      return null;
    }

    // Buscar primero en sessionStorage (sesión por pestaña/ventana)
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal !== null) {
      return sessionVal;
    }

    // Si no está en sessionStorage, buscar en localStorage si se eligió persistencia
    return localStorage.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    const remember = getRememberMePreference();
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};
