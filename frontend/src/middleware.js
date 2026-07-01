import { NextResponse } from 'next/server';

export default function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Agar user tasks par jana chahta hai aur token nahi hai
  if (pathname.startsWith('/tasks') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Agar user logged in hai aur login/register par jana chahta hai
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

// Sirf in routes par middleware chalega
export const config = {
  matcher: ['/tasks/:path*', '/login', '/register'],
};