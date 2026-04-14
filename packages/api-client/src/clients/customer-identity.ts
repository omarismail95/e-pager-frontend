// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomerIdentityPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createCustomerIdentityClient(options: ClientOptions = {}) {
  return createApiClient<CustomerIdentityPaths>(options)
}
export type CustomerIdentityClient = ReturnType<typeof createCustomerIdentityClient>
