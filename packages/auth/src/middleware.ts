/**
 * Next.js middleware helpers for route protection.
 * Used in each app's middleware.ts.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { STAFF_TOKEN_COOKIE, CUSTOMER_TOKEN_COOKIE } from './constants'
import { isTokenValid } from './jwt'

export type AuthType = 'staff' | 'customer'

export interface ProtectRouteOptions {
  loginPath: string
  authType: AuthType
}

/**
 * Checks the appropriate cookie; redirects to loginPath if missing/expired.
 * Call this inside your app's middleware.ts.
 */
export function protectRoute(
  request: NextRequest,
  { loginPath, authType }: ProtectRouteOptions,
): NextResponse | null {
  const cookieName = authType === 'staff' ? STAFF_TOKEN_COOKIE : CUSTOMER_TOKEN_COOKIE
  const token = request.cookies.get(cookieName)?.value

  if (!token || !isTokenValid(token)) {
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return null
}
