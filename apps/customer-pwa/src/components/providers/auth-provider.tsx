'use client'

import { setGlobalAuthToken } from '@epager/api-client'

interface AuthProviderProps {
  children: React.ReactNode
  initialToken?: string | null
}

export function AuthProvider({ children, initialToken = null }: AuthProviderProps) {
  // Set synchronously so token is available on first render before React Query fires.
  setGlobalAuthToken(initialToken)
  return <>{children}</>
}
