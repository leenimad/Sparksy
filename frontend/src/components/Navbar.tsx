import { Sparkles, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white/80 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800/60 backdrop-blur-md px-8 py-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-lg">
          <Sparkles className="w-5 h-5" />
          <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
          <span className="text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-md text-stone-500 dark:text-stone-400 font-normal ml-1">Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-semibold text-amber-600 dark:text-amber-400 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-stone-700 dark:text-stone-300 text-sm font-medium">{userName}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white rounded-lg transition-all cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}