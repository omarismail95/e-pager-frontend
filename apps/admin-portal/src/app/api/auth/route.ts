import { NextRequest, NextResponse } from 'next/server'
import { setStaffTokenCookie } from '@epager/auth/server'

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email: string; password: string }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

  const res = await fetch(`${apiUrl}/api/staff/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const data = (await res.json()) as { accessToken?: string; token?: string }
  const token = data.accessToken ?? data.token

  if (!token) {
    return NextResponse.json({ error: 'No token received' }, { status: 500 })
  }

  await setStaffTokenCookie(token)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const { clearStaffToken } = await import('@epager/auth/server')
  await clearStaffToken()
  return NextResponse.json({ ok: true })
}
