'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, Star } from 'lucide-react'
import { Button, Card, CardContent, Input, Label, Skeleton } from '@epager/ui'
import { createCustomerIdentityClient } from '@epager/api-client/customer-identity'

interface CustomerProfile {
  id: string
  phone: string
  name?: string
  email?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const client = createCustomerIdentityClient()
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: profile, isLoading } = useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const res = await client.GET('/customer/profile' as never, {} as never)
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const p = res.data as unknown as CustomerProfile
      setName(p.name ?? '')
      return p
    },
  })

  const updateProfile = useMutation({
    mutationFn: async () => {
      await client.PATCH('/customer/profile' as never, {
        body: { name } as never,
      })
    },
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/auth')
    router.refresh()
  }

  function maskPhone(phone: string) {
    if (phone.length < 6) return phone
    return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4)
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="sticky top-0 z-10 border-b bg-card px-4 py-3">
        <h1 className="text-lg font-bold">Profile</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {profile?.name ? profile.name[0]?.toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-medium">{profile?.name ?? 'No name set'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.phone ? maskPhone(profile.phone) : ''}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => updateProfile.mutate()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => void handleLogout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 border-t bg-card px-4 py-2">
        <div className="flex justify-around">
          <Link href="/orders" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Star className="h-5 w-5" />
            <span className="text-xs">Loyalty</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 text-primary">
            <span className="text-lg">👤</span>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
