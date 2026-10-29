import { useEffect } from 'react';
import { supabase, cerrarSesionSegura } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth.store';
import { RolUsuario } from '@/types/roles.types';
import { verificarExpiracionSesion, registrarActividad } from '@/lib/sessionManager';

export function useAuth() {
  const { setUsuario, setCargando } = useAuthStore();

  useEffect(() => {
    let montado = true;

    const esUrlRecuperacion = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      return (
        path === '/restablecer-password' ||
        hash.includes('type=recovery') ||
        hash.includes('access_token=') ||
        search.includes('type=recovery') ||
        search.includes('code=')
      );
    };

    const chequearSesion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (montado) {
          // Si hay sesión activa pero ya expiró por inactividad o tiempo máximo, invalidar de inmediato
          if (session?.user && !esUrlRecuperacion()) {
            const { expirada, motivo } = verificarExpiracionSesion();
            if (expirada) {
              const msg = motivo === 'tiempo_maximo'
                ? 'Tu sesión ha alcanzado su límite de tiempo máximo. Vuelve a iniciar sesión.'
                : 'Tu sesión se cerró por inactividad. Vuelve a iniciar sesión.';
              await cerrarSesionSegura(msg);
              return;
            }

            registrarActividad();
            const rol = session.user.app_metadata?.role as RolUsuario || null;
            setUsuario({
              id: session.user.id,
              email: session.user.email || '',
              rol
            });
          } else if (!esUrlRecuperacion()) {
            setUsuario(null);
          }
          setCargando(false);
        }
      } catch (error) {
        console.error("Error comprobando sesión:", error);
        if (montado) {
          if (!esUrlRecuperacion()) setUsuario(null);
          setCargando(false);
        }
      }
    };

    chequearSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Si Supabase indica evento de recuperación de contraseña, redirigir inmediatamente a /restablecer-password
        if (event === 'PASSWORD_RECOVERY') {
          if (window.location.pathname !== '/restablecer-password') {
            window.location.href = `/restablecer-password${window.location.hash}${window.location.search}`;
          }
          return;
        }

        const enRecuperacion = esUrlRecuperacion();

        if (session?.user && !enRecuperacion) {
          // Si el evento es renovación de token o inicio, verificar expiración
          const { expirada, motivo } = verificarExpiracionSesion();
          if (expirada) {
            const msg = motivo === 'tiempo_maximo'
              ? 'Tu sesión ha alcanzado su límite de tiempo máximo. Vuelve a iniciar sesión.'
              : 'Tu sesión se cerró por inactividad. Vuelve a iniciar sesión.';
            await cerrarSesionSegura(msg);
            return;
          }

          registrarActividad();
          const rol = session.user.app_metadata?.role as RolUsuario || null;
          setUsuario({
            id: session.user.id,
            email: session.user.email || '',
            rol
          });
        } else if (!enRecuperacion) {
          setUsuario(null);
        }
        setCargando(false);
      }
    );

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, [setUsuario, setCargando]);
}

