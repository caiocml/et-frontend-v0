import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if there's a user token in cookies
  const isAuthenticated = request.cookies.has('user')
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'
  const isPublicPath = request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.includes('/api/') ||
                       request.nextUrl.pathname.includes('/static/') ||
                       request.nextUrl.pathname === '/favicon.ico'

  // If trying to access auth page while already logged in, redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !isAuthPage && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Specify routes to apply middleware to (all routes except public ones)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 