'use client'

import { useEffect } from 'react'
import { setGlobalAuthToken } from '@epager/api-client'

/**
 * Fetches the session token from /api/session (same-origin, reads httpOnly cookie)
 * and registers it globally so all openapi-fetch clients include Authorization: Bearer.
 * Must render inside a client component tree (e.g. inside QueryProvider).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then(({ token }: { token: string | null }) => {
        setGlobalAuthToken(token)
      })
      .catch(() => {
        // Non-fatal: auth will fail with 401 but won't crash the app
      })
  }, [])

  return <>{children}</>
}
