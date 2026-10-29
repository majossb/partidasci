import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { verificarExpiracionSesion, registrarActividad } from '@/lib/sessionManager';
import { cerrarSesionSegura } from '@/lib/supabase';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (usuario) {
      const { expirada, motivo } = verificarExpiracionSesion();
      if (expirada) {
        const msg = motivo === 'tiempo_maximo'
          ? 'Tu sesión ha alcanzado su límite de tiempo máximo. Vuelve a iniciar sesión.'
          : 'Tu sesión se cerró por inactividad. Vuelve a iniciar sesión.';
        cerrarSesionSegura(msg);
      } else {
        registrarActividad();
      }
    }
  }, [usuario, location.pathname]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-text-secondary font-serif text-lg animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  const { expirada } = verificarExpiracionSesion();
  if (!usuario || expirada) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

