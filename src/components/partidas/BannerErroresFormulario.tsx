import React, { useEffect, useRef } from 'react';
import { FieldErrors } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import { obtenerNombreCampo } from '@/utils/validaciones';

interface BannerErroresFormularioProps {
  errors: FieldErrors<any>;
  titulo?: string;
}

export default function BannerErroresFormulario({
  errors,
  titulo = 'Por favor corrige los siguientes campos antes de continuar:',
}: BannerErroresFormularioProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const errorEntries = Object.entries(errors);

  useEffect(() => {
    if (errorEntries.length > 0 && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Intentar enfocar el primer input con error
      const firstField = errorEntries[0][0];
      const el = document.getElementById(firstField);
      if (el) {
        el.focus({ preventScroll: true });
      }
    }
  }, [errorEntries.length]);

  if (errorEntries.length === 0) return null;

  return (
    <div
      ref={bannerRef}
      role="alert"
      aria-live="assertive"
      className="mb-6 p-4 bg-danger/10 border-2 border-danger/40 text-danger rounded-xl font-sans shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-sm text-danger">
            {titulo} ({errorEntries.length} {errorEntries.length === 1 ? 'error detectado' : 'errores detectados'})
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1 text-danger/90">
            {errorEntries.map(([field, error]) => (
              <li key={field}>
                <strong>{obtenerNombreCampo(field)}:</strong>{' '}
                <span>{String(error?.message || 'Campo inválido')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
