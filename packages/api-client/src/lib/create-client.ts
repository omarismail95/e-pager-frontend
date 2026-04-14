import createFetchClient from 'openapi-fetch'

export type ClientOptions = {
  baseUrl?: string
  headers?: Record<string, string>
}

/**
 * Creates an openapi-fetch client pointed at the E-Pager gateway.
 * All services route through the gateway at NEXT_PUBLIC_API_URL.
 */
export function createApiClient<Paths extends object>(options: ClientOptions = {}) {
  const baseUrl = options.baseUrl ?? (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080')
  return createFetchClient<Paths>({
    baseUrl,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
