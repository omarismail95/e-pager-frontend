import { Badge } from '@epager/ui'

type ShopStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | string

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  SUSPENDED: { label: 'Suspended', variant: 'warning' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
}

export function ShopStatusBadge({ status }: { status: ShopStatus }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
