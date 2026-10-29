import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, KeyRound, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import fondoLogin from '@/assets/images/fondo-login.svg';
import { PARROQUIA_CONFIG } from '@/utils/constantes';
import SolicitudResetModal from '@/components/auth/SolicitudResetModal';

type EstadoPagina = 'validando' | 'formulario' | 'exito' | 'error';

export default function RestablecerPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [estado, setEstado] = useState<EstadoPagina>('validando');
  const [errorMensaje, setErrorMensaje] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Auto-redirect timer for success state
  const [countdown, setCountdown] = useState(5);

  // ─── Extraer tokens de la URL hash o search ──────────────────
  const getUrlTokens = () => {
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(rawHash);
    
    return {
      accessToken: hashParams.get('access_token') || searchParams.get('access_token'),
      refreshToken: hashParams.get('refresh_token') || searchParams.get('refresh_token'),
      type: hashParams.get('type') || searchParams.get('type'),
      code: searchParams.get('code')
    };
  };

  // ─── Inicialización y Escucha de Sesión de Recuperación ──────
  useEffect(() => {
    let unmounted = false;

    async function inicializarSesion() {
      try {
        const { accessToken, refreshToken, code } = getUrlTokens();

        // 1. Si viene un código PKCE (?code=...)
        if (code) {
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!unmounted && !exchangeErr && exchangeData?.session) {
            setEstado('formulario');
            return;
          }
        }

        // 2. Si vienen tokens en el hash (#access_token=...)
        if (accessToken) {
          const { data: setRes, error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (!unmounted && !setErr && setRes?.session) {
            setEstado('formulario');
            return;
          }
        }

        // 3. Consultar si ya existe una sesión activa de recuperación
        const { data: { session } } = await supabase.auth.getSession();

        if (!unmounted) {
          if (session?.user) {
            setEstado('formulario');
          } else {
            // Dar un tiempo de gracia a la suscripción onAuthStateChange por si Supabase procesa en segundo plano
            setTimeout(async () => {
              if (unmounted) return;
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user) {
                setEstado('formulario');
              } else {
                setEstado('error');
                setErrorMensaje(
                  'El enlace de recuperación es inválido o ha expirado. Por favor solicita un nuevo correo de recuperación.'
                );
              }
            }, 1200);
          }
        }
      } catch (err: any) {
        if (!unmounted) {
          console.error('[Reset Password] Error inicializando sesión:', err);
          setEstado('error');
          setErrorMensaje('Ocurrió un error al procesar el enlace de recuperación.');
        }
      }
    }

    inicializarSesion();

    // Listener para eventos nativos de Supabase (ej: PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (unmounted) return;

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
        setEstado('formulario');
      }
    });

    return () => {
      unmounted = true;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Temporizador de Redirección en Éxito ──────────────────────
  useEffect(() => {
    let timer: any = null;
    if (estado === 'exito') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [estado, navigate]);

  // ─── Volver al Login limpiando sesión ──────────────────────────
  const handleVolverLogin = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    navigate('/login');
  };

  // ─── Indicadores de Fuerza de Contraseña ───────────────────────
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = passedChecks <= 1 ? 'Débil' : passedChecks <= 2 ? 'Regular' : passedChecks <= 3 ? 'Buena' : 'Fuerte';
  const strengthColor = passedChecks <= 1 ? '#DC2626' : passedChecks <= 2 ? '#F59E0B' : passedChecks <= 3 ? '#3B82F6' : '#16A34A';

  // ─── Enviar nueva contraseña ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (password.length < 8) {
      setErrorForm('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorForm('Las contraseñas no coinciden.');
      return;
    }
    if (passedChecks < 3) {
      setErrorForm('La contraseña es demasiado débil. Incluye mayúsculas, minúsculas y números.');
      return;
    }

    setGuardando(true);

    try {
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { accessToken, refreshToken, code } = getUrlTokens();
        if (code) {
          const { data: exData } = await supabase.auth.exchangeCodeForSession(code);
          session = exData?.session || null;
        } else if (accessToken) {
          const { data: setRes } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          session = setRes?.session || null;
        }
      }

      if (!session) {
        setErrorForm('Tu sesión de recuperación ha expirado. Por favor solicita un nuevo enlace.');
        setGuardando(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorForm(error.message);
        setGuardando(false);
        return;
      }

      await supabase.auth.signOut();
      setEstado('exito');
    } catch (err: any) {
      setErrorForm(err.message || 'Error inesperado al actualizar la contraseña.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden relative">
      
      {/* ─── Header superior tipo IG/Facebook para volver al inicio ─── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-transparent md:bg-white/50 backdrop-blur-xs border-b border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6B1E2E] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-xs font-serif">
            SC
          </div>
          <span className="font-serif font-bold text-sm text-slate-800 hidden sm:inline">
            {PARROQUIA_CONFIG.nombre}
          </span>
        </div>

        <button
          onClick={handleVolverLogin}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white/80 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all cursor-pointer font-sans"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#6B1E2E]" />
          <span>Volver al Inicio de Sesión</span>
        </button>
      </header>

      {/* Panel Izquierdo - Ilustrativo (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6B1E2E] via-[#521623] to-[#3A0F18] relative flex-col justify-between p-12 overflow-hidden text-white pt-20">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 transition-opacity"
          style={{ backgroundImage: `url(${fondoLogin})` }}
        />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D4AF37] shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tight text-white">
              Recuperación de Cuenta
            </h1>
            <p className="text-white/80 text-sm lg:text-base mt-3 leading-relaxed font-light">
              Estás actualizando tu clave de acceso al Sistema de Libros Sacramentales.
              Tu nueva contraseña será encriptada de forma segura.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/15 pt-4 flex justify-between items-center text-xs text-white/60">
          <span>{PARROQUIA_CONFIG.nombre} • {PARROQUIA_CONFIG.ciudad}</span>
          <span>Seguridad v2.0</span>
        </div>
      </div>

      {/* Panel Derecho - Contenido Dinámico */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white min-h-screen md:min-h-0 pt-24 md:pt-20">
        <div className="w-full max-w-md mx-auto my-auto py-4">

          {/* ── ESTADO: VALIDANDO ── */}
          {estado === 'validando' && (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <Loader2 className="w-10 h-10 text-[#6B1E2E] animate-spin" />
              <p className="text-sm font-medium text-slate-700 font-sans">Verificando enlace de recuperación…</p>
              <p className="text-xs text-slate-400 font-sans max-w-xs">
                Estamos validando tu token de acceso seguro con Supabase Auth.
              </p>
            </div>
          )}

          {/* ── ESTADO: ERROR ── */}
          {estado === 'error' && (
            <div className="flex flex-col items-center text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">Enlace no válido o expirado</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-sm font-sans leading-relaxed">
                  {errorMensaje}
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <button
                  onClick={handleVolverLogin}
                  className="w-full py-3 bg-[#6B1E2E] hover:bg-[#541724] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio de Sesión
                </button>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Solicitar un Nuevo Enlace
                </button>
              </div>
            </div>
          )}

          {/* ── ESTADO: FORMULARIO ── */}
          {estado === 'formulario' && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center md:text-left">
                <div className="hidden md:flex w-12 h-12 rounded-2xl bg-[#FDF4F5] border border-[#F3D2D7] items-center justify-center text-[#6B1E2E] mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Crear Nueva Contraseña
                </h1>
                <p className="text-slate-500 text-sm mt-1.5 font-sans">
                  Ingresa tu nueva clave. Al guardarla, la sesión de recuperación finalizará y podrás ingresar normalmente.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errorForm && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-sans flex items-center gap-2.5 animate-in fade-in duration-150">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorForm}</span>
                  </div>
                )}

                {/* Nueva contraseña */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-sans">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={guardando}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 focus:border-[#6B1E2E] text-slate-900 placeholder:text-slate-400 transition-all font-sans disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Medidor de fuerza */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                            style={{ backgroundColor: i <= passedChecks ? strengthColor : '#E2E8F0' }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-sans font-semibold" style={{ color: strengthColor }}>
                        Seguridad: {strengthLabel}
                      </p>
                      <ul className="space-y-0.5">
                        {[
                          { key: 'length', label: 'Mínimo 8 caracteres' },
                          { key: 'uppercase', label: 'Al menos una mayúscula' },
                          { key: 'lowercase', label: 'Al menos una minúscula' },
                          { key: 'number', label: 'Al menos un número' },
                        ].map((rule) => (
                          <li key={rule.key} className="flex items-center gap-1.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor: passwordChecks[rule.key as keyof typeof passwordChecks] ? '#16A34A' : '#E2E8F0',
                                color: passwordChecks[rule.key as keyof typeof passwordChecks] ? '#FFF' : '#94A3B8',
                              }}
                            >
                              {passwordChecks[rule.key as keyof typeof passwordChecks] && (
                                <svg className="w-2 h-2" viewBox="0 0 12 12" fill="none">
                                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-sans">{rule.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-sans">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      disabled={guardando}
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 focus:border-[#6B1E2E] text-slate-900 placeholder:text-slate-400 transition-all font-sans disabled:opacity-60 ${
                        confirmPassword.length > 0 && password !== confirmPassword
                          ? 'border-rose-400'
                          : confirmPassword.length > 0 && password === confirmPassword
                          ? 'border-emerald-400'
                          : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-sans">Las contraseñas no coinciden.</p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={guardando || password.length < 8 || password !== confirmPassword}
                    className="w-full py-3 bg-[#6B1E2E] hover:bg-[#541724] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Actualizando Contraseña…</span>
                      </>
                    ) : (
                      <span>Restablecer Contraseña</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleVolverLogin}
                    disabled={guardando}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancelar y Volver al Login</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── ESTADO: ÉXITO ── */}
          {estado === 'exito' && (
            <div className="flex flex-col items-center text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">¡Contraseña Actualizada!</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-sm font-sans leading-relaxed">
                  Tu contraseña se ha restablecido correctamente. Por seguridad, todas las sesiones abiertas han sido cerradas.
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <button
                  onClick={handleVolverLogin}
                  className="w-full py-3.5 bg-[#6B1E2E] hover:bg-[#541724] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Iniciar Sesión Ahora</span>
                </button>

                <p className="text-xs text-slate-400 font-sans">
                  Redirigiendo automáticamente al inicio de sesión en <span className="font-bold text-[#6B1E2E]">{countdown}s</span>…
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 font-sans border-t border-slate-200 pt-4 mt-auto">
          <p className="font-medium">Uso exclusivo del despacho parroquial.</p>
          <p className="text-[11px] text-slate-300 mt-0.5">{PARROQUIA_CONFIG.nombre} • {PARROQUIA_CONFIG.ciudad}</p>
        </div>
      </div>

      {/* Modal para solicitar nuevo enlace si el actual falló */}
      <SolicitudResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
}
