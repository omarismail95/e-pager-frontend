import { Suspense } from 'react'
import { Skeleton } from '@epager/ui'
import { OrderBoard } from '@/components/orders/order-board'
import { getStaffSession } from '@epager/auth/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Orders — E-Pager Staff' }

export default async function OrdersPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')

  const shopId = session.tenant_id // In real flow, comes from Zustand selectedShopId

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>
      <Suspense fallback={<BoardSkeleton />}>
        {shopId ? (
          <OrderBoard shopId={shopId} tenantId={session.tenant_id ?? ''} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a shop to view orders
          </div>
        )}
      </Suspense>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="grid flex-1 grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg bg-muted/40 p-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ))}
    </div>
  )
}
