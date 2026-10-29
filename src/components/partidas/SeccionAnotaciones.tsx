import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

export const LIMITE_CARACTERES_OBSERVACIONES = 1000;

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch?: (name: string) => any;
  defaultExpanded?: boolean;
}

export default function SeccionAnotaciones({ register, errors, watch, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Obtener valor reactivo de react-hook-form o fallback a estado interno
  const valorWatch = watch ? watch('anotaciones') : undefined;
  const [internalValue, setInternalValue] = useState('');

  const textoActual = typeof valorWatch === 'string' ? valorWatch : internalValue;
  const contador = textoActual ? textoActual.length : 0;

  // Si hay error en anotaciones, expandir automáticamente para que sea visible
  useEffect(() => {
    if (errors.anotaciones) {
      setExpanded(true);
    }
  }, [errors.anotaciones]);

  const registered = register('anotaciones');

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const paste = e.clipboardData.getData('text');
    const current = e.currentTarget.value;
    const selectionLength = e.currentTarget.selectionEnd - e.currentTarget.selectionStart;
    const available = LIMITE_CARACTERES_OBSERVACIONES - (current.length - selectionLength);
    if (paste.length > available) {
      e.preventDefault();
      const textToInsert = paste.slice(0, Math.max(0, available));
      document.execCommand('insertText', false, textToInsert);
    }
  };

  return (
    <div className="mt-8 border border-border rounded-xl bg-surface-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface/80 transition-colors text-left focus:outline-none cursor-pointer"
      >
        <div>
          <h3 className="font-serif font-semibold text-text-primary">Notas Marginales / Observaciones</h3>
          <p className="text-xs text-text-secondary mt-1">Registro de sacramentos posteriores, modificaciones canónicas y observaciones.</p>
        </div>
        <div className="flex items-center gap-2">
          {errors.anotaciones && (
            <span className="flex items-center gap-1 text-xs text-danger font-sans bg-danger/10 px-2 py-0.5 rounded-md">
              <AlertCircle className="w-3.5 h-3.5" />
              Error en notas
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
        </div>
      </button>
      
      <div className={clsx("p-4 border-t border-border transition-all", expanded ? "block" : "hidden")}>
        <textarea
          id="anotaciones"
          maxLength={LIMITE_CARACTERES_OBSERVACIONES}
          {...registered}
          onChange={(e) => {
            if (e.target.value.length > LIMITE_CARACTERES_OBSERVACIONES) {
              e.target.value = e.target.value.slice(0, LIMITE_CARACTERES_OBSERVACIONES);
            }
            setInternalValue(e.target.value);
            registered.onChange(e);
          }}
          onPaste={handlePaste}
          aria-invalid={!!errors.anotaciones}
          className={clsx(
            "w-full min-h-[150px] p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary font-sans text-sm bg-white transition-colors",
            errors.anotaciones ? "border-danger focus:ring-danger" : "border-border"
          )}
          placeholder="Ej: Confirmado el día... Matrimonio contraído con..."
        ></textarea>
        <div className="flex justify-between items-center mt-1.5 font-sans">
          {errors.anotaciones ? (
            <p className="text-xs text-danger flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-danger" aria-hidden="true" />
              <span>{errors.anotaciones.message as string}</span>
            </p>
          ) : <div />}
          <span className={clsx(
            "text-xs transition-colors ml-auto font-mono",
            contador >= LIMITE_CARACTERES_OBSERVACIONES ? "text-amber-700 font-semibold" : "text-text-secondary"
          )}>
            {contador}/{LIMITE_CARACTERES_OBSERVACIONES} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
