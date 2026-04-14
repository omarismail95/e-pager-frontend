'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { Search, MoreHorizontal, ChevronRight, ArrowUpDown } from 'lucide-react'
import {
  Button,
  Badge,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@epager/ui'
import { createAdminClient } from '@epager/api-client/admin'
import { TenantStatusBadge } from './tenant-status-badge'

export interface Tenant {
  id: string
  name: string
  email: string
  plan: string
  status: string
  shopCount?: number
  createdAt: string
}

const col = createColumnHelper<Tenant>()

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  STARTER: 'bg-blue-100 text-blue-800',
  PROFESSIONAL: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-amber-100 text-amber-800',
}

export function TenantsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const client = createAdminClient()
  const router = useRouter()

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const res = await client.GET('/admin/tenants' as never, {
        params: { query: { size: 100 } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: Tenant[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as Tenant[]) : [])
    },
  })

  const suspend = useMutation({
    mutationFn: async (id: string) => {
      await client.POST('/admin/tenants/{tenantId}/suspend' as never, {
        params: { path: { tenantId: id } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-tenants'] }),
  })

  const activate = useMutation({
    mutationFn: async (id: string) => {
      await client.POST('/admin/tenants/{tenantId}/activate' as never, {
        params: { path: { tenantId: id } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-tenants'] }),
  })

  const columns = [
    col.accessor('name', {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    col.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
    }),
    col.accessor('plan', {
      header: 'Plan',
      cell: ({ getValue }) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[getValue()] ?? ''}`}>
          {getValue()}
        </span>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => <TenantStatusBadge status={getValue()} />,
    }),
    col.accessor('shopCount', {
      header: 'Shops',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ?? '—'}</span>,
    }),
    col.accessor('createdAt', {
      header: 'Created',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    col.display({
      id: 'actions',
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => router.push(`/tenants/${t.id}`)}
            >
              View
              <ChevronRight className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {t.status === 'ACTIVE' ? (
                  <DropdownMenuItem
                    className="text-amber-600 focus:text-amber-600"
                    onClick={() => void suspend.mutate(t.id)}
                  >
                    Suspend
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => void activate.mutate(t.id)}>
                    Activate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tenants..."
          className="pl-8"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  No tenants found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b transition-colors hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{tenants.length} tenants total</p>
    </div>
  )
}
