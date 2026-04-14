import { ShopsTable } from '@/components/shops/shops-table'

export const metadata = { title: 'Shops — E-Pager Staff' }

export default function ShopsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Shops</h1>
        <p className="text-sm text-muted-foreground">Manage your restaurant locations</p>
      </div>
      <ShopsTable />
    </div>
  )
}
