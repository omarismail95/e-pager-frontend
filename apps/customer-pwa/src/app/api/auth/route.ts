import { type NextRequest, NextResponse } from 'next/server'
import { setCustomerTokenCookies, clearCustomerTokens } from '@epager/auth/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// POST /api/auth — OTP request or verify
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    phone?: string
    otp?: string
    requestId?: string   // server-returned otpRequestId from step 1
    name?: string
  }

  if (body.phone && !body.otp) {
    // Step 1: request OTP — backend expects { phoneE164 }
    const res = await fetch(`${apiUrl}/customer/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneE164: body.phone }),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send OTP', detail: err }, { status: res.status })
    }
    // Return server-generated otpRequestId to the client for use in step 2
    const data = (await res.json()) as { otpRequestId: string; expiresInSeconds: number; debugOtpCode?: string }
    return NextResponse.json({ ok: true, otpRequestId: data.otpRequestId, debugOtpCode: data.debugOtpCode ?? null })
  }

  if (body.phone && body.otp && body.requestId) {
    // Step 2: verify OTP — backend expects { otpRequestId, otpCode, platform, name? }
    const res = await fetch(`${apiUrl}/customer/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otpRequestId: body.requestId,
        otpCode: body.otp,
        platform: 'WEB',
        name: body.name || 'Customer',
      }),
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }
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
