// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalyticsPaths = any
import { createApiClient, type ClientOptions } from '../lib/create-client'
export function createAnalyticsClient(options: ClientOptions = {}) {
  return createApiClient<AnalyticsPaths>(options)
}
export type AnalyticsClient = ReturnType<typeof createAnalyticsClient>
