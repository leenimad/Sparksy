'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Terminal, Wrench, ShoppingBag, LogOut, ShieldCheck, User, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('builder');
  
  // Desktop Collapsible Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile Drawer Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
  }, [router]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.status === 'success') {
        const fetchedUser = response.data.data;
        setUserName(fetchedUser.name);
        setUserRole(fetchedUser.role || 'builder');
        localStorage.setItem('user', JSON.stringify(fetchedUser));

        // 1. STRICT ADMIN ROUTE GUARD:
        // If user is an Admin and tries to access personal builder routes (/dashboard or /dashboard/locker), bounce them to /dashboard/admin!
        if (
          fetchedUser.role === 'admin' && 
          (pathname === '/dashboard' || pathname === '/dashboard/locker')
        ) {
          router.push('/dashboard/admin');
        }
      }
    } catch (err) {
      console.error('Failed to sync profile with server', err);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // 2. STRICT ROLE-BASED NAVIGATION ITEMS (Completely separates Admin from Builder!)
  const menuItems = userRole === 'admin'
    ? [
        { name: 'Admin Panel', href: '/dashboard/admin', icon: <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" /> },
        { name: 'Marketplace Moderation', href: '/dashboard/marketplace', icon: <ShoppingBag className="w-4 h-4 flex-shrink-0" /> },
        { name: 'Profile & Settings', href: '/dashboard/profile', icon: <User className="w-4 h-4 flex-shrink-0" /> },
      ]
    : [
        { name: 'Active Workspaces', href: '/dashboard', icon: <Terminal className="w-4 h-4 flex-shrink-0" /> },
        { name: 'My Tool Locker', href: '/dashboard/locker', icon: <Wrench className="w-4 h-4 flex-shrink-0" /> },
        { name: 'Marketplace', href: '/dashboard/marketplace', icon: <ShoppingBag className="w-4 h-4 flex-shrink-0" /> },
        { name: 'Profile & Settings', href: '/dashboard/profile', icon: <User className="w-4 h-4 flex-shrink-0" /> },
      ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] text-stone-900 dark:text-white flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Top Header (Visible ONLY on mobile devices < 768px) */}
      <div className="md:hidden bg-white/80 dark:bg-[#0c0a09]/80 border-b border-stone-200 dark:border-stone-800/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-base">
          <Sparkles className="w-5 h-5" />
          <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-stone-100 dark:bg-stone-900 rounded-xl text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        ></div>
      )}

      {/* Left Sidebar Navigation (Desktop Fixed & Mobile Drawer) */}
      <aside 
        className={`bg-white dark:bg-stone-950/90 md:dark:bg-stone-950/40 border-r border-stone-200 dark:border-stone-800/60 backdrop-blur-md flex flex-col justify-between p-4 fixed h-screen z-50 transition-all duration-300 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className="space-y-8">
          {/* Branding Header & Desktop Toggle Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-lg overflow-hidden">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || mobileMenuOpen) && (
                <>
                  <span className="tracking-tight text-stone-900 dark:text-white">Sparksy</span>
                  <span className="text-[10px] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded-md text-stone-500 dark:text-slate-400 font-normal">v1.0</span>
                </>
              )}
            </div>

            {/* Desktop Collapse Toggle Icon Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition-all cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900'
                  } ${isCollapsed && !mobileMenuOpen ? 'md:justify-center' : ''}`}
                >
                  {item.icon}
                  {(!isCollapsed || mobileMenuOpen) && <span className="truncate">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Section */}
        <div className="space-y-4 border-t border-stone-200/60 dark:border-stone-800/60 pt-6">
          <div className={`flex items-center ${isCollapsed && !mobileMenuOpen ? 'md:justify-center' : 'justify-between'}`}>
            <div 
              onClick={() => {
                router.push('/dashboard/profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer group"
              title="View Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:border-amber-500 transition-all flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-stone-700 dark:text-stone-300 text-sm font-semibold truncate max-w-[90px] group-hover:text-amber-500 transition-colors">{userName}</span>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{userRole}</span>
                </div>
              )}
            </div>
            {(!isCollapsed || mobileMenuOpen) && <ThemeToggle />}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-xl transition-all cursor-pointer ${
              isCollapsed && !mobileMenuOpen ? 'md:px-2' : 'px-4'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {(!isCollapsed || mobileMenuOpen) && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Responsive Content Panel */}
      <div 
        className={`flex-1 min-h-screen transition-all duration-300 w-full ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        } pl-0`}
      >
        {children}
      </div>
    </div>
  );
}