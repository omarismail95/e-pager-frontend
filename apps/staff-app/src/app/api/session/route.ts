import { NextResponse } from 'next/server'
import { getStaffToken } from '@epager/auth/server'

/** Returns the current staff JWT so client components can use it as a Bearer token. */
export async function GET() {
  const token = await getStaffToken()
  return NextResponse.json({ token: token ?? null })
}
