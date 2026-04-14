'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Store, Users, BarChart3 } from 'lucide-react'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Skeleton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@epager/ui'
import { createAdminClient } from '@epager/api-client/admin'
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge'
import type { Tenant } from '@/components/tenants/tenants-table'

interface TenantDetail extends Tenant {
  description?: string
  settings?: Record<string, unknown>
}

interface PageProps {
  params: Promise<{ tenantId: string }>
}

const PLANS = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']

export default function TenantDetailPage({ params }: PageProps) {
  const { tenantId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const client = createAdminClient()

  const { data: tenant, isLoading } = useQuery<TenantDetail>({
    queryKey: ['admin-tenant', tenantId],
    queryFn: async () => {
      const res = await client.GET('/admin/tenants/{tenantId}' as never, {
        params: { path: { tenantId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return res.data as TenantDetail
    },
  })

  const suspend = useMutation({
    mutationFn: async () => {
      await client.POST('/admin/tenants/{tenantId}/suspend' as never, {
        params: { path: { tenantId } } as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-tenant', tenantId] })
      void queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
    },
  })

  const activate = useMutation({
    mutationFn: async () => {
      await client.POST('/admin/tenants/{tenantId}/activate' as never, {
        params: { path: { tenantId } } as never,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-tenant', tenantId] })
      void queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
    },
  })

  const changePlan = useMutation({
    mutationFn: async (plan: string) => {
      await client.POST('/admin/tenants/{tenantId}/change-plan' as never, {
        params: { path: { tenantId } } as never,
        body: { plan } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-tenant', tenantId] }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Tenant not found</p>
        <Button variant="outline" onClick={() => router.push('/tenants')}>Back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/tenants')}>
          <ArrowLeft className="h-4 w-4" />
          Tenants
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <TenantStatusBadge status={tenant.status} />
          <Badge variant="outline">{tenant.plan}</Badge>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shops</p>
              <p className="text-xl font-bold">{tenant.shopCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate max-w-[140px]">{tenant.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Admin Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {tenant.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={() => void suspend.mutate()}
              disabled={suspend.isPending}
            >
              {suspend.isPending ? 'Suspending…' : 'Suspend Tenant'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void activate.mutate()}
              disabled={activate.isPending}
            >
              {activate.isPending ? 'Activating…' : 'Activate Tenant'}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Change Plan:</span>
            <Select
              value={tenant.plan}
              onValueChange={(v) => void changePlan.mutate(v)}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
