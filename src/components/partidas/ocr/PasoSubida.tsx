import React, { RefObject } from 'react';
import { UploadCloud, FileImage, Loader2, Plus, Sparkles, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageEntry } from '../ModalImportacionOCR';

interface PasoSubidaProps {
  images: ImageEntry[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  addMoreRef: RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (id: string) => void;
  handleProcessAll: () => void;
}

const PasoSubida: React.FC<PasoSubidaProps> = React.memo(({
  images,
  fileInputRef,
  addMoreRef,
  handleFileChange,
  removeImage,
  handleProcessAll,
}) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="text-center space-y-1.5">
        <h3 className="text-lg font-bold text-gray-800">Sube las fotos de las partidas</h3>
        <p className="text-sm text-gray-500">Formatos admitidos: JPG, PNG. Puedes seleccionar múltiples imágenes.</p>
        <p className="text-xs text-amber-800 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200 font-medium">
          Asegúrate de que las imágenes sean nítidas, bien enfocadas e iluminadas para una correcta lectura.
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all bg-white hover:shadow-md ${
          images.length > 0 ? 'border-primary/40 hover:border-primary' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
        />
        <div className="flex flex-col items-center">
          <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">Haz clic para seleccionar imágenes</p>
          <p className="text-xs text-gray-400 mt-1">o arrastra y suelta aquí</p>
        </div>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              <FileImage className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {images.length} {images.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
            </p>
            <button
              type="button"
              onClick={() => addMoreRef.current?.click()}
              className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar más
            </button>
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              ref={addMoreRef}
              onChange={handleFileChange}
              multiple
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div className={`aspect-[3/4] rounded-lg border bg-gray-100 overflow-hidden shadow-sm relative ${
                  img.status === 'error' ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50' : 'border-gray-200'
                }`}>
                  {img.previewUrl ? (
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : img.status === 'error' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-amber-700 bg-amber-50">
                      <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
                      <span className="text-[10px] font-semibold leading-tight line-clamp-2">No legible</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                  {img.status === 'error' && (
                    <div className="absolute bottom-0 inset-x-0 bg-amber-600/90 text-white text-[9px] font-medium py-0.5 px-1 truncate text-center" title={img.error}>
                      No legible
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Eliminar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="text-[10px] text-gray-500 mt-1 truncate text-center">{img.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process button */}
      <Button
        className="w-full mt-4"
        onClick={handleProcessAll}
        disabled={images.length === 0}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Procesar {images.length > 0 ? `${images.length} ${images.length === 1 ? 'imagen' : 'imágenes'}` : ''} con IA
      </Button>
    </div>
  );
});

PasoSubida.displayName = 'PasoSubida';

export default PasoSubida;
