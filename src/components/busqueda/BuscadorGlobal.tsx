import { useState, useEffect, useRef } from 'react';
import { useUiStore } from '@/store/ui.store';
import { useDebounce } from '@/hooks/useDebounce';
import { useBuscadorGlobal } from '@/hooks/useBuscadorGlobal';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuscadorGlobal() {
  const { buscadorOpen, setBuscadorOpen } = useUiStore();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchTerm = useDebounce(inputValue, 400);
  const { results, loading } = useBuscadorGlobal(debouncedSearchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setBuscadorOpen(true);
      }
      if (e.key === 'Escape' && buscadorOpen) {
        setBuscadorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buscadorOpen, setBuscadorOpen]);

  useEffect(() => {
    if (buscadorOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInputValue('');
    }
  }, [buscadorOpen]);

  if (!buscadorOpen) return null;

  const handleClose = () => setBuscadorOpen(false);

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'bautismo': return 'Bautismo';
      case 'confirmacion': return 'Confirmación';
      case 'matrimonio': return 'Matrimonio';
      case 'defuncion': return 'Defunción';
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'bautismo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmacion': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'matrimonio': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'defuncion': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl mx-4 overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center px-4 py-3 border-b border-gray-200 gap-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
            placeholder="Buscar por nombre o apellidos..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />}
          <button 
            onClick={handleClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {debouncedSearchTerm.length < 3 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Escribe al menos 3 caracteres para buscar en todas las partidas.
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No se encontraron resultados para "{debouncedSearchTerm}".
            </div>
          ) : (
            <div className="py-2">
              {results.map((res) => (
                <div 
                  key={`${res.tipo}-${res.id}`}
                  onClick={() => {
                    handleClose();
                    const rutas: Record<string, string> = {
                      bautismo: 'bautismos',
                      confirmacion: 'confirmaciones',
                      matrimonio: 'matrimonios',
                      defuncion: 'defunciones',
                    };
                    const ruta = rutas[res.tipo] || res.tipo;
                    navigate(`/${ruta}/${res.id}`);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-[#6B1E2E] transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{res.titulo}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded border ${getTipoColor(res.tipo)} font-medium`}>
                        {getTipoLabel(res.tipo)}
                      </span>
                      <span className="text-gray-500">
                        {res.libro ? `Libro: ${res.libro} | ` : ''}Folio: {res.folio} | N°: {res.numero}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#6B1E2E] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 flex justify-between items-center">
          <span>Usa <kbd className="font-mono bg-white border border-gray-300 rounded px-1.5 py-0.5 shadow-sm">esc</kbd> para cerrar</span>
          <span>Búsqueda global cruzada</span>
        </div>
      </div>
    </div>
  );
}
