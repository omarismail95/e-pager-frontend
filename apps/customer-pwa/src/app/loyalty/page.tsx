'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Package, Star, CreditCard } from 'lucide-react'
import { Card, CardContent, Badge, Skeleton } from '@epager/ui'
import { createLoyaltyClient } from '@epager/api-client/loyalty'

interface LoyaltyLink {
  id: string
  tenantId: string
  customerId: string
  programId: string
  maskedCardRef: string
  status: 'ACTIVE' | 'REVOKED' | string
  linkedAt: string
}

const TENANT_ID = process.env['NEXT_PUBLIC_TENANT_ID'] ?? ''

export default function LoyaltyPage() {
  const client = createLoyaltyClient()

  const { data: links = [], isLoading } = useQuery<LoyaltyLink[]>({
    queryKey: ['customer-loyalty', TENANT_ID],
    queryFn: async () => {
      const url = TENANT_ID ? `/customer/loyalty?tenantId=${TENANT_ID}` : '/customer/loyalty'
      const res = await client.GET(url as never, {} as never)
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (Array.isArray(res.data) ? res.data : []) as LoyaltyLink[]
    },
  })

  const activeLinks = links.filter((l) => l.status === 'ACTIVE')

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
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No loyalty programs yet</p>
            <p className="text-sm text-muted-foreground">
              Ask staff to link your loyalty card to start earning rewards
            </p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Loyalty Programs</p>
                  <p className="text-5xl font-black mt-1">{activeLinks.length}</p>
                  <p className="text-sm opacity-80 mt-1">active</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Star className="h-8 w-8 fill-current" />
                </div>
              </div>
            </div>

            {/* Program list */}
            <div className="space-y-3">
              {links.map((link) => (
                <Card key={link.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Card: {link.maskedCardRef}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Linked {new Date(link.linkedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={link.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {link.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
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
