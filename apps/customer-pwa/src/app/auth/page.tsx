'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'
import { Button, Card, CardContent, CardFooter, Input, Label } from '@epager/ui'

export default function AuthPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) {
        setError('Failed to send OTP. Please try again.')
        return
      }
      // Store phone + name + server-returned otpRequestId for verify step
      const data = (await res.json()) as { ok: boolean; otpRequestId?: string; debugOtpCode?: string | null }
      sessionStorage.setItem('otp_phone', phone)
      sessionStorage.setItem('otp_name', name.trim() || 'Customer')
      sessionStorage.setItem('otp_request_id', data.otpRequestId ?? '')
      if (data.debugOtpCode) {
        sessionStorage.setItem('otp_debug_code', data.debugOtpCode)
      } else {
        sessionStorage.removeItem('otp_debug_code')
      }
      router.push('/auth/verify')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Phone className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">E-Pager</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your details to continue</p>
      </div>

      <div className="w-full max-w-xs">
        <Card>
          <form onSubmit={(e) => void handleSubmit(e)}>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="+971 50 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || phone.length < 8 || !name.trim()}>
                {loading ? 'Sending OTP...' : 'Send Code'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
