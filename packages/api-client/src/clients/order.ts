/**
 * Order Service client.
 *
 * Types are auto-generated from the OpenAPI spec.
 * Run `pnpm --filter @epager/api-client generate-types` to regenerate.
 *
 * Until types are generated, `paths` is typed as `Record<string, unknown>`.
 * After generation, replace with: import type { paths } from '../types/order.d.ts'
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderPaths = any

import { createApiClient, type ClientOptions } from '../lib/create-client'

export function createOrderClient(options: ClientOptions = {}) {
  return createApiClient<OrderPaths>(options)
}

export type OrderClient = ReturnType<typeof createOrderClient>
