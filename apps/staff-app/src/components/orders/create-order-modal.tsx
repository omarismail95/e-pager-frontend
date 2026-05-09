'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@epager/ui'
import { QRCodeSVG } from 'qrcode.react'
import { createOrderClient } from '@epager/api-client/order'
import { createTokenClient } from '@epager/api-client/token'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

interface CreateOrderModalProps {
  shopId: string
  tenantId: string
  onCreated: () => void
}

interface CreatedOrder {
  id: string
  displayNumber: string
  qrUrl: string | null
}

export function CreateOrderModal({ shopId, tenantId, onCreated }: CreateOrderModalProps) {
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState('CASHIER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedOrder | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const orderClient = createOrderClient()
  const tokenClient = createTokenClient()

  async function handleCreate() {
    setError(null)
    setLoading(true)
    try {
      const requestId = crypto.randomUUID()
      const res = await orderClient.POST('/api/shops/{shopId}/orders' as never, {
        params: { path: { shopId }, query: { tenantId } } as never,
        body: { requestId, channel } as never,
      })
      if ((res as { error?: unknown }).error) throw new Error('Failed to create order')

      const order = res.data as { id: string; displayNumber: string }

      // Issue an order-specific QR scan token
      let qrUrl: string | null = null
      try {
        const tokenRes = await tokenClient.POST('/api/tokens/order-scan' as never, {
          body: {
            tenantId,
            shopId,
            orderId: order.id,
            allowWeb: true,
            allowApp: false,
          } as never,
        })
        const tokenData = tokenRes.data as { publicRef?: string; qrContent?: string } | null
        if (tokenData?.qrContent) {
          qrUrl = tokenData.qrContent
        } else if (tokenData?.publicRef) {
          qrUrl = `${API_URL}/r/${tokenData.publicRef}`
        }
      } catch {
        // QR token issuance is best-effort — don't block order creation
      }

      onCreated()
      setCreated({ id: order.id, displayNumber: order.displayNumber, qrUrl })
    } catch {
      setError('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setCreated(null)
    setChannel('CASHIER')
    setError(null)
  }

  function handlePrint() {
    if (!printRef.current) return
    const html = `
      <html><head><title>Order QR</title>
      <style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 24px; }
        h2 { font-size: 24px; margin-bottom: 8px; }
        p { color: #666; margin-bottom: 16px; }
        svg { width: 200px; height: 200px; }
      </style></head>
      <body>${printRef.current.innerHTML}</body></html>
    `
    const w = window.open('', '_blank', 'width=400,height=500')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => w.print(), 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Order #{created.displayNumber} Created</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              {created.qrUrl ? (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    Show or print this QR code for the customer to track their order status in real time.
                  </p>
                  <div ref={printRef} className="flex flex-col items-center gap-3">
                    <h2>Order #{created.displayNumber}</h2>
                    <p>Scan to track your order</p>
                    <QRCodeSVG value={created.qrUrl} size={200} level="M" includeMargin />
                  </div>
                  <Button variant="outline" className="w-full" onClick={handlePrint}>
                    Print QR Code
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Order created successfully. QR code generation was unavailable.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
                    <SelectItem value="CASHIER">Walk-in / Cashier</SelectItem>
                    <SelectItem value="WEB">Online / Web</SelectItem>
                    <SelectItem value="APP">Mobile App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => void handleCreate()} disabled={loading}>
                {loading ? 'Creating...' : 'Create Order'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
