import { type NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@epager/auth/middleware'

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/session']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect all /dashboard/* routes
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    const redirect = protectRoute(request, { loginPath: '/login', authType: 'staff' })
    if (redirect) return redirect
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
