// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShopPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createShopClient(options: ClientOptions = {}) {
  return createApiClient<ShopPaths>(options)
}
export type ShopClient = ReturnType<typeof createShopClient>
