'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button, Skeleton } from '@epager/ui'
import { createOrderClient } from '@epager/api-client/order'
import { OrderStatusCard } from '@/components/orders/order-status-card'

interface OrderDetail {
  id: string
  displayNumber: string
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED'
  channel: string
  createdAt: string
  shopId: string
}

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: PageProps) {
  const { orderId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const shopId = searchParams.get('shopId') ?? ''
  const client = createOrderClient()

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ['customer-order', orderId],
    queryFn: async () => {
      const res = await client.GET('/api/shops/{shopId}/orders/{orderId}' as never, {
        params: { path: { shopId, orderId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return res.data as OrderDetail
    },
    refetchInterval: 5000,
    enabled: !!shopId,
  })

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-card px-4 py-3">
        <Button variant="ghost" size="sm" className="p-0" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Order Status</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground">Order not found</p>
          </div>
        ) : (
          <OrderStatusCard
            displayNumber={order.displayNumber}
            status={order.status}
            createdAt={order.createdAt}
          />
        )}
      </div>
    </div>
  )
}
