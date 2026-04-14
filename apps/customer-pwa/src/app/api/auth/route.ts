import { type NextRequest, NextResponse } from 'next/server'
import { setCustomerTokenCookies, clearCustomerTokens } from '@epager/auth/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// POST /api/auth — OTP request
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; otp?: string; requestId?: string }

  if (body.phone && !body.otp) {
    // Step 1: request OTP
    const res = await fetch(`${apiUrl}/customer/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: body.phone, requestId: body.requestId }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed to send OTP' }, { status: res.status })
    return NextResponse.json({ ok: true })
  }

  if (body.phone && body.otp) {
    // Step 2: verify OTP
    const res = await fetch(`${apiUrl}/customer/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: body.phone, otp: body.otp, requestId: body.requestId }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    await setCustomerTokenCookies(data.accessToken, data.refreshToken)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function DELETE() {
  await clearCustomerTokens()
  return NextResponse.json({ ok: true })
}
