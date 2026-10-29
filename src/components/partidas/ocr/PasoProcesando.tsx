import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageEntry } from '../ModalImportacionOCR';

interface PasoProcesandoProps {
  images: ImageEntry[];
  processingIndex: number;
  processingMessage: string;
}

const PasoProcesando: React.FC<PasoProcesandoProps> = React.memo(({
  images,
  processingIndex,
  processingMessage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <Loader2 className="w-12 h-12 text-[#7B1C2E] animate-spin mx-auto" />
        <h3 className="text-xl font-bold text-gray-800">Procesando imágenes con Gemini AI</h3>
        <p className="text-gray-500">
          Imagen {processingIndex + 1} de {images.length}
        </p>
        {processingMessage && (
          <p className="text-sm text-amber-600 mt-2">{processingMessage}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7B1C2E] to-[#a82845] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((processingIndex + 1) / images.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {Math.round(((processingIndex + 1) / images.length) * 100)}% completado
        </p>
      </div>

      {/* Per-image status */}
      <div className="w-full max-w-md space-y-2">
        {images.map((img) => (
          <div key={img.id} className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 shrink-0">
              {img.previewUrl && <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <span className="truncate flex-1 text-gray-600">{img.file.name}</span>
            <span className="shrink-0">
              {img.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {img.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              {img.status === 'processing' && <Loader2 className="w-4 h-4 text-[#7B1C2E] animate-spin" />}
              {img.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

PasoProcesando.displayName = 'PasoProcesando';

export default PasoProcesando;
