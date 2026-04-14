'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'
import { ShopStatusBadge } from './shop-status-badge'
import type { Shop } from './shops-table'

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  phone: z.string().optional(),
  timezone: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

const TIMEZONES = ['Asia/Dubai', 'Asia/Riyadh', 'Asia/Kuwait', 'Africa/Cairo', 'Europe/London', 'America/New_York', 'UTC']

export function ShopOverviewTab({ shop }: { shop: Shop }) {
  const queryClient = useQueryClient()
  const client = createShopClient()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shop.name,
      address: shop.address,
      phone: shop.phone ?? '',
      timezone: shop.timezone,
    },
  })

  const updateShop = useMutation({
    mutationFn: async (values: FormValues) => {
      await client.PATCH('/api/shops/{shopId}' as never, {
        params: { path: { shopId: shop.id } } as never,
        body: values as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop', shop.id] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit((v) => updateShop.mutate(v))(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register('phone')} placeholder="+971 50 000 0000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input {...register('address')} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select defaultValue={shop.timezone} onValueChange={(v) => setValue('timezone', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Status: <ShopStatusBadge status={shop.status} />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
