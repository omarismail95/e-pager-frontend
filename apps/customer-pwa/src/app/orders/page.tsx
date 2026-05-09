'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Package, ChevronRight } from 'lucide-react'
import { Badge, Card, CardContent } from '@epager/ui'
import { createCustomerIdentityClient } from '@epager/api-client/customer-identity'
import { getGlobalAuthToken } from '@epager/api-client'

interface LedgerEvent {
  eventType: string
  orderId: string
  shopId: string
  eventTime: string
}

interface LedgerPage {
  items: LedgerEvent[]
  totalCount: number
  page: number
  pageSize: number
  hasNext: boolean
}

interface CustomerProfile {
  id: string
}

const EVENT_LABELS: Record<string, string> = {
  ORDER_CREATED_WITH_CUSTOMER: 'Order Placed',
  CUSTOMER_ORDER_ATTACHED: 'Order Linked',
  CUSTOMER_QR_SCANNED: 'QR Scanned',
}

// Tenant ID must be set per-deployment for the customer history lookup.
// Each customer PWA instance is for a specific tenant/restaurant.
const TENANT_ID = process.env['NEXT_PUBLIC_TENANT_ID'] ?? ''

export default function OrdersPage() {
  const client = createCustomerIdentityClient()

  // Step 1: get customer profile to obtain customerId
  const { data: profile } = useQuery<CustomerProfile>({
    queryKey: ['customer-profile-id'],
    queryFn: async () => {
      const res = await client.GET('/customer/profile' as never, {} as never)
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return res.data as unknown as CustomerProfile
    },
  })

  // Step 2: fetch order history from ledger service (via /customer/history gateway route)
  const { data: ledgerPage, isLoading } = useQuery<LedgerPage>({
    queryKey: ['customer-order-history', profile?.id],
    enabled: !!profile?.id && !!TENANT_ID,
    queryFn: async () => {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080'
      const url = `${apiUrl}/customer/history/customers/${profile!.id}/events?tenantId=${TENANT_ID}&limit=50`
      const token = getGlobalAuthToken()
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to load order history')
      return res.json()
    },
    refetchInterval: 10_000,
  })

  // Deduplicate by orderId — ledger may have multiple events per order
  const seenOrders = new Set<string>()
  const orders = (ledgerPage?.items ?? []).filter((e) => {
    if (seenOrders.has(e.orderId)) return false
    seenOrders.add(e.orderId)
    return true
  })

  const noTenantConfig = !TENANT_ID

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      <div className="flex-1 p-4">
        {noTenantConfig ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-muted-foreground opacity-30" />
            <p className="font-medium">Order history not configured</p>
            <p className="text-sm text-muted-foreground">Set NEXT_PUBLIC_TENANT_ID to enable</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-muted-foreground opacity-30" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((event) => (
              <Link key={event.orderId} href={`/orders/${event.orderId}`}>
                <Card className="active:scale-[0.98] transition-transform">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-bold text-lg">Order #{event.orderId.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.eventTime), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {EVENT_LABELS[event.eventType] ?? 'Order'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 border-t bg-card px-4 py-2">
        <div className="flex justify-around">
          <Link href="/orders" className="flex flex-col items-center gap-0.5 text-primary">
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <span className="text-lg">★</span>
            <span className="text-xs">Loyalty</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <span className="text-lg">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
