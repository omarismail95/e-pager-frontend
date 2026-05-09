/**
 * Client-side JWT decode (no signature verification — the gateway verifies).
 * Used only to read claims (expiry, principalType, tenantId) from the cookie value.
 */

export interface StaffTokenClaims {
  sub: string       // staff user UUID
  email?: string    // staff user email (added in backend JWT claims)
  tid?: string      // tenant UUID (JWT claim name is "tid", not "tenant_id")
  roles?: string[]  // array of role codes
  perms?: string[]  // array of permission codes
  principal_type: 'STAFF'
  exp: number
  iat: number
}

export interface CustomerTokenClaims {
  sub: string
  device_id: string
  principal_type: 'CUSTOMER'
  exp: number
  iat: number
}

export type TokenClaims = StaffTokenClaims | CustomerTokenClaims

/**
 * Decodes a JWT payload without verification.
 * Returns null if the token is malformed.
 */
export function decodeJwt<T = TokenClaims>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    if (!payload) return null
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(decoded) as T
  } catch {
    return null
  }
}

/** Returns true if the token's exp claim is in the future (with a 30s buffer). */
export function isTokenValid(token: string): boolean {
  const claims = decodeJwt(token)
  if (!claims) return false
  const c = claims as unknown as Record<string, unknown>
  if (typeof c['exp'] !== 'number') return false
  return (c['exp'] as number) * 1000 > Date.now() + 30_000
}

/** Returns expiry Date from a JWT, or null. */
export function getTokenExpiry(token: string): Date | null {
  const claims = decodeJwt(token)
  const c = claims as unknown as Record<string, unknown>
  if (!c || typeof c['exp'] !== 'number') return null
  const exp = c['exp'] as number
  return new Date(exp * 1000)
}
