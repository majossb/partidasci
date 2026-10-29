import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

export interface UseCambiosNoGuardadosReturn {
  isBlocked: boolean;
  proceed: () => void;
  reset: () => void;
}

/**
 * Hook para detectar cambios no guardados en formularios y bloquear
 * la navegación interna o del navegador hasta que el usuario decida.
 */
export function useCambiosNoGuardados(isDirty: boolean): UseCambiosNoGuardadosReturn {
  // Bloqueador de navegación interna de React Router (menús, enlaces, botones atrás)
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  // Advertencia nativa ante recargas de página (F5) o cierre de pestaña/ventana
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return {
    isBlocked: blocker.state === 'blocked',
    proceed: () => {
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
    },
    reset: () => {
      if (blocker.state === 'blocked') {
        blocker.reset();
      }
    },
  };
}
