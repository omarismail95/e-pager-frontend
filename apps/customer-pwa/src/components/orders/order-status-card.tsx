'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, Clock, ChefHat, Bell, XCircle } from 'lucide-react'
import { Badge } from '@epager/ui'

type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED'

interface OrderStatusCardProps {
  displayNumber: string
  status: OrderStatus
  createdAt: string
  shopName?: string
}

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  pulse?: boolean
}> = {
  NEW: {
    label: 'Order Received',
    description: 'Your order has been received and will be prepared shortly',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    pulse: true,
  },
  IN_PROGRESS: {
    label: 'Being Prepared',
    description: 'Our team is preparing your order right now',
    icon: ChefHat,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    pulse: true,
  },
  READY: {
    label: 'Ready for Pickup!',
    description: 'Your order is ready! Please come to the counter',
    icon: Bell,
    color: 'text-green-600',
    bg: 'bg-green-50',
    pulse: false,
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Thank you! Enjoy your order',
    icon: CheckCircle2,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'This order has been cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
}

const STATUS_STEPS: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'READY', 'COMPLETED']

export function OrderStatusCard({ displayNumber, status, createdAt, shopName }: OrderStatusCardProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const stepIndex = STATUS_STEPS.indexOf(status)

  return (
    <div className="space-y-6">
      {/* Main status */}
      <div className={`flex flex-col items-center rounded-2xl p-8 text-center ${config.bg}`}>
        <div className={`relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm`}>
          <Icon className={`h-10 w-10 ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
          {status === 'READY' && (
            <div className="absolute inset-0 animate-ping rounded-full bg-green-300 opacity-20" />
          )}
        </div>
        <h2 className={`text-2xl font-bold ${config.color}`}>{config.label}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-black">#{displayNumber}</span>
          {shopName && <Badge variant="outline">{shopName}</Badge>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Progress steps */}
      {status !== 'CANCELLED' && (
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, idx) => {
            const stepConfig = STATUS_CONFIG[step]
            const StepIcon = stepConfig.icon
            const isDone = stepIndex >= idx
            const isCurrent = stepIndex === idx

            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                    isDone
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-muted text-muted-foreground'
                  } ${isCurrent ? 'scale-110' : ''}`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <p className={`mt-1 text-xs ${isDone ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {stepConfig.label.split(' ')[0]}
                </p>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`absolute mt-4 ml-8 h-0.5 w-full max-w-[calc(25%-2rem)] ${isDone ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
