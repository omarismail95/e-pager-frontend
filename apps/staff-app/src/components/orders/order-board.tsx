'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@epager/ui'
import { OrderCard, type Order, type OrderStatus } from './order-card'
import { CreateOrderModal } from './create-order-modal'
import { createOrderClient } from '@epager/api-client/order'

const STATUS_COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'New', color: 'bg-blue-50 border-blue-200' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
  { status: 'READY', label: 'Ready', color: 'bg-green-50 border-green-200' },
  { status: 'COMPLETED', label: 'Completed', color: 'bg-gray-50 border-gray-200' },
  { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-50 border-red-200' },
]

interface OrderBoardProps {
  shopId: string
  tenantId: string
}

export function OrderBoard({ shopId, tenantId }: OrderBoardProps) {
  const queryClient = useQueryClient()
  const client = createOrderClient()

  const { data, isError } = useQuery({
    queryKey: ['orders', shopId],
    queryFn: async () => {
      const res = await client.GET('/api/shops/{shopId}/orders' as never, {
        params: {
          path: { shopId },
          query: { tenantId, size: 100 },
        } as never,
      })
      if (res.error) throw res.error
      const responseData = res.data as { content?: Order[] } | undefined
      return responseData?.content ?? []
    },
    refetchInterval: 5000,
    staleTime: 3000,
  })

  const advanceStatus = useMutation({
    mutationFn: async ({ orderId, targetStatus }: { orderId: string; targetStatus: OrderStatus }) => {
      const requestId = crypto.randomUUID()
      await client.POST('/api/shops/{shopId}/orders/{orderId}/status' as never, {
        params: { path: { shopId, orderId } } as never,
        body: { requestId, targetStatus } as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', shopId] })
    },
  })

  const orders: Order[] = (data as Order[] | undefined) ?? []

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center text-destructive">
        Failed to load orders.{' '}
        <button className="ml-1 underline" onClick={() => void queryClient.invalidateQueries({ queryKey: ['orders', shopId] })}>
          Retry
        </button>
      </div>
    )
  }

  const groupedOrders = STATUS_COLUMNS.reduce<Record<OrderStatus, Order[]>>(
    (acc, { status }) => {
      acc[status] = orders.filter((o) => o.status === status)
      return acc
    },
    { NEW: [], IN_PROGRESS: [], READY: [], COMPLETED: [], CANCELLED: [] },
  )

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{orders.length} orders • auto-refreshing</p>
        <CreateOrderModal
          shopId={shopId}
          tenantId={tenantId}
          onCreated={() => void queryClient.invalidateQueries({ queryKey: ['orders', shopId] })}
        />
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 overflow-x-auto md:grid-cols-3 lg:grid-cols-5">
        {STATUS_COLUMNS.map(({ status, label, color }) => (
          <div
            key={status}
            className={`flex flex-col rounded-lg border-2 ${color} min-h-0`}
          >
            <div className="flex items-center justify-between border-b border-inherit px-3 py-2">
              <span className="text-sm font-semibold">{label}</span>
              <Badge variant="secondary" className="text-xs">
                {groupedOrders[status].length}
              </Badge>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {groupedOrders[status].map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAdvance={(targetStatus) =>
                    void advanceStatus.mutate({ orderId: order.id, targetStatus })
                  }
                />
              ))}
              {groupedOrders[status].length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>

    </>
  )
}
