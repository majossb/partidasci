import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { PARROQUIA_CONFIG } from '@/utils/constantes';

interface ModalLey1581Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  formato: 'PDF' | 'WORD';
}

export default function ModalLey1581({ isOpen, onClose, onAccept, formato }: ModalLey1581Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-[#7B1C2E] text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 font-serif">
            <ShieldAlert className="w-5 h-5" />
            Aviso de Protección de Datos
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-bold mb-1">Ley 1581 de 2012 — Protección de Datos Personales</p>
              <p>
                De conformidad con la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013
                de la República de Colombia, le informamos que los datos personales contenidos en este
                documento son de carácter confidencial.
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              El documento que está a punto de descargar en formato <strong>{formato}</strong> contiene
              información personal sensible de los titulares de la partida eclesiástica. Al proceder con
              la descarga, usted se compromete a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Utilizar la información exclusivamente para los fines autorizados.</li>
              <li>No compartir, reproducir ni distribuir el documento sin autorización expresa.</li>
              <li>Garantizar la custodia y confidencialidad de los datos personales contenidos.</li>
              <li>Cumplir con las disposiciones establecidas en la Ley 1581 de 2012.</li>
            </ul>
            <p className="text-xs text-gray-500 italic">
              La {PARROQUIA_CONFIG.nombre}, como responsable del tratamiento de datos, ha adoptado
              las medidas necesarias para garantizar la seguridad y confidencialidad de la información.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 rounded-xl bg-[#7B1C2E] text-white font-bold hover:bg-[#6B1E2E] transition-colors cursor-pointer text-sm flex items-center gap-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            Aceptar y Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
