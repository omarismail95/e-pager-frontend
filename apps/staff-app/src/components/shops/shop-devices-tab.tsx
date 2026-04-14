'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Monitor, Tablet, Smartphone } from 'lucide-react'
import {
  Button,
  Badge,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'

interface Device {
  id: string
  name: string
  type: string
  status: string
  registeredAt: string
  lastSeenAt?: string
}

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  type: z.enum(['KIOSK', 'TABLET', 'MOBILE', 'DISPLAY']),
})
type FormValues = z.infer<typeof schema>

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  KIOSK: Monitor,
  TABLET: Tablet,
  MOBILE: Smartphone,
  DISPLAY: Monitor,
}

export function ShopDevicesTab({ shopId }: { shopId: string }) {
  const [registerOpen, setRegisterOpen] = useState(false)
  const queryClient = useQueryClient()
  const client = createShopClient()

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ['shop-devices', shopId],
    queryFn: async () => {
      const res = await client.GET('/api/shops/{shopId}/devices' as never, {
        params: { path: { shopId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: Device[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as Device[]) : [])
    },
  })

  const revoke = useMutation({
    mutationFn: async (deviceId: string) => {
      await client.DELETE('/api/shops/{shopId}/devices/{deviceId}' as never, {
        params: { path: { shopId, deviceId } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['shop-devices', shopId] }),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'TABLET' },
  })

  const registerDevice = useMutation({
    mutationFn: async (values: FormValues) => {
      await client.POST('/api/shops/{shopId}/devices' as never, {
        params: { path: { shopId } } as never,
        body: values as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-devices', shopId] })
      reset()
      setRegisterOpen(false)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{devices.length} registered devices</p>
        <Button size="sm" onClick={() => setRegisterOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Register Device
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Monitor className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No devices registered</p>
            <p className="text-xs text-muted-foreground">Register a kiosk, tablet, or mobile device to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {devices.map((device) => {
            const Icon = DEVICE_ICONS[device.type] ?? Monitor
            return (
              <Card key={device.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{device.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{device.type}</Badge>
                        <Badge
                          variant={device.status === 'ACTIVE' ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => void revoke.mutate(device.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Register Device</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void handleSubmit((v) => registerDevice.mutate(v))(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Device Name</Label>
              <Input {...register('name')} placeholder="Counter Tablet 1" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Device Type</Label>
              <Select defaultValue="TABLET" onValueChange={(v) => setValue('type', v as FormValues['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KIOSK">Kiosk</SelectItem>
                  <SelectItem value="TABLET">Tablet</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                  <SelectItem value="DISPLAY">Display Board</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || registerDevice.isPending}>
                {registerDevice.isPending ? 'Registering…' : 'Register'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
