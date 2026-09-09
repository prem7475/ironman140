import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const PasswordInput = ({
  id,
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  required = false,
  autoComplete = 'current-password',
  disabled = false,
  name = 'password'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;

  return (
    <div className="group w-full space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      </div>

      <div className="relative flex items-center">
        <Lock
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none"
        />

        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full bg-black/80 border py-3.5 sm:py-4 pl-11 pr-12 text-xs sm:text-sm font-bold tracking-wider text-white placeholder:text-gray-600 outline-none rounded-xl transition-all duration-300 ${
            error
              ? 'border-primary/80 focus:ring-1 focus:ring-primary shadow-[0_0_15px_rgba(225,6,0,0.25)]'
              : 'border-white/10 focus:border-primary/80 focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(225,6,0,0.2)]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40"
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider mt-1">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
