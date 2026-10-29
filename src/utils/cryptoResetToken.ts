import { supabase } from '@/lib/supabase';

// ─── Rate Limiting (client-side) ───────────────────────────────
const RATE_LIMIT_RESET_KEY = 'password_reset_attempts';
const MAX_RESET_INTENTOS = 5;
const RESET_WINDOW_MINUTOS = 15;

interface ResetRateLimitData {
  count: number;
  primerIntento: number;
}

function getResetRateLimit(email: string): ResetRateLimitData {
  try {
    const raw = localStorage.getItem(`${RATE_LIMIT_RESET_KEY}_${email.toLowerCase()}`);
    return raw ? JSON.parse(raw) : { count: 0, primerIntento: Date.now() };
  } catch {
    return { count: 0, primerIntento: Date.now() };
  }
}

export function verificarRateLimitReset(email: string): { permitido: boolean; segundosRestantes: number } {
  const data = getResetRateLimit(email);
  const ahora = Date.now();
  const ventanaMs = RESET_WINDOW_MINUTOS * 60 * 1000;

  if (ahora - data.primerIntento > ventanaMs) {
    return { permitido: true, segundosRestantes: 0 };
  }

  if (data.count >= MAX_RESET_INTENTOS) {
    const transcurrido = ahora - data.primerIntento;
    const restanteMs = ventanaMs - transcurrido;
    return { permitido: false, segundosRestantes: Math.max(1, Math.ceil(restanteMs / 1000)) };
  }

  return { permitido: true, segundosRestantes: 0 };
}

function registrarIntentoReset(email: string) {
  const emailClean = email.toLowerCase();
  const data = getResetRateLimit(emailClean);
  const ahora = Date.now();
  const ventanaMs = RESET_WINDOW_MINUTOS * 60 * 1000;

  if (ahora - data.primerIntento > ventanaMs) {
    localStorage.setItem(`${RATE_LIMIT_RESET_KEY}_${emailClean}`, JSON.stringify({ count: 1, primerIntento: ahora }));
  } else {
    localStorage.setItem(`${RATE_LIMIT_RESET_KEY}_${emailClean}`, JSON.stringify({ ...data, count: data.count + 1 }));
  }
}

export function limpiarRateLimitReset(email: string) {
  try {
    localStorage.removeItem(`${RATE_LIMIT_RESET_KEY}_${email.toLowerCase()}`);
  } catch {}
}

// ─── Solicitud de restablecimiento ─────────────────────────────
/**
 * Solicita el restablecimiento de contraseña usando el flujo nativo de Supabase Auth.
 */
export async function solicitarRestablecimientoPassword(email: string): Promise<{
  mensaje: string;
  bloqueado?: boolean;
  segundos?: number;
  errorDev?: string;
}> {
  const emailClean = email.trim().toLowerCase();

  // 1. Verificar Rate Limit local
  const { permitido, segundosRestantes } = verificarRateLimitReset(emailClean);
  if (!permitido) {
    return {
      mensaje: `Demasiados intentos. Por favor espera ${Math.ceil(segundosRestantes / 60)} minuto(s) antes de solicitar otro enlace.`,
      bloqueado: true,
      segundos: segundosRestantes,
    };
  }

  registrarIntentoReset(emailClean);

  const mensajeGenerico =
    'Si el correo está registrado en el sistema, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.';

  try {
    const redirectUrl = `${window.location.origin}/restablecer-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(emailClean, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('[Reset Password] Error de Supabase:', error.message);
      
      // En modo desarrollo, si hay un rate limit de Supabase (ej: 60s cooldown o limite de emails), lo informamos
      if (import.meta.env.DEV && (error.message.includes('60 seconds') || error.message.includes('rate limit'))) {
        return {
          mensaje: mensajeGenerico,
          errorDev: `Aviso Supabase: ${error.message}`
        };
      }
    }
  } catch (err: any) {
    console.error('[Reset Password] Error inesperado:', err);
  }

  return { mensaje: mensajeGenerico };
}
