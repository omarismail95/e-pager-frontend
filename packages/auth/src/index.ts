// Constants
export {
  STAFF_TOKEN_COOKIE,
  CUSTOMER_TOKEN_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  COOKIE_OPTIONS,
} from './constants'

// JWT utilities (safe to use on client and server)
export {
  decodeJwt,
  isTokenValid,
  getTokenExpiry,
  type StaffTokenClaims,
  type CustomerTokenClaims,
  type TokenClaims,
} from './jwt'
