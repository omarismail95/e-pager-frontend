'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'

interface ShopSettings {
  operationalHoursStart?: string
  operationalHoursEnd?: string
  maxOrdersPerHour?: number
  notifyOnOrderReady?: boolean
  loyaltyEnabled?: boolean
  privacyMaskCustomerName?: boolean
}

export function ShopSettingsTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const client = createShopClient()
  const [saved, setSaved] = useState(false)

  const { data: settings, isLoading } = useQuery<ShopSettings>({
    queryKey: ['shop-settings', shopId],
    queryFn: async () => {
      const res = await client.GET('/api/shops/{shopId}/settings' as never, {
        params: { path: { shopId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (res.data ?? {}) as ShopSettings
    },
  })

  const [form, setForm] = useState<ShopSettings>({})
  const merged = { ...settings, ...form }

  const update = useMutation({
    mutationFn: async () => {
      await client.PATCH('/api/shops/{shopId}/settings' as never, {
        params: { path: { shopId } } as never,
        body: merged as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-settings', shopId] })
      setSaved(true)
      setForm({})
      setTimeout(() => setSaved(false), 2000)
    },
  })

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">Loading settings…</div>
  }

  return (
    <Tabs defaultValue="operational">
      <TabsList className="mb-4">
        <TabsTrigger value="operational">Operational</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>

      {/* Operational */}
      <TabsContent value="operational">
        <Card>
          <CardHeader><CardTitle className="text-base">Operating Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Opening Time</Label>
                <Input
                  type="time"
                  value={merged.operationalHoursStart ?? '08:00'}
                  onChange={(e) => setForm((f) => ({ ...f, operationalHoursStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Closing Time</Label>
                <Input
                  type="time"
                  value={merged.operationalHoursEnd ?? '22:00'}
                  onChange={(e) => setForm((f) => ({ ...f, operationalHoursEnd: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Max Orders / Hour</Label>
              <Input
                type="number"
                min={1}
                max={500}
                value={merged.maxOrdersPerHour ?? 100}
                className="w-32"
                onChange={(e) => setForm((f) => ({ ...f, maxOrdersPerHour: Number(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={merged.notifyOnOrderReady ?? true}
                onChange={(e) => setForm((f) => ({ ...f, notifyOnOrderReady: e.target.checked }))}
              />
              <div>
                <p className="text-sm font-medium">Notify customer when order is ready</p>
                <p className="text-xs text-muted-foreground">Sends push notification or SMS when order status changes to READY</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Loyalty */}
      <TabsContent value="loyalty">
        <Card>
          <CardHeader><CardTitle className="text-base">Loyalty Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={merged.loyaltyEnabled ?? false}
                onChange={(e) => setForm((f) => ({ ...f, loyaltyEnabled: e.target.checked }))}
              />
              <div>
                <p className="text-sm font-medium">Enable loyalty program</p>
                <p className="text-xs text-muted-foreground">Allow customers to earn and redeem points at this shop</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy */}
      <TabsContent value="privacy">
        <Card>
          <CardHeader><CardTitle className="text-base">Privacy Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={merged.privacyMaskCustomerName ?? false}
                onChange={(e) => setForm((f) => ({ ...f, privacyMaskCustomerName: e.target.checked }))}
              />
              <div>
                <p className="text-sm font-medium">Mask customer name on display boards</p>
                <p className="text-xs text-muted-foreground">Show only first name + last initial on public order displays</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-4">
        <Button size="sm" onClick={() => update.mutate()} disabled={update.isPending}>
          {update.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </Tabs>
  )
}
