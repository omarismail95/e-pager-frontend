/**
 * POST /api/auth
 * Proxies staff login to Identity & Access Service and sets httpOnly cookie.
 *
 * Body: { email: string, password: string }
 */
import { type NextRequest, NextResponse } from 'next/server'
import { setStaffTokenCookie } from '@epager/auth/server'

export async function POST(request: NextRequest) {
  const body = await request.json() as { email: string; password: string }
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080'

  const upstream = await fetch(`${apiUrl}/api/staff/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const error = await upstream.text()
    return NextResponse.json({ error }, { status: upstream.status })
  }

  const data = await upstream.json() as { accessToken: string }
  await setStaffTokenCookie(data.accessToken)

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/auth
 * Clears the staff token cookie.
 */
export async function DELETE() {
  const { clearStaffToken } = await import('@epager/auth/server')
  await clearStaffToken()
  return NextResponse.json({ ok: true })
}
