import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

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
  const baseStyles = 
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer ' +
    'focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:pointer-events-none ' +
    'active:scale-[0.98] duration-200 select-none';

  const variants = {
    primary: 
      'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border border-amber-500/20 ' +
      'shadow-md shadow-amber-500/10 dark:shadow-orange-950/20',
    secondary: 
      'bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 ' +
      'text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800',
    danger: 
      'bg-red-600 hover:bg-red-500 text-white border border-red-500/20 ' +
      'shadow-md shadow-red-500/10 dark:shadow-red-900/10',
    ghost: 
      'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-900 ' +
      'text-stone-600 dark:text-stone-400',
  };

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