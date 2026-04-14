import { getStaffSession } from '@epager/auth/server'
import { redirect } from 'next/navigation'
import { AdminLoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Admin Login — E-Pager' }

export default async function LoginPage() {
  const session = await getStaffSession()
  if (session) redirect('/tenants')

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">E-Pager Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Super admin access only</p>
        </div>
        <AdminLoginForm callbackUrl="/tenants" />
      </div>
    </div>
  )
}
