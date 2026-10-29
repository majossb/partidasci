import { FileText, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModalMetodoRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectIA: () => void;
  tipoSacramento: string;
}

export default function ModalMetodoRegistro({
  isOpen,
  onClose,
  onSelectManual,
  onSelectIA,
  tipoSacramento,
}: ModalMetodoRegistroProps) {
  if (!isOpen) return null;

  const tituloSacramento = {
    bautismo: 'Bautismo',
    confirmacion: 'Confirmación',
    matrimonio: 'Matrimonio',
    defuncion: 'Defunción',
  }[tipoSacramento] || 'Sacramento';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <div className="bg-surface-card w-full max-w-md rounded-xl p-6 shadow-2xl border border-border relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-serif font-bold text-text-primary mb-2">Registrar {tituloSacramento}</h3>
        <p className="text-sm text-text-secondary mb-6">
          Selecciona el método que deseas utilizar para ingresar la información al libro digital.
        </p>

        <div className="space-y-4">
          {/* Opción IA (Recomendada) */}
          <button
            onClick={() => {
              onSelectIA();
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl border border-primary/20 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-md"
          >
            <div className="p-3 rounded-lg bg-primary text-white shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sans font-semibold text-text-primary flex items-center gap-2">
                <span>Escanear con IA (Recomendado)</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                  Automático
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1 font-sans">
                Sube la fotografía de la página. La IA detectará automáticamente si es una sola partida o múltiples partidas por página y extraerá toda la información.
              </p>
            </div>
          </button>

          {/* Opción Manual */}
          <button
            onClick={() => {
              onSelectManual();
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl border border-border hover:border-text-secondary hover:bg-surface/30 transition-all duration-300 group flex items-start gap-4 shadow-sm hover:shadow-md"
          >
            <div className="p-3 rounded-lg bg-surface border border-border text-text-secondary shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sans font-semibold text-text-primary">Registro Manual Estándar</div>
              <p className="text-xs text-text-secondary mt-1 font-sans">
                Digita todos los datos manualmente mediante el formulario web tradicional con validación de campos.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
