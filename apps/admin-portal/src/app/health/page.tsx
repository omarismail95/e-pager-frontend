import { ServiceHealthGrid } from '@/components/health/service-health-grid'

export const metadata = { title: 'Service Health — E-Pager Admin' }

export default function HealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Service Health</h1>
        <p className="text-sm text-muted-foreground">Live status of all 14 microservices — auto-refreshes every 30s</p>
      </div>
      <ServiceHealthGrid />
    </div>
  )
}
