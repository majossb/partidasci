import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { cerrarSesionSegura } from '@/lib/supabase';
import { Menu, LogOut, User, Search } from 'lucide-react';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function Header() {
  const { usuario } = useAuthStore();
  const { toggleSidebar, toggleSidebarMobile, setBuscadorOpen } = useUiStore();

  const handleLogout = async () => {
    await cerrarSesionSegura();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-5 md:px-6 shadow-2xs">
      {/* ── Izquierda: Botón de menú y logo en móvil ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón menú Móvil */}
        <button
          onClick={toggleSidebarMobile}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Botón colapsar Escritorio */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none cursor-pointer"
          aria-label="Alternar barra lateral"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Marca en móvil */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#6B1E2E] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {PARROQUIA_CONFIG.nombre.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-serif font-bold text-sm text-slate-800 tracking-tight truncate max-w-[130px] sm:max-w-none">
            {PARROQUIA_CONFIG.nombre}
          </span>
        </div>
      </div>

      {/* ── Centro: Buscador en pantallas medianas y grandes ── */}
      <div className="hidden lg:flex flex-1 justify-center max-w-lg mx-4">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
          </div>
          <button
            onClick={() => setBuscadorOpen(true)}
            className="w-full text-left pl-10 pr-4 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B1E2E]/20 text-sm transition-all cursor-pointer flex items-center justify-between"
          >
            <span>Buscar partidas canónicas...</span>
            <kbd className="text-[11px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">Ctrl+K</kbd>
          </button>
        </div>
      </div>

      {/* ── Derecha: Acceso rápido de búsqueda móvil, usuario y cierre de sesión ── */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Botón Buscar en móvil y tablets */}
        <button
          onClick={() => setBuscadorOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Buscar partidas"
          title="Buscar partidas (Ctrl+K)"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Info usuario (desktop) */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold text-gray-900 truncate max-w-[160px]">{usuario?.email}</span>
          <span className="text-[11px] text-gray-500 capitalize">{usuario?.rol || 'Secretaria'}</span>
        </div>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white font-semibold text-xs sm:text-sm shadow-xs shrink-0"
          style={{ backgroundColor: '#6B1E2E' }}
          title={usuario?.email || 'Usuario'}
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Botón Cerrar Sesión */}
        <button
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </header>
  );
}
