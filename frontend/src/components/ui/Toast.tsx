'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function Toast({ isOpen, message, onClose }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-150 animate-slide-in">
      {/* Dynamic theme-adapting container */}
      <div className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xl max-w-sm">
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 pr-6 leading-snug">
          {message}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 rounded-md transition-all absolute top-2.5 right-2.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}