// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createAdminClient(options: ClientOptions = {}) {
  return createApiClient<AdminPaths>(options)
}
export type AdminClient = ReturnType<typeof createAdminClient>
