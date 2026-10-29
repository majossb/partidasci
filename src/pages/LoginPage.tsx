import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import LoginForm from '@/components/auth/LoginForm';
import fondoLogin from '@/assets/images/fondo-login.svg';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function LoginPage() {
  const { usuario, cargando } = useAuthStore();

  // Si la URL contiene tokens de recuperación, redirigir a /restablecer-password
  const esUrlRecuperacion = 
    window.location.hash.includes('type=recovery') ||
    window.location.hash.includes('access_token=') ||
    window.location.search.includes('code=') ||
    window.location.search.includes('type=recovery');

  if (esUrlRecuperacion) {
    return <Navigate to={`/restablecer-password${window.location.hash}${window.location.search}`} replace />;
  }

  if (cargando) return null;

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-hidden">
      {/* Panel Izquierdo - Brand & Imagen (Solo visible en desktop md+) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6B1E2E] via-[#521623] to-[#3A0F18] relative flex-col justify-between p-12 overflow-hidden text-white">
        {/* Imagen de fondo con opacidad */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 transition-opacity"
          style={{ backgroundImage: `url(${fondoLogin})` }}
        />
        
        {/* Textura/Patrón decorativo */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Encabezado del Panel Izquierdo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#6B1E2E] font-bold text-base shadow-md">
            SC
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight tracking-wide">{PARROQUIA_CONFIG.nombre}</h2>
            <p className="text-xs text-[#D4AF37] tracking-widest uppercase font-medium">{PARROQUIA_CONFIG.diocesis}</p>
          </div>
        </div>

        {/* Centro del Panel Izquierdo - Cruz SVG y Título */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#D4AF37] shadow-xl">
            {/* SVG Cruz Latina Limpia */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tight text-white">
              Sistema de Libros Sacramentales
            </h1>
            <p className="text-white/80 text-sm lg:text-base mt-3 leading-relaxed font-light">
              Plataforma oficial de digitalización, consulta y expedición canónica de partidas de Bautismo, Confirmación, Matrimonio y Defunción.
            </p>
          </div>
        </div>

        {/* Pie del Panel Izquierdo */}
        <div className="relative z-10 border-t border-white/15 pt-4 flex justify-between items-center text-xs text-white/60">
          <span>{PARROQUIA_CONFIG.nombre} • {PARROQUIA_CONFIG.ciudad}</span>
          <span>Versión 2.0</span>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white min-h-screen md:min-h-0">
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Logo visible solo en mobile */}
          <div className="md:hidden flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#6B1E2E] font-bold text-xl shadow-md mb-3">
              SC
            </div>
            <h2 className="font-serif font-bold text-xl text-text-primary">{PARROQUIA_CONFIG.nombre}</h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium">{PARROQUIA_CONFIG.diocesis}</p>
          </div>

          {/* Encabezado del Formulario */}
          <div className="mb-8 text-center md:text-left">
            <div className="hidden md:flex w-12 h-12 rounded-full bg-[#6B1E2E]/10 border border-[#6B1E2E]/20 items-center justify-center text-[#6B1E2E] font-bold text-lg mb-4">
              SC
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary tracking-tight">
              Acceso al Sistema
            </h1>
            <p className="text-text-secondary text-sm mt-1.5 font-sans">
              Ingresa tus credenciales del Despacho Parroquial para continuar.
            </p>
          </div>

          {/* Formulario */}
          <LoginForm />
        </div>

        {/* Footer legal */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-text-secondary/70 font-sans border-t border-border pt-4 mt-auto">
          <p className="font-medium">Uso exclusivo del despacho parroquial.</p>
          <p className="text-[11px] text-text-secondary/50 mt-0.5">Toda acción en este sistema es auditada y registrada.</p>
        </div>
      </div>
    </div>
  );
}
