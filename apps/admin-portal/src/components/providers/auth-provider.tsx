'use client'

import { useEffect } from 'react'
import { setGlobalAuthToken } from '@epager/api-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then(({ token }: { token: string | null }) => {
        setGlobalAuthToken(token)
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}
