// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MeteringPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createMeteringClient(options: ClientOptions = {}) {
  return createApiClient<MeteringPaths>(options)
}
export type MeteringClient = ReturnType<typeof createMeteringClient>
