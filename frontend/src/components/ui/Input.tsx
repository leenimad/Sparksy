import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm disabled:opacity-50 ${
          error ? 'border-red-500 dark:border-red-500/80 focus:ring-red-500/10' : ''
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