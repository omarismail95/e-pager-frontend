/**
 * QR Token Service client.
 * Run `pnpm --filter @epager/api-client generate-types` to regenerate types.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenPaths = any

import { createApiClient, type ClientOptions } from '../lib/create-client'

export function createTokenClient(options: ClientOptions = {}) {
  return createApiClient<TokenPaths>(options)
}

export type TokenClient = ReturnType<typeof createTokenClient>
