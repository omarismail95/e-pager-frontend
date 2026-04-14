'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
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

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a full address'),
  phone: z.string().optional(),
  timezone: z.string().min(1, 'Select a timezone'),
})

type FormValues = z.infer<typeof schema>

interface CreateShopModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const TIMEZONES = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'Africa/Cairo',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
]

export function CreateShopModal({ open, onOpenChange, onCreated }: CreateShopModalProps) {
  const [error, setError] = useState<string | null>(null)
  const client = createShopClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'Asia/Dubai' },
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const res = await client.POST('/api/shops' as never, {
        body: {
          name: values.name,
          address: values.address,
          phone: values.phone ?? '',
          timezone: values.timezone,
        } as never,
      })
      if ((res as { error?: unknown }).error) throw new Error('Failed to create shop')
      reset()
      onCreated()
      onOpenChange(false)
    } catch {
      setError('Failed to create shop. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Shop</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="shop-name">Shop Name</Label>
            <Input id="shop-name" {...register('name')} placeholder="The Coffee House" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-address">Address</Label>
            <Input id="shop-address" {...register('address')} placeholder="123 Main St, Dubai" />
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-phone">Phone (optional)</Label>
            <Input id="shop-phone" {...register('phone')} placeholder="+971 50 000 0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-timezone">Timezone</Label>
            <Select defaultValue="Asia/Dubai" onValueChange={(v) => setValue('timezone', v)}>
              <SelectTrigger id="shop-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Shop'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
