import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BuscadorGlobal from '@/components/busqueda/BuscadorGlobal';
import { useUiStore } from '@/store/ui.store';
import { useInactividad } from '@/hooks/useInactividad';
import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';

export default function AppLayout() {
  const { sidebarOpen } = useUiStore();
  const { showWarning, keepAlive } = useInactividad(15); // 15 minutos de inactividad (aviso a los 13 min)

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans">
      <Sidebar />
      <div 
        className={clsx(
          "flex flex-col flex-1 w-full transition-all duration-300 relative",
          sidebarOpen ? "md:ml-[220px]" : "md:ml-20"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F8F9FB] p-3.5 sm:p-6 md:p-8 lg:p-10 relative">
          <Outlet />
        </main>
      </div>
      <BuscadorGlobal />

      {/* Modal de Inactividad */}
      {showWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aviso de Inactividad</h3>
            <p className="text-gray-500 text-sm mb-6">
              Tu sesión se cerrará en 2 minutos por inactividad. ¿Deseas mantenerla abierta?
            </p>
            <button
              onClick={keepAlive}
              className="w-full bg-[#6B1E2E] text-white py-2.5 rounded-lg font-medium hover:bg-[#8B293F] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#6B1E2E] outline-none"
            >
              Mantener sesión abierta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
