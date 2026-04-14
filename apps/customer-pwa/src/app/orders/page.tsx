'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Package, ChevronRight } from 'lucide-react'
import { Badge, Card, CardContent } from '@epager/ui'
import { createCustomerIdentityClient } from '@epager/api-client/customer-identity'

interface CustomerOrder {
  id: string
  shopId: string
  displayNumber: string
  status: string
  channel: string
  createdAt: string
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  NEW: 'default',
  IN_PROGRESS: 'warning',
  READY: 'success',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

export default function OrdersPage() {
  const client = createCustomerIdentityClient()

  const { data: orders = [], isLoading } = useQuery<CustomerOrder[]>({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const res = await client.GET('/customer/orders' as never, {
        params: { query: { size: 50 } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: CustomerOrder[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as CustomerOrder[]) : [])
    },
    refetchInterval: 10_000,
  })

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
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
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}?shopId=${order.shopId}`}>
                <Card className="active:scale-[0.98] transition-transform">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-bold text-lg">#{order.displayNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLORS[order.status] ?? 'outline'}>
                        {order.status.replace('_', ' ')}
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
