// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IdentityPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createIdentityClient(options: ClientOptions = {}) {
  return createApiClient<IdentityPaths>(options)
}
export type IdentityClient = ReturnType<typeof createIdentityClient>
