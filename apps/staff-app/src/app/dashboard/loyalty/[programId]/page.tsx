'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@epager/ui'
import { createLoyaltyClient } from '@epager/api-client/loyalty'
import type { LoyaltyProgram } from '@/components/loyalty/programs-table'

interface Enrollment {
  id: string
  customerId: string
  customerPhone?: string
  pointsBalance: number
  tier?: string
  enrolledAt: string
}

interface PageProps {
  params: Promise<{ programId: string }>
}

export default function ProgramDetailPage({ params }: PageProps) {
  const { programId } = use(params)
  const router = useRouter()
  const client = createLoyaltyClient()

  const { data: program, isLoading } = useQuery<LoyaltyProgram>({
    queryKey: ['loyalty-program', programId],
    queryFn: async () => {
      const res = await client.GET('/api/loyalty/programs/{programId}' as never, {
        params: { path: { programId } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return res.data as LoyaltyProgram
    },
  })

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ['loyalty-enrollments', programId],
    queryFn: async () => {
      const res = await client.GET('/api/loyalty/programs/{programId}/enrollments' as never, {
        params: { path: { programId }, query: { size: 50 } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: Enrollment[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as Enrollment[]) : [])
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-muted-foreground">Program not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/loyalty')}>Back to Loyalty</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push('/dashboard/loyalty')}>
          <ArrowLeft className="h-4 w-4" />
          Programs
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">{program.code}</code>
          <Badge variant={program.status === 'ACTIVE' ? 'success' : 'secondary'}>{program.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="mt-1 text-lg font-semibold capitalize">{program.provider.toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Apply Mode</p>
            <p className="mt-1 text-lg font-semibold capitalize">{program.applyMode.replace('_', ' ').toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Enrollments</p>
            <p className="mt-1 text-lg font-semibold">{program.enrollmentCount ?? enrollments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Enrolled Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No enrollments yet</p>
          ) : (
            <div className="divide-y">
              {enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{e.customerPhone ?? e.customerId}</p>
                    <p className="text-xs text-muted-foreground">
                      Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{e.pointsBalance} pts</p>
                    {e.tier && <Badge variant="outline" className="text-xs">{e.tier}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
