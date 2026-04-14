/**
 * Generates TypeScript types from OpenAPI specs.
 * Run: pnpm --filter @epager/api-client generate-types
 *
 * Requires the backend to be running at NEXT_PUBLIC_API_URL (default: http://localhost:8080)
 */
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'src', 'types')
const baseUrl = process.env.API_URL ?? 'http://localhost:8080'

const services = [
  { name: 'order', path: '/api-docs/orders/v3/api-docs' },
  { name: 'shop', path: '/api-docs/shops/v3/api-docs' },
  { name: 'tenant', path: '/api-docs/tenants/v3/api-docs' },
  { name: 'loyalty', path: '/api-docs/loyalty/v3/api-docs' },
  { name: 'identity', path: '/api-docs/identity/v3/api-docs' },
  { name: 'customer-identity', path: '/api-docs/customer-identity/v3/api-docs' },
  { name: 'admin', path: '/api-docs/admin/v3/api-docs' },
  { name: 'analytics', path: '/api-docs/analytics/v3/api-docs' },
  { name: 'metering', path: '/api-docs/metering/v3/api-docs' },
]

console.log(`Generating types from ${baseUrl}...\n`)

for (const svc of services) {
  const url = `${baseUrl}${svc.path}`
  const output = join(outDir, `${svc.name}.d.ts`)
  console.log(`  → ${svc.name}: ${url}`)
  try {
    execSync(`npx openapi-typescript "${url}" -o "${output}"`, { stdio: 'inherit' })
  } catch {
    console.warn(`  ⚠ Failed to generate types for ${svc.name} (is the backend running?)`)
  }
}

console.log('\nDone.')
