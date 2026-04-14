import createFetchClient from 'openapi-fetch'

export type ClientOptions = {
  baseUrl?: string
  headers?: Record<string, string>
  /** Bearer token — passed explicitly from server components or auth store */
  token?: string | null
}

/**
 * Module-level token set by setGlobalAuthToken() in client-side AuthProvider.
 * Read at request time (not creation time) via openapi-fetch middleware, so the
 * token is always current even if the client was created before hydration finished.
 */
let _globalToken: string | null = null

/**
 * Call this once (e.g. in AuthProvider) after fetching /api/session.
 * All subsequent API calls from any client will include Authorization: Bearer.
 */
export function setGlobalAuthToken(token: string | null): void {
  _globalToken = token
}

export function getGlobalAuthToken(): string | null {
  return _globalToken
}

/**
 * Creates an openapi-fetch client pointed at the E-Pager gateway.
 * Auth priority: options.token → global token set by setGlobalAuthToken().
 */
export function createApiClient<Paths extends object>(options: ClientOptions = {}) {
  const baseUrl = options.baseUrl ?? (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080')

  const client = createFetchClient<Paths>({
    baseUrl,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Middleware injects Authorization header on every request.
  // Reads token at REQUEST time so it's always fresh.
  client.use({
    onRequest({ request }) {
      const token = options.token ?? _globalToken
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`)
      }
      return request
    },
  })

  return client
}
