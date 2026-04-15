'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@epager/ui'
import { createMeteringClient } from '@epager/api-client/metering'

interface QuotaUsage {
  resourceType: string
  used: number
  limit: number
  unit?: string
}

function QuotaMeter({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()} {unit ?? ''}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% used</p>
    </div>
  )
}

const RESOURCE_LABELS: Record<string, string> = {
  ORDERS_MONTHLY: 'Monthly Orders',
  SHOPS: 'Shops',
  DEVICES: 'Devices per Shop',
  QR_TOKENS: 'QR Tokens',
  STAFF_USERS: 'Staff Users',
  LOYALTY_PROGRAMS: 'Loyalty Programs',
}

export function QuotaMeters() {
  const client = createMeteringClient()

  const { data, isLoading } = useQuery<QuotaUsage[]>({
    queryKey: ['quota-usage'],
    queryFn: async () => {
      const res = await client.GET('/internal/usage/current' as never, {} as never)
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      // Backend returns { tenantId, asOf, usage: QuotaUsage[] }
      const body = res.data as { usage?: QuotaUsage[] } | QuotaUsage[] | null
      if (Array.isArray(body)) return body
      if (body && 'usage' in body && Array.isArray(body.usage)) return body.usage
      return []
    },
    staleTime: 60_000,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-2 animate-pulse rounded-full bg-muted" />
            </div>
          ))
        ) : data && data.length > 0 ? (
          data.map((quota) => (
            <QuotaMeter
              key={quota.resourceType}
              label={RESOURCE_LABELS[quota.resourceType] ?? quota.resourceType}
              used={quota.used}
              limit={quota.limit}
              unit={quota.unit}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No quota data available</p>
        )}
      </CardContent>
    </Card>
  )
}
