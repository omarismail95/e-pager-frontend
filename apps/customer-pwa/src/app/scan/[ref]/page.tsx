'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OrderStatusCard } from '@/components/orders/order-status-card'
import { Skeleton } from '@epager/ui'

interface PublicOrderStatus {
  publicRef: string
  orderId: string | null
  tenantId: string
  shopId: string
  displayNumber: string | null
  status: string
  createdAt: string | null
  readyAt: string | null
  tokenExpiresAt: string
}

interface PageProps {
  params: Promise<{ ref: string }>
}

function playReadySound() {
  try {
    const ctx = new AudioContext()
    const times = [0, 0.3, 0.6]
    times.forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime + t)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + t + 0.15)
      gain.gain.setValueAtTime(0.4, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.25)
    })
    // Close context after sounds finish
    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Web Audio not available — silently ignore
  }
}

export default function ScanStatusPage({ params }: PageProps) {
  const { ref } = use(params)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const prevStatusRef = useRef<string | null>(null)
  const hasPlayedReadyRef = useRef(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const { data, isLoading, isError } = useQuery<PublicOrderStatus>({
    queryKey: ['scan-status', ref],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/r/${ref}/status`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<PublicOrderStatus>
    },
    refetchInterval: 5000,
    retry: 3,
    enabled: !!ref,
  })

  // Play sound when order transitions to READY; reset flag when status moves away
  useEffect(() => {
    if (!data) return
    const prev = prevStatusRef.current
    const curr = data.status
    prevStatusRef.current = curr

    if (curr !== 'READY') {
      hasPlayedReadyRef.current = false
      return
    }
    if (prev !== 'READY' && !hasPlayedReadyRef.current && soundEnabled) {
      playReadySound()
      hasPlayedReadyRef.current = true
    }
  }, [data, soundEnabled])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold">Order Status</h1>
        <button
          onClick={() => setSoundEnabled((v) => !v)}
          className="rounded-full p-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title={soundEnabled ? 'Mute notifications' : 'Enable sound notifications'}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>
      </div>

      {/* Sound prompt — shown only while order is not yet ready */}
      {!soundEnabled && data?.status !== 'READY' && data?.status !== 'COMPLETED' && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800">Want a sound when your order is ready?</p>
          <button
            onClick={() => setSoundEnabled(true)}
            className="mt-2 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
          >
            Enable sound notifications
          </button>
        </div>
      )}

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-2xl">😕</p>
            <p className="mt-2 font-medium">QR code not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This QR code may have expired or is invalid. Please ask the staff for a new one.
            </p>
          </div>
        ) : data && data.orderId && data.displayNumber && data.createdAt ? (
          <>
            <OrderStatusCard
              displayNumber={data.displayNumber}
              status={data.status as 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED'}
              createdAt={data.createdAt}
            />
            {data.status === 'READY' && (
              <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-center">
                <p className="font-semibold text-green-700">Your order is ready! 🎉</p>
                <p className="text-sm text-green-600">Please come to the counter to collect it.</p>
              </div>
            )}
          </>
        ) : data?.status === 'SHOP_QR' ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl">🏪</p>
            <p className="mt-3 text-lg font-semibold">Welcome!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan an order QR code to track your order status.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
