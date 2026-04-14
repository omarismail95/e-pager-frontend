'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Package, Star, ArrowLeft } from 'lucide-react'
import { Card, CardContent, Badge, Skeleton } from '@epager/ui'
import { createLoyaltyClient } from '@epager/api-client/loyalty'

interface LoyaltyBalance {
  points: number
  tier?: string
  programName?: string
  nextTierPoints?: number
  nextTier?: string
}

export default function LoyaltyPage() {
  const client = createLoyaltyClient()

  const { data, isLoading } = useQuery<LoyaltyBalance>({
    queryKey: ['customer-loyalty'],
    queryFn: async () => {
      const res = await client.GET('/customer/loyalty' as never, {} as never)
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (res.data ?? { points: 0 }) as LoyaltyBalance
    },
  })

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="sticky top-0 z-10 border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold">Loyalty</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        ) : (
          <>
            {/* Points card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{data?.programName ?? 'Loyalty Points'}</p>
                  <p className="text-5xl font-black mt-1">{data?.points ?? 0}</p>
                  <p className="text-sm opacity-80 mt-1">points</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Star className="h-8 w-8 fill-current" />
                </div>
              </div>
              {data?.tier && (
                <div className="mt-4">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs">
                    {data.tier} Member
                  </Badge>
                </div>
              )}
            </div>

            {/* Next tier progress */}
            {data?.nextTier && data.nextTierPoints && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Progress to {data.nextTier}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(((data.points ?? 0) / data.nextTierPoints) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.nextTierPoints - (data.points ?? 0)} points needed
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 border-t bg-card px-4 py-2">
        <div className="flex justify-around">
          <Link href="/orders" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center gap-0.5 text-primary">
            <Star className="h-5 w-5 fill-current" />
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
