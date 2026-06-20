// 'use client';

// import { useEffect, ReactNode } from 'react';
// import { AlertTriangle, Info, X } from 'lucide-react';
// import Card from './Card';
// import Button from './Button';

// interface DialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   type?: 'error' | 'warning' | 'info'; // Removed 'success' (handled by Toast!)
//   title: string;
//   message: string;
//   children?: ReactNode;
// }

// export default function Dialog({
//   isOpen,
//   onClose,
//   type = 'info',
//   title,
//   message,
//   children,
// }: DialogProps) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//     };
//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//     }
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   const styles = {
//     error: {
//       icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
//       border: 'border-red-500/20 dark:border-red-500/10',
//       glow: 'bg-red-500/5',
//     },
//     warning: {
//       icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
//       border: 'border-amber-500/20 dark:border-amber-500/10',
//       glow: 'bg-amber-500/5',
//     },
//     info: {
//       icon: <Info className="w-5 h-5 text-blue-500" />,
//       border: 'border-blue-500/20 dark:border-blue-500/10',
//       glow: 'bg-blue-500/5',
//     },
//   };

//   const current = styles[type];

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-100 animate-fade-in">
//       <Card className={`w-full max-w-md relative bg-white dark:bg-stone-950/90 border shadow-2xl !p-6 animate-pop-in ${current.border}`}>
//         {/* Small Close Top Right */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-all cursor-pointer"
//         >
//           <X className="w-4 h-4" />
//         </button>

//         {/* Dialog Header Content */}
//         <div className="flex items-start gap-4">
//           <div className={`p-2 rounded-xl flex-shrink-0 ${current.glow}`}>
//             {current.icon}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 leading-tight mb-1.5">
//               {title}
//             </h3>
//             <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
//               {message}
//             </p>
//           </div>
//         </div>

//         {children && <div className="my-4">{children}</div>}

//         {/* Action Footer */}
//         <div className="flex justify-end mt-6">
//           <Button
//             variant={type === 'error' ? 'danger' : 'secondary'}
//             onClick={onClose}
//             size="sm"
//             className="w-full sm:w-auto"
//           >
//             Acknowledge
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }
'use client';

import { useEffect, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  // New props for action handling
  onConfirm?: () => void; 
  confirmLabel?: string;
  children?: ReactNode;
}

export default function Dialog({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  onConfirm, // 1. Destructured here!
  children,
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: {
      icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
      border: 'border-emerald-500/20 dark:border-emerald-500/10',
      glow: 'bg-emerald-500/5',
      accent: 'bg-emerald-500',
    },
    error: {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      border: 'border-red-500/20 dark:border-red-500/10',
      glow: 'bg-red-500/5',
      accent: 'bg-red-500',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      border: 'border-amber-500/20 dark:border-amber-500/10',
      glow: 'bg-amber-500/5',
      accent: 'bg-amber-500',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      border: 'border-blue-500/20 dark:border-blue-500/10',
      glow: 'bg-blue-500/5',
      accent: 'bg-blue-500',
    },
  };

  const current = styles[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-100 animate-fade-in">
      <Card className={`w-full max-w-md relative bg-white dark:bg-stone-950/90 border shadow-2xl !p-6 animate-pop-in ${current.border}`}>
        {/* Left vertical visual boundary */}
        {/* <div className={`absolute top-0 left-0 w-1.5 h-full ${current.accent}`}></div> */}

        {/* Small Close Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dialog Header Content */}
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-xl flex-shrink-0 ${current.glow}`}>
            {current.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 leading-tight mb-1.5">
              {title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {children && <div className="my-4">{children}</div>}

        {/* 2. Dynamic Action Footer */}
        <div className="flex justify-end gap-2.5 mt-6">
          {onConfirm ? (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant={type === 'error' || title.toLowerCase().includes('delete') ? 'danger' : 'primary'}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                size="sm"
              >
                {title.toLowerCase().includes('delete') ? 'Delete Workspace' : 'Confirm'}
              </Button>
            </>
          ) : (
            <Button
              variant={type === 'error' ? 'danger' : 'secondary'}
              onClick={onClose}
              size="sm"
              className="w-full sm:w-auto"
            >
              Acknowledge
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}