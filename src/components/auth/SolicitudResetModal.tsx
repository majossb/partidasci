import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, KeyRound, Info } from 'lucide-react';
import { solicitarRestablecimientoPassword } from '@/utils/cryptoResetToken';

interface SolicitudResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SolicitudResetModal({ isOpen, onClose }: SolicitudResetModalProps) {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);
  const [devWarning, setDevWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setEnviando(true);
    setErrorBloqueo(null);
    setMensaje(null);
    setDevWarning(null);

    try {
      const res = await solicitarRestablecimientoPassword(email);
      if (res.bloqueado) {
        setErrorBloqueo(res.mensaje);
      } else {
        setMensaje(res.mensaje);
        if (res.errorDev) {
          setDevWarning(res.errorDev);
        }
      }
    } catch (err) {
      setMensaje("Si el correo está registrado en el sistema, recibirás un enlace para restablecer tu contraseña.");
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMensaje(null);
    setErrorBloqueo(null);
    setDevWarning(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 relative animate-in zoom-in-95 duration-200">
        
        {/* Header con icono de llave */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF4F5] border border-[#F3D2D7] flex items-center justify-center text-[#6B1E2E] mb-3 shadow-2xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Restablecer Contraseña</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">
            Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para recuperar tu acceso.
          </p>
        </div>

        {/* Mensaje de respuesta genérico (Seguridad de no revelación) */}
        {mensaje ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-sans flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">Solicitud procesada</p>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{mensaje}</p>
              </div>
            </div>

            {devWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-sans flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{devWarning}</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-[#6B1E2E] hover:bg-[#541724] text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio de Sesión</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorBloqueo && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-sans flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorBloqueo}</span>
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-sans">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  required
                  disabled={enviando}
                  placeholder="ejemplo@parroquia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 focus:border-[#6B1E2E] text-slate-900 placeholder:text-slate-400 transition-all font-sans disabled:opacity-60"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={enviando}
                className="w-full sm:w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || !email}
                className="w-full sm:w-1/2 py-2.5 bg-[#6B1E2E] hover:bg-[#541724] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar Enlace</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
