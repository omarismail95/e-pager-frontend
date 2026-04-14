'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, Printer, RefreshCw, Copy, Check } from 'lucide-react'
import { Button, Badge, Card, CardContent, Input, Label, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@epager/ui'
import { createTokenClient } from '@epager/api-client/token'

interface QrToken {
  id: string
  token: string
  publicRef: string
  label?: string
  shopId: string
  status: string
  createdAt: string
  expiresAt?: string
}

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080'

export function ShopQrCodesTab({ shopId }: { shopId: string }) {
  const [generateOpen, setGenerateOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const client = createTokenClient()

  const { data: tokens = [], isLoading } = useQuery<QrToken[]>({
    queryKey: ['qr-tokens', shopId],
    queryFn: async () => {
      const res = await client.GET('/api/tokens' as never, {
        params: { query: { shopId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: QrToken[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as QrToken[]) : [])
    },
  })

  const generate = useMutation({
    mutationFn: async () => {
      const requestId = crypto.randomUUID()
      const res = await client.POST('/api/tokens' as never, {
        body: { requestId, shopId, label: label || undefined } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['qr-tokens', shopId] })
      setLabel('')
      setGenerateOpen(false)
    },
  })

  const revoke = useMutation({
    mutationFn: async (tokenId: string) => {
      await client.DELETE('/api/tokens/{tokenId}' as never, {
        params: { path: { tokenId } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['qr-tokens', shopId] }),
  })

  function getScanUrl(token: QrToken) {
    return `${BASE_URL}/r/${token.publicRef}`
  }

  function copyToClipboard(text: string, id: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function printQr(token: QrToken) {
    const scanUrl = getScanUrl(token)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code — ${token.label ?? token.publicRef}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            .card { text-align: center; padding: 2rem; border: 2px solid #e5e7eb; border-radius: 1rem; max-width: 300px; }
            .label { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; }
            .sub { font-size: 0.75rem; color: #6b7280; margin-top: 1rem; }
            svg { max-width: 200px; height: auto; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <p class="label">${token.label ?? 'Scan to Order'}</p>
            <div id="qr"></div>
            <p class="sub">Scan to view your order status</p>
            <p class="sub no-print">${scanUrl}</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${scanUrl}', { width: 200 }, function(err, canvas) {
              if (!err) { document.getElementById('qr').appendChild(canvas); window.print(); }
            })
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tokens.length} QR codes</p>
        <Button size="sm" onClick={() => setGenerateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Generate QR Code
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 rounded-lg bg-muted p-3">
              <QRCodeSVG value="https://example.com" size={64} className="opacity-30" />
            </div>
            <p className="text-sm font-medium">No QR codes yet</p>
            <p className="text-xs text-muted-foreground">Generate a QR code that customers can scan to track their order</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => {
            const scanUrl = getScanUrl(token)
            return (
              <Card key={token.id}>
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <div className="mb-3 rounded-lg bg-white p-3 shadow-inner">
                    <QRCodeSVG value={scanUrl} size={140} includeMargin />
                  </div>
                  <p className="text-sm font-semibold">{token.label ?? 'QR Code'}</p>
                  <p className="text-xs text-muted-foreground">{token.publicRef}</p>
                  <Badge
                    variant={token.status === 'ACTIVE' ? 'success' : 'secondary'}
                    className="mt-1 text-xs"
                  >
                    {token.status}
                  </Badge>
                  <div className="mt-3 flex w-full gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => copyToClipboard(scanUrl, token.id)}
                    >
                      {copied === token.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => printQr(token)}
                    >
                      <Printer className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => void revoke.mutate(token.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Table 5, Counter A, etc."
              />
              <p className="text-xs text-muted-foreground">Helps identify this QR code on your print</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              {generate.isPending ? 'Generating…' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
