import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export const metadata = { title: 'Analytics — E-Pager Staff' }

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Order metrics and performance insights</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
