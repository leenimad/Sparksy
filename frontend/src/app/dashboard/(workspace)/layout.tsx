'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Terminal, Wrench, ShoppingBag, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import ThemeToggle from '@/components/ThemeToggle';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = Cookies.get('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUserName(user.name);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Active Workspaces', href: '/dashboard', icon: <Terminal className="w-4 h-4" /> },
    { name: 'My Tool Locker', href: '/dashboard/locker', icon: <Wrench className="w-4 h-4" /> },
    { name: 'Marketplace', href: '/dashboard/marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex transition-colors duration-300">
      {/* Left Fixed Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-stone-950/40 border-r border-stone-200 dark:border-stone-800/60 backdrop-blur-md flex flex-col justify-between p-6 fixed h-screen z-50">
        <div className="space-y-8">
          {/* Branding Header */}
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
            <span className="text-[10px] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-md text-stone-500 dark:text-slate-400 font-normal">v1.0</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Section */}
        <div className="space-y-4 border-t border-stone-200/60 dark:border-stone-800/60 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-stone-700 dark:text-stone-300 text-sm font-semibold truncate max-w-[100px]">{userName}</span>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Dynamic Content Panel (Margined to fit the sidebar) */}
      <div className="flex-1 pl-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}