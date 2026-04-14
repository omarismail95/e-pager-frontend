// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoyaltyPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createLoyaltyClient(options: ClientOptions = {}) {
  return createApiClient<LoyaltyPaths>(options)
}
export type LoyaltyClient = ReturnType<typeof createLoyaltyClient>
