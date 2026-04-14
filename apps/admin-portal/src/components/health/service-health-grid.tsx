'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, Badge } from '@epager/ui'
import { createAdminClient } from '@epager/api-client/admin'

const SERVICES = [
  { key: 'gateway', name: 'Gateway', port: 8080 },
  { key: 'tenant', name: 'Tenant Service', port: 8095 },
  { key: 'shop', name: 'Shop Service', port: 8083 },
  { key: 'identity', name: 'Identity & Access', port: 8084 },
  { key: 'customer-identity', name: 'Customer Identity', port: 8081 },
  { key: 'order', name: 'Order Service', port: 8090 },
  { key: 'qr-token', name: 'QR Token Service', port: 8092 },
  { key: 'notification', name: 'Notification Orchestrator', port: 8093 },
  { key: 'loyalty', name: 'Loyalty Service', port: 8086 },
  { key: 'customer-ledger', name: 'Customer Ledger', port: 8091 },
  { key: 'metering', name: 'Metering & Quotas', port: 8087 },
  { key: 'admin', name: 'Admin Service', port: 8088 },
  { key: 'analytics', name: 'Analytics Service', port: 8089 },
  { key: 'scan-routing', name: 'Scan Routing', port: 8094 },
] as const

type ServiceStatus = 'UP' | 'DOWN' | 'UNKNOWN'

interface ServiceHealth {
  status: ServiceStatus
  components?: Record<string, { status: string }>
}

function ServiceCard({ service }: { service: { key: string; name: string; port: number } }) {
  const client = createAdminClient()

  const { data, isLoading, isError } = useQuery<ServiceHealth>({
    queryKey: ['service-health', service.key],
    queryFn: async () => {
      const res = await client.GET('/admin/health/{serviceKey}' as never, {
        params: { path: { serviceKey: service.key } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (res.data ?? { status: 'UNKNOWN' }) as ServiceHealth
    },
    refetchInterval: 30_000,
    retry: false,
  })

  const status: ServiceStatus = isLoading ? 'UNKNOWN' : isError ? 'DOWN' : (data?.status ?? 'UNKNOWN')

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium">{service.name}</p>
            <p className="text-xs text-muted-foreground">:{service.port}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : status === 'UP' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === 'DOWN' ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          <Badge
            variant={status === 'UP' ? 'success' : status === 'DOWN' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {isLoading ? 'Checking' : status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServiceHealthGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((service) => (
        <ServiceCard key={service.key} service={service} />
      ))}
    </div>
  )
}
