import { NextResponse } from 'next/server'
import { getCustomerToken } from '@epager/auth/server'

export async function GET() {
  const token = await getCustomerToken()
  return NextResponse.json({ token: token ?? null })
}
