// import { Sparkles, LogOut } from 'lucide-react';
// import ThemeToggle from './ThemeToggle';

// interface NavbarProps {
//   userName: string;
//   onLogout: () => void;
// }

// export default function Navbar({ userName, onLogout }: NavbarProps) {
//   return (
//     <nav className="bg-white/80 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800/60 backdrop-blur-md px-8 py-4 sticky top-0 z-50 transition-colors duration-300">
//       <div className="max-w-6xl mx-auto flex justify-between items-center">
//         <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-lg">
//           <Sparkles className="w-5 h-5" />
//           <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
//           <span className="text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-md text-stone-500 dark:text-stone-400 font-normal ml-1">Workspace</span>
//         </div>
//         <div className="flex items-center gap-4">
//           <ThemeToggle />

//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-semibold text-amber-600 dark:text-amber-400 font-bold">
//               {userName.charAt(0).toUpperCase()}
//             </div>
//             <span className="text-stone-700 dark:text-stone-300 text-sm font-medium">{userName}</span>
//           </div>
//           <button
//             onClick={onLogout}
//             className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white rounded-lg transition-all cursor-pointer font-medium"
//           >
//             <LogOut className="w-3.5 h-3.5" />
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, LayoutGrid, Terminal, Wrench, ShoppingBag, User, ShieldCheck, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('builder');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUserRole(u.role || 'builder');
    }

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation Items inside the Menu Button
  const navItems = [
    ...(userRole === 'admin'
      ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" /> }]
      : []),
    { name: 'Active Workspaces', href: '/dashboard', icon: <Terminal className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
    { name: 'My Tool Locker', href: '/dashboard/locker', icon: <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
    { name: 'Marketplace', href: '/dashboard/marketplace', icon: <ShoppingBag className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
    { name: 'Profile & Settings', href: '/dashboard/profile', icon: <User className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
  ];

  return (
    <nav className="bg-white/80 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800/60 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Left: Clickable Logo + Interactive Workspace Menu Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-base sm:text-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
          </Link>

          {/* 1. INTERACTIVE NAVBAR MENU BUTTON (No more plain words!) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-all cursor-pointer select-none"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline-block">Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-1.5 z-50 animate-pop-in">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer"
                    >
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Theme Toggle, Clickable Avatar & Logout Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {/* 2. Clickable Avatar Circle */}
          <Link 
            href="/dashboard/profile"
            className="flex items-center gap-2 group cursor-pointer"
            title="View Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:border-amber-500 transition-all flex-shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </Link>

          {/* 3. Streamlined Logout Icon */}
          <button
            onClick={onLogout}
            className="p-2 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </nav>
  );
}