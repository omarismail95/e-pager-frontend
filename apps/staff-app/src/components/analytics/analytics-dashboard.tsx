'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@epager/ui'
import { createAnalyticsClient } from '@epager/api-client/analytics'
import { useShopStore } from '@/store/shop-store'
import { OrdersChart } from './orders-chart'
import { StatusFunnel } from './status-funnel'

interface AnalyticsDashboardData {
  totalOrders?: number
  completedOrders?: number
  cancelledOrders?: number
  avgOrdersPerDay?: number
  ordersPerDay?: Array<{ date: string; count: number }>
  ordersByStatus?: Array<{ status: string; count: number }>
}

export function AnalyticsDashboard() {
  const { selectedShopId } = useShopStore()
  const [range, setRange] = useState('7')
  const client = createAnalyticsClient()

  const { data, isLoading } = useQuery<AnalyticsDashboardData>({
    queryKey: ['analytics-dashboard', selectedShopId, range],
    enabled: !!selectedShopId,
    queryFn: async () => {
      const res = await client.GET('/analytics/shops/{shopId}/dashboard' as never, {
        params: {
          path: { shopId: selectedShopId! },
          query: { days: Number(range) },
        } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (res.data ?? {}) as AnalyticsDashboardData
    },
  })

  if (!selectedShopId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Select a shop from the header to view analytics
      </div>
    )
  }

  const ordersPerDay = (data?.ordersPerDay ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    orders: d.count,
  }))

  const ordersByStatus = data?.ordersByStatus ?? []

  const kpis = [
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: data?.completedOrders ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Cancelled',
      value: data?.cancelledOrders ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Avg / Day',
      value: data?.avgOrdersPerDay?.toFixed(1) ?? '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Last {range} days</p>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">
                  {isLoading ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-muted" /> : value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <OrdersChart data={ordersPerDay} isLoading={isLoading} />
        <StatusFunnel data={ordersByStatus} isLoading={isLoading} />
      </div>
    </div>
  )
}
