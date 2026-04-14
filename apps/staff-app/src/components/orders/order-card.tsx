'use client'

import { formatDistanceToNow } from 'date-fns'
import { Badge, Button, Card, CardContent } from '@epager/ui'
import { ChevronRight, X } from 'lucide-react'

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED'

export interface Order {
  id: string
  displayNumber: string
  status: OrderStatus
  channel: string
  customerId?: string
  createdAt: string
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'COMPLETED',
}

const CHANNEL_LABELS: Record<string, string> = {
  WALK_IN: 'Walk-in',
  ONLINE: 'Online',
  PHONE: 'Phone',
}

interface OrderCardProps {
  order: Order
  onAdvance: (status: OrderStatus) => void
}

export function OrderCard({ order, onAdvance }: OrderCardProps) {
  const nextStatus = NEXT_STATUS[order.status]
  const elapsed = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })

  return (
    <Card className="group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold">#{order.displayNumber}</p>
            <p className="text-xs text-muted-foreground">{elapsed}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {CHANNEL_LABELS[order.channel] ?? order.channel}
          </Badge>
        </div>

        {order.customerId && (
          <p className="mt-1 text-xs text-muted-foreground">Customer linked</p>
        )}

        <div className="mt-3 flex gap-1.5">
          {nextStatus && (
            <Button
              size="sm"
              variant="default"
              className="h-7 flex-1 text-xs"
              onClick={() => onAdvance(nextStatus)}
            >
              <ChevronRight className="mr-1 h-3 w-3" />
              {nextStatus === 'IN_PROGRESS' ? 'Start' : nextStatus === 'READY' ? 'Mark Ready' : 'Complete'}
            </Button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onAdvance('CANCELLED')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
