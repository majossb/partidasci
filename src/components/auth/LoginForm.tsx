import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Timer, Loader2, Info } from 'lucide-react';
import SolicitudResetModal from '@/components/auth/SolicitudResetModal';
import { 
  iniciarRegistroSesion, 
  setRememberMePreference, 
  getRememberMePreference,
  consumirMotivoExpiracion 
} from '@/lib/sessionManager';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Control de Intentos de Interfaz (Frontend UI / UX) ──────────────────────────────────
// NOTA DE SEGURIDAD: Este control opera exclusivamente en el navegador (localStorage)
// para evitar envíos repetitivos accidentales y disuadir intentos casuales desde la UI.
// NO constituye una barrera criptográfica de backend contra ataques automatizados directos.
// La protección real contra fuerza bruta reside en el rate limiter del servidor GoTrue de Supabase.
const MAX_INTENTOS = parseInt(import.meta.env.VITE_RATE_LIMIT_INTENTOS ?? '5');
const MINUTOS_BLOQUEO = parseInt(import.meta.env.VITE_RATE_LIMIT_MINUTOS ?? '15');
const STORAGE_KEY = 'login_attempts';

interface IntentosData {
  count: number;
  primerIntento: number;
}

function getIntentos(): IntentosData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, primerIntento: Date.now() };
  } catch {
    return { count: 0, primerIntento: Date.now() };
  }
}

function obtenerTiempoRestanteSegundos(): number {
  const data = getIntentos();
  if (data.count < MAX_INTENTOS) return 0;
  const ahora = Date.now();
  const ventanaMs = MINUTOS_BLOQUEO * 60 * 1000;
  const transcurrido = ahora - data.primerIntento;
  const restanteMs = ventanaMs - transcurrido;
  return restanteMs > 0 ? Math.ceil(restanteMs / 1000) : 0;
}

function registrarIntentoFallido() {
  const data = getIntentos();
  const ahora = Date.now();
  const ventanaMs = MINUTOS_BLOQUEO * 60 * 1000;
  if (ahora - data.primerIntento > ventanaMs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 1, primerIntento: ahora }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, count: data.count + 1 }));
  }
}

function limpiarIntentos() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function LoginForm() {
  const location = useLocation();
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [avisoSesion, setAvisoSesion] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState<boolean>(() => getRememberMePreference());
  const [segundosBloqueo, setSegundosBloqueo] = useState<number>(obtenerTiempoRestanteSegundos());
  const [modalResetOpen, setModalResetOpen] = useState(false);

  // Comprobar mensajes de expiración o cierre por inactividad
  useEffect(() => {
    const motivo = consumirMotivoExpiracion();
    if (motivo) {
      setAvisoSesion(motivo);
    } else if (location.state?.message) {
      setAvisoSesion(location.state.message);
    }
  }, [location.state]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  // Contador regresivo en vivo cuando está bloqueado
  useEffect(() => {
    if (segundosBloqueo <= 0) return;
    const interval = setInterval(() => {
      const rest = obtenerTiempoRestanteSegundos();
      setSegundosBloqueo(rest);
      if (rest <= 0) {
        limpiarIntentos();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [segundosBloqueo]);

  const onSubmit = async (data: LoginFormValues) => {
    const restante = obtenerTiempoRestanteSegundos();
    if (restante > 0) {
      setSegundosBloqueo(restante);
      return;
    }

    setErrorAcceso(null);
    setAvisoSesion(null);
    try {
      // Registrar la preferencia elegida antes de iniciar la solicitud
      setRememberMePreference(recordarSesion);

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        registrarIntentoFallido();
        const nuevoRestante = obtenerTiempoRestanteSegundos();
        if (nuevoRestante > 0) {
          setSegundosBloqueo(nuevoRestante);
          setErrorAcceso(`Demasiados intentos fallidos. Tu acceso se ha bloqueado temporalmente por ${MINUTOS_BLOQUEO} minutos.`);
        } else {
          if (error.message.includes('Invalid login credentials')) {
            const intentos = getIntentos().count;
            const faltantes = MAX_INTENTOS - intentos;
            setErrorAcceso(`Credenciales incorrectas. Te quedan ${faltantes} intento(s) antes del bloqueo.`);
          } else {
            setErrorAcceso(error.message);
          }
        }
      } else {
        limpiarIntentos();
        // Iniciar el seguimiento temporal de la sesión con la caducidad respectiva
        iniciarRegistroSesion(recordarSesion);
      }
    } catch (err) {
      setErrorAcceso('Ocurrió un error inesperado. Intenta nuevamente.');
    }
  };

  const estaBloqueado = segundosBloqueo > 0;
  const minutosRestantes = Math.floor(segundosBloqueo / 60);
  const segsRestantes = segundosBloqueo % 60;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {estaBloqueado && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-sans flex items-start gap-3 animate-in fade-in duration-200 shadow-sm">
            <Timer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Acceso pausado por seguridad</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Has superado el número máximo de intentos ({MAX_INTENTOS}). Intenta de nuevo en{' '}
                <span className="font-mono font-bold text-amber-900">
                  {minutosRestantes > 0 ? `${minutosRestantes}m ` : ''}{segsRestantes}s
                </span>.
              </p>
            </div>
          </div>
        )}

        {avisoSesion && !errorAcceso && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-sans flex items-start gap-2.5 animate-in fade-in duration-150 shadow-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium">{avisoSesion}</span>
          </div>
        )}

        {errorAcceso && !estaBloqueado && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-sans flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs sm:text-sm">{errorAcceso}</span>
          </div>
        )}

        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-sans">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/60">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              disabled={estaBloqueado || isSubmitting}
              placeholder="ejemplo@parroquia.com"
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-[#6B1E2E]'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-text-primary placeholder:text-text-secondary/40 transition-all font-sans disabled:bg-surface disabled:opacity-60`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 font-sans">{errors.email.message}</p>
          )}
        </div>

        {/* Campo Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 font-sans">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/60">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              disabled={estaBloqueado || isSubmitting}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-[#6B1E2E]'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-text-primary placeholder:text-text-secondary/40 transition-all font-sans disabled:bg-surface disabled:opacity-60`}
              {...register('password')}
            />
            <button
              type="button"
              disabled={estaBloqueado || isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary/60 hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div>
              {errors.password && (
                <p className="text-xs text-red-600 font-sans">{errors.password.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setModalResetOpen(true)}
              className="text-xs font-semibold text-[#6B1E2E] hover:text-[#8B293F] hover:underline transition-colors cursor-pointer ml-auto whitespace-nowrap font-sans"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        {/* Opción Mantener mi sesión iniciada */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="remember_me"
              checked={recordarSesion}
              disabled={estaBloqueado || isSubmitting}
              onChange={(e) => setRecordarSesion(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#6B1E2E] focus:ring-[#6B1E2E] cursor-pointer"
            />
            <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors font-medium">
              Mantener mi sesión iniciada
            </span>
          </label>
        </div>

        {/* Botón de Submit */}
        <Button
          type="submit"
          disabled={estaBloqueado || isSubmitting}
          className="w-full mt-6 py-2.5 bg-[#6B1E2E] hover:bg-[#8B293F] text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : estaBloqueado ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Bloqueado ({minutosRestantes > 0 ? `${minutosRestantes}m ` : ''}{segsRestantes}s)</span>
            </>
          ) : (
            <span>Ingresar al Sistema</span>
          )}
        </Button>
      </form>

      <SolicitudResetModal isOpen={modalResetOpen} onClose={() => setModalResetOpen(false)} />
    </>
  );
}
