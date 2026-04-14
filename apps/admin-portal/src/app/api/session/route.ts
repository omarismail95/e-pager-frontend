import { NextResponse } from 'next/server'
import { getStaffToken } from '@epager/auth/server'

export async function GET() {
  const token = await getStaffToken()
  return NextResponse.json({ token: token ?? null })
}
