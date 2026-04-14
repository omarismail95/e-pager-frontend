'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Phone } from 'lucide-react'
import { Button, Card, CardContent, Input, Badge } from '@epager/ui'
import { createAdminClient } from '@epager/api-client/admin'

interface CustomerResult {
  id: string
  phone: string
  name?: string
  createdAt: string
  orderCount?: number
  lastOrderAt?: string
}

export default function CustomersPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const client = createAdminClient()

  const { data: results, isLoading, isFetching } = useQuery<CustomerResult[]>({
    queryKey: ['admin-customers', submitted],
    enabled: submitted.length >= 3,
    queryFn: async () => {
      const res = await client.GET('/admin/customers/search' as never, {
        params: { query: { phone: submitted } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      return (Array.isArray(res.data) ? res.data : [(res.data as CustomerResult)].filter(Boolean)) as CustomerResult[]
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Search</h1>
        <p className="text-sm text-muted-foreground">Search customers by phone number</p>
      </div>

      <div className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="+971 50 000 0000"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSubmitted(query) }}
          />
        </div>
        <Button onClick={() => setSubmitted(query)} disabled={query.length < 3}>
          <Search className="mr-1 h-4 w-4" />
          Search
        </Button>
      </div>

      {submitted && (
        <div className="space-y-3 max-w-2xl">
          {(isLoading || isFetching) ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))
          ) : !results || results.length === 0 ? (
            <p className="text-muted-foreground text-sm">No customers found for &quot;{submitted}&quot;</p>
          ) : (
            results.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{c.name ?? 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{c.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{c.orderCount ?? 0} orders</Badge>
                    {c.lastOrderAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last order: {new Date(c.lastOrderAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
