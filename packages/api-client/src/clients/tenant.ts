// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TenantPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createTenantClient(options: ClientOptions = {}) {
  return createApiClient<TenantPaths>(options)
}
export type TenantClient = ReturnType<typeof createTenantClient>
