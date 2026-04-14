import { AuditLogTable } from '@/components/audit/audit-log-table'

export const metadata = { title: 'Audit Log — E-Pager Admin' }

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">All platform-level actions with filterable history</p>
      </div>
      <AuditLogTable />
    </div>
  )
}
