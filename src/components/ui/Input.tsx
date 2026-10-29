import React, { useState } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';
import { MENSAJE_FECHA_INVALIDA } from '@/utils/validaciones';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, type, onChange, onBlur, ...props }, ref) => {
    const [badInputError, setBadInputError] = useState<string | null>(null);

    const checkValidity = (el: HTMLInputElement) => {
      if (type === 'date') {
        if (el.validity?.badInput) {
          setBadInputError(MENSAJE_FECHA_INVALIDA);
        } else if (badInputError) {
          setBadInputError(null);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      checkValidity(e.target);
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      checkValidity(e.target);
      onBlur?.(e);
    };

    const displayError = badInputError || error;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1 font-sans">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          aria-invalid={!!displayError}
          aria-describedby={displayError && id ? `${id}-error` : undefined}
          className={clsx(
            "flex h-10 w-full rounded-md border bg-surface-card px-3 py-2 text-sm text-text-primary ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            displayError ? "border-danger focus-visible:ring-danger" : "border-border",
            className
          )}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {displayError && (
          <p id={id ? `${id}-error` : undefined} className="mt-1 text-xs text-danger font-sans flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-danger" aria-hidden="true" />
            <span>{displayError}</span>
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
