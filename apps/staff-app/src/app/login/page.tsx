import { getStaffSession } from '@epager/auth/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Sign In — E-Pager Staff' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await getStaffSession()
  if (session) redirect('/dashboard/orders')

  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">E-Pager Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <LoginForm callbackUrl={callbackUrl ?? '/dashboard/orders'} />
      </div>
    </div>
  )
}
