export const STAFF_TOKEN_COOKIE = 'epager_staff_token'
export const CUSTOMER_TOKEN_COOKIE = 'epager_customer_token'
export const CUSTOMER_REFRESH_COOKIE = 'epager_customer_refresh'

/** Cookie max-age in seconds — 15 minutes for access tokens */
export const ACCESS_TOKEN_MAX_AGE = 15 * 60

/** Cookie max-age in seconds — 30 days for refresh tokens */
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
