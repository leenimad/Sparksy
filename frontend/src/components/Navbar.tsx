import { Sparkles, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle'; 

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}
export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white/80 dark:bg-[#090d16]/40 border-b border-slate-200 dark:border-slate-800/60 backdrop-blur-md px-8 py-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
          <Sparkles className="w-5 h-5" />
          <span className="tracking-tight text-slate-900 dark:text-white">Sparksy</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md text-slate-500 dark:text-slate-400 font-normal ml-1">Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Dynamic Theme Toggle */}
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{userName}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg transition-all cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}