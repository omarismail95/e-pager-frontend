import { QuotaMeters } from '@/components/settings/quota-meters'

export const metadata = { title: 'Settings — E-Pager Staff' }

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Tenant configuration and plan usage</p>
      </div>
      <div className="max-w-2xl">
        <QuotaMeters />
      </div>
    </div>
  )
}
