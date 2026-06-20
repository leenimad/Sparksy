import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Extend the native HTML button attributes so our button accepts all standard button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // 1. Base styles shared by all buttons
  const baseStyles = 
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none ' +
    'active:scale-[0.98] duration-200 select-none';

  // 2. Adaptive theme-friendly variant styles
  const variants = {
    primary: 
      'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/20 ' +
      'shadow-md shadow-blue-500/10 dark:shadow-blue-900/10',
    secondary: 
      'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 ' +
      'text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800',
    danger: 
      'bg-red-600 hover:bg-red-500 text-white border border-red-500/20 ' +
      'shadow-md shadow-red-500/10 dark:shadow-red-900/10',
    ghost: 
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 ' +
      'text-slate-600 dark:text-slate-400',
  };

  // 3. Size specifications
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}