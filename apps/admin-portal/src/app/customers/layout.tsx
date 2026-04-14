import { getStaffSession } from '@epager/auth/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/sidebar'
import { AdminHeader } from '@/components/layout/header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
