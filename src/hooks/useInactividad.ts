import { useEffect, useState, useRef, useCallback } from 'react';
import { cerrarSesionSegura } from '@/lib/supabase';
import { 
  SESSION_CONFIG, 
  registrarActividad, 
  obtenerUltimaActividad, 
  verificarExpiracionSesion 
} from '@/lib/sessionManager';

export function useInactividad(minutosTimeout: number = 15) {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalCheckRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoutInactividad = useCallback(async () => {
    await cerrarSesionSegura('Tu sesión se cerró por inactividad (15 minutos sin uso). Vuelve a iniciar sesión.');
  }, []);

  const resetTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    setShowWarning(false);
    registrarActividad();

    // Si el timeout es <= 2 minutos, cerramos de una vez sin aviso
    if (minutosTimeout <= 2) {
      timeoutRef.current = setTimeout(handleLogoutInactividad, minutosTimeout * 60 * 1000);
      return;
    }

    const warningTimeMs = (minutosTimeout - 2) * 60 * 1000;
    
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      
      timeoutRef.current = setTimeout(() => {
        handleLogoutInactividad();
      }, 2 * 60 * 1000); // 2 minutos después del aviso
      
    }, warningTimeMs);
  }, [minutosTimeout, handleLogoutInactividad]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Sincronización entre múltiples pestañas abiertas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sc_last_activity_time') {
        if (!showWarning) {
          resetTimers();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Verificación periódica activa cada 15 segundos (detecta reanudación tras suspensión de equipo)
    intervalCheckRef.current = setInterval(() => {
      const { expirada, motivo } = verificarExpiracionSesion();
      if (expirada) {
        if (motivo === 'tiempo_maximo') {
          cerrarSesionSegura('Tu sesión ha alcanzado su límite de tiempo máximo. Inicia sesión nuevamente.');
        } else {
          handleLogoutInactividad();
        }
      }
    }, 15000);

    resetTimers();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (intervalCheckRef.current) clearInterval(intervalCheckRef.current);
    };
  }, [minutosTimeout, showWarning, resetTimers, handleLogoutInactividad]);

  return {
    showWarning,
    keepAlive: resetTimers,
    forceLogout: handleLogoutInactividad
  };
}

