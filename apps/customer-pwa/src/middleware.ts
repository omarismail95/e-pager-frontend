import { type NextRequest, NextResponse } from 'next/server'
import { protectRoute } from '@epager/auth/middleware'

const PUBLIC_PATHS = ['/auth', '/api/auth', '/api/session', '/scan']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()
  const redirect = protectRoute(request, { loginPath: '/auth', authType: 'customer' })
  if (redirect) return redirect
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
