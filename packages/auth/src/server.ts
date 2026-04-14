/**
 * Server-side auth helpers (Next.js Route Handlers + Server Components).
 * Import from '@epager/auth/server' — never in client components.
 */
import { cookies } from 'next/headers'
import {
  STAFF_TOKEN_COOKIE,
  CUSTOMER_TOKEN_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  COOKIE_OPTIONS,
} from './constants'
import { decodeJwt, isTokenValid, type StaffTokenClaims, type CustomerTokenClaims } from './jwt'

// ─── Staff ───────────────────────────────────────────────────────────────────

export async function setStaffTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(STAFF_TOKEN_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
}

export async function getStaffToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(STAFF_TOKEN_COOKIE)?.value ?? null
}

export async function clearStaffToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(STAFF_TOKEN_COOKIE)
}

export async function getStaffSession(): Promise<StaffTokenClaims | null> {
  const token = await getStaffToken()
  if (!token || !isTokenValid(token)) return null
  const claims = decodeJwt<StaffTokenClaims>(token)
  if (claims?.principal_type !== 'STAFF') return null
  return claims
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export async function setCustomerTokenCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CUSTOMER_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  cookieStore.set(CUSTOMER_REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export async function getCustomerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value ?? null
}

export async function getCustomerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CUSTOMER_REFRESH_COOKIE)?.value ?? null
}

export async function clearCustomerTokens(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_TOKEN_COOKIE)
  cookieStore.delete(CUSTOMER_REFRESH_COOKIE)
}

export async function getCustomerSession(): Promise<CustomerTokenClaims | null> {
  const token = await getCustomerToken()
  if (!token || !isTokenValid(token)) return null
  const claims = decodeJwt<CustomerTokenClaims>(token)
  if (claims?.principal_type !== 'CUSTOMER') return null
  return claims
}

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * Returns the Authorization header value for forwarding the staff token to the gateway.
 * Use in Server Components / Route Handlers that call the backend.
 */
export async function getStaffAuthHeader(): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await getStaffToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function getCustomerAuthHeader(): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await getCustomerToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
