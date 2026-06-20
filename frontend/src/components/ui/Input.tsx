import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl transition-all duration-200 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 text-sm disabled:opacity-50 focus:outline-none ${
          error 
            ? 'border-red-500 dark:border-red-500/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
            : 'focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-500/10'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}