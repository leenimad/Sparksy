import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export default function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  const baseStyles = 'bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-md dark:shadow-black/20 transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:border-blue-500 dark:hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}