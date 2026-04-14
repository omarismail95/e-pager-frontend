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
import { Plus, MoreHorizontal, Power, PowerOff, ChevronRight } from 'lucide-react'
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
import { createLoyaltyClient } from '@epager/api-client/loyalty'
import { CreateProgramModal } from './create-program-modal'

export interface LoyaltyProgram {
  id: string
  code: string
  name: string
  description?: string
  provider: string
  applyMode: string
  status: string
  enrollmentCount?: number
  createdAt: string
}

const PROVIDER_COLORS: Record<string, string> = {
  POINTS: 'bg-blue-100 text-blue-800',
  STAMPS: 'bg-purple-100 text-purple-800',
  CASHBACK: 'bg-green-100 text-green-800',
}

const col = createColumnHelper<LoyaltyProgram>()

export function ProgramsTable() {
  const [createOpen, setCreateOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const client = createLoyaltyClient()
  const router = useRouter()

  const { data: programs = [], isLoading } = useQuery<LoyaltyProgram[]>({
    queryKey: ['loyalty-programs'],
    queryFn: async () => {
      const res = await client.GET('/api/loyalty/programs' as never, {
        params: { query: { size: 100 } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: LoyaltyProgram[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as LoyaltyProgram[]) : [])
    },
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ id, enable }: { id: string; enable: boolean }) => {
      const path = enable ? '/api/loyalty/programs/{programId}/enable' : '/api/loyalty/programs/{programId}/disable'
      await client.POST(path as never, {
        params: { path: { programId: id } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] }),
  })

  const columns = [
    col.accessor('code', {
      header: 'Code',
      cell: ({ getValue }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{getValue()}</code>,
    }),
    col.accessor('name', {
      header: 'Name',
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    col.accessor('provider', {
      header: 'Type',
      cell: ({ getValue }) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_COLORS[getValue()] ?? ''}`}>
          {getValue()}
        </span>
      ),
    }),
    col.accessor('applyMode', {
      header: 'Apply Mode',
      cell: ({ getValue }) => <Badge variant="outline" className="text-xs">{getValue()}</Badge>,
    }),
    col.accessor('enrollmentCount', {
      header: 'Enrollments',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ?? 0}</span>,
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'ACTIVE' ? 'success' : 'secondary'}>
          {getValue()}
        </Badge>
      ),
    }),
    col.display({
      id: 'actions',
      cell: ({ row }) => {
        const p = row.original
        const isActive = p.status === 'ACTIVE'
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => router.push(`/dashboard/loyalty/${p.id}`)}
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
                {isActive ? (
                  <DropdownMenuItem
                    className="text-amber-600 focus:text-amber-600"
                    onClick={() => void toggleStatus.mutate({ id: p.id, enable: false })}
                  >
                    <PowerOff className="mr-2 h-4 w-4" />
                    Disable
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => void toggleStatus.mutate({ id: p.id, enable: true })}>
                    <Power className="mr-2 h-4 w-4" />
                    Enable
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.code.toLowerCase().includes(filter.toLowerCase()),
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
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search programs..."
          className="max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Program
        </Button>
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
              Array.from({ length: 4 }).map((_, i) => (
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
                  No loyalty programs found.
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

      <CreateProgramModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] })}
      />
    </>
  )
}
