import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalCambiosNoGuardadosProps {
  isOpen: boolean;
  onContinuarEditando: () => void;
  onSalirSinGuardar: () => void;
}

export const ModalCambiosNoGuardados: React.FC<ModalCambiosNoGuardadosProps> = ({
  isOpen,
  onContinuarEditando,
  onSalirSinGuardar,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-unsaved-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FDF4F5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 id="modal-unsaved-title" className="text-lg font-bold text-slate-900 font-serif">
              ¿Desea salir sin guardar los cambios?
            </h2>
          </div>
          <button
            type="button"
            onClick={onContinuarEditando}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
            title="Cerrar y continuar editando"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Tiene información diligenciada en esta partida que aún no ha sido guardada en el sistema.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Si decide salir ahora, se descartarán todos los cambios ingresados y no podrán recuperarse.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onContinuarEditando}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer text-center"
          >
            Continuar editando
          </button>
          <button
            type="button"
            onClick={onSalirSinGuardar}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-white bg-[#6B1E2E] hover:bg-[#541724] rounded-xl transition-all shadow-xs cursor-pointer text-center"
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiosNoGuardados;
