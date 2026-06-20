import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isRootPage = pathname === '/'; // 1. Identify the root landing page

  // If trying to access dashboard without a token, redirect to login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already logged in and trying to access login/register, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. UX Optimization: If already logged in and trying to access the landing page, redirect to dashboard
  if (isRootPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 3. Make sure to include the root path '/' in the matcher config
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};