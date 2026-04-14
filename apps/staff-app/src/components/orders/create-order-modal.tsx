'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@epager/ui'
import { createOrderClient } from '@epager/api-client/order'

interface CreateOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  tenantId: string
  onCreated: () => void
}

export function CreateOrderModal({
  open,
  onOpenChange,
  shopId,
  tenantId,
  onCreated,
}: CreateOrderModalProps) {
  const [channel, setChannel] = useState('WALK_IN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const client = createOrderClient()

  async function handleCreate() {
    setError(null)
    setLoading(true)
    try {
      const requestId = crypto.randomUUID()
      const res = await client.POST('/api/shops/{shopId}/orders' as never, {
        params: { path: { shopId }, query: { tenantId } } as never,
        body: { requestId, channel } as never,
      })
      if ((res as { error?: unknown }).error) throw new Error('Failed to create order')
      onCreated()
      onOpenChange(false)
      setChannel('WALK_IN')
    } catch {
      setError('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WALK_IN">Walk-in</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="PHONE">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreate()} disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
