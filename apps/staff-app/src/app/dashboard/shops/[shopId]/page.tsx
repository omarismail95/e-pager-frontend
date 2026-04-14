'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Skeleton } from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'
import { ShopStatusBadge } from '@/components/shops/shop-status-badge'
import { ShopOverviewTab } from '@/components/shops/shop-overview-tab'
import { ShopSettingsTab } from '@/components/shops/shop-settings-tab'
import { ShopDevicesTab } from '@/components/shops/shop-devices-tab'
import { ShopQrCodesTab } from '@/components/shops/shop-qrcodes-tab'
import type { Shop } from '@/components/shops/shops-table'

interface PageProps {
  params: Promise<{ shopId: string }>
}

export default function ShopDetailPage({ params }: PageProps) {
  const { shopId } = use(params)
  const router = useRouter()
  const client = createShopClient()

  const { data: shop, isLoading } = useQuery<Shop>({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      const res = await client.GET('/api/shops/{shopId}' as never, {
        params: { path: { shopId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return res.data as Shop
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Shop not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/shops')}>Back to Shops</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/dashboard/shops')}>
          <ArrowLeft className="h-4 w-4" />
          Shops
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{shop.name}</h1>
          <ShopStatusBadge status={shop.status} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview">
            <ShopOverviewTab shop={shop} />
          </TabsContent>
          <TabsContent value="settings">
            <ShopSettingsTab shopId={shopId} />
          </TabsContent>
          <TabsContent value="devices">
            <ShopDevicesTab shopId={shopId} />
          </TabsContent>
          <TabsContent value="qr-codes">
            <ShopQrCodesTab shopId={shopId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
