'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardFooter } from '@epager/ui'
import { OtpInput } from '@/components/auth/otp-input'

export default function VerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [requestId, setRequestId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('otp_phone')
    const storedRequestId = sessionStorage.getItem('otp_request_id')
    if (!storedPhone) {
      router.replace('/auth')
      return
    }
    setPhone(storedPhone)
    setRequestId(storedRequestId ?? '')
  }, [router])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  async function handleVerify() {
    if (otp.length < 6) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, requestId }),
      })
      if (!res.ok) {
        setError('Invalid code. Please try again.')
        setOtp('')
        return
      }
      sessionStorage.removeItem('otp_phone')
      sessionStorage.removeItem('otp_request_id')
      router.push('/orders')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; otpRequestId?: string }
      const newRequestId = data.otpRequestId ?? ''
      sessionStorage.setItem('otp_request_id', newRequestId)
      setRequestId(newRequestId)
    }
    setResendCountdown(60)
    setOtp('')
    setError(null)
  }

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) void handleVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Verify Your Number</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>

      <div className="w-full max-w-xs">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            {error && (
              <div className="w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            )}
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => void handleVerify()}
              disabled={otp.length < 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={resendCountdown > 0}
              onClick={() => void handleResend()}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
