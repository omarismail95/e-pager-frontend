import { TenantsTable } from '@/components/tenants/tenants-table'

export const metadata = { title: 'Tenants — E-Pager Admin' }

export default function TenantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-sm text-muted-foreground">Manage all platform tenants</p>
      </div>
      <TenantsTable />
    </div>
  )
}
