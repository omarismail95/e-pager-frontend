import { redirect } from 'next/navigation'
import { getCustomerSession } from '@epager/auth/server'

export default async function RootPage() {
  const session = await getCustomerSession()
  if (session) redirect('/orders')
  redirect('/auth')
}
