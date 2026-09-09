import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AuthInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required = false,
  autoComplete,
  disabled = false,
  maxLength,
  name
}) => {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="group w-full space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none"
          />
        )}

        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full bg-black/80 border py-3.5 sm:py-4 text-xs sm:text-sm font-bold tracking-wider text-white placeholder:text-gray-600 outline-none rounded-xl transition-all duration-300 ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error
              ? 'border-primary/80 focus:ring-1 focus:ring-primary shadow-[0_0_15px_rgba(225,6,0,0.25)]'
              : 'border-white/10 focus:border-primary/80 focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(225,6,0,0.2)]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider mt-1">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
