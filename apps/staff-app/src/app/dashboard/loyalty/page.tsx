import { ProgramsTable } from '@/components/loyalty/programs-table'

export const metadata = { title: 'Loyalty — E-Pager Staff' }

export default function LoyaltyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Loyalty Programs</h1>
        <p className="text-sm text-muted-foreground">Create and manage customer loyalty programs</p>
      </div>
      <ProgramsTable />
    </div>
  )
}
