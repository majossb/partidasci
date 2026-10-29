import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { LogOut, LayoutDashboard, Users, BookHeart, ScrollText, Cross, ShieldCheck, Settings, X } from 'lucide-react';
import { clsx } from 'clsx';
import { cerrarSesionSegura } from '@/lib/supabase';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

export default function Sidebar() {
  const { usuario } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarMobileOpen, setSidebarMobileOpen } = useUiStore();

  const handleLogout = async () => {
    setSidebarMobileOpen(false);
    await cerrarSesionSegura();
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/bautismos', icon: Users, label: 'Bautismos' },
    { to: '/confirmaciones', icon: ScrollText, label: 'Confirmaciones' },
    { to: '/matrimonios', icon: BookHeart, label: 'Matrimonios' },
    { to: '/defunciones', icon: Cross, label: 'Defunciones' },
  ];

  if (usuario?.rol === 'padre') {
    navItems.push({ to: '/auditoria', icon: ShieldCheck, label: 'Auditoría' });
  }

  // Configuración es accesible para ambos roles
  navItems.push({ to: '/configuracion', icon: Settings, label: 'Configuración' });

  return (
    <>
      {/* ── 1. VERSIÓN MÓVIL: TELÓN DE FONDO (BACKDROP) ── */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => setSidebarMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── 2. VERSIÓN MÓVIL: CAJÓN DESLIZANTE (OFF-CANVAS DRAWER) ── */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#6B1E2E] text-white flex flex-col shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabecera Móvil con botón X */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="font-bold text-xl text-[#6B1E2E]">{PARROQUIA_CONFIG.nombre.substring(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <span className="font-bold text-base text-white block leading-tight">
                {PARROQUIA_CONFIG.nombre}
              </span>
              <span className="text-[11px] text-[#D4AF37] tracking-wider uppercase font-medium">
                {PARROQUIA_CONFIG.diocesis}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación Móvil */}
        <nav className="flex-1 py-5 flex flex-col gap-1.5 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors font-medium text-sm",
                  isActive
                    ? "bg-white/20 text-[#D4AF37] shadow-inner font-semibold"
                    : "text-gray-200 hover:bg-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-[#D4AF37]" : "")} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Móvil */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-[#541724]">
          <div className="mb-3 px-2">
            <p className="text-xs text-white/70 truncate">{usuario?.email}</p>
            <p className="text-[11px] text-[#D4AF37] capitalize font-medium">{usuario?.rol || 'Secretaria'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-rose-200 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── 3. VERSIÓN ESCRITORIO (md y superior): BARRA COLAPSABLE TRADICIONAL ── */}
      <aside
        className={clsx(
          "hidden md:flex fixed inset-y-0 left-0 z-40 bg-[#6B1E2E] text-white transition-all duration-300 flex-col shadow-xl",
          sidebarOpen ? "w-[220px]" : "w-20"
        )}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0 px-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <span className="font-bold text-xl text-[#6B1E2E]">{PARROQUIA_CONFIG.nombre.substring(0, 2).toUpperCase()}</span>
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-bold text-lg whitespace-nowrap overflow-hidden text-white animate-in fade-in duration-200">
              {PARROQUIA_CONFIG.nombre}
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors group",
                  isActive
                    ? "bg-white/20 text-[#C9973A] shadow-inner font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("w-6 h-6 shrink-0", isActive ? "text-[#C9973A]" : "")} />
                  {sidebarOpen && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 w-full rounded-lg text-rose-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-6 h-6 shrink-0" />
            {sidebarOpen && (
              <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
