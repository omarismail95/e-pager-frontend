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
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Plus, Search, ArrowUpDown, MoreHorizontal, Settings2, Trash2 } from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'
import { ShopStatusBadge } from './shop-status-badge'
import { CreateShopModal } from './create-shop-modal'

export interface Shop {
  id: string
  name: string
  address: string
  phone?: string
  status: string
  tenantId: string
  timezone: string
  createdAt: string
}

const col = createColumnHelper<Shop>()

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
  col.accessor('address', {
    header: 'Address',
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
  }),
  col.accessor('phone', {
    header: 'Phone',
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ?? '—'}</span>,
  }),
  col.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <ShopStatusBadge status={getValue()} />,
  }),
  col.accessor('timezone', {
    header: 'Timezone',
    cell: ({ getValue }) => <Badge variant="outline" className="text-xs">{getValue()}</Badge>,
  }),
  col.display({
    id: 'actions',
    cell: ({ row }) => <ShopRowActions shop={row.original} />,
  }),
]

function ShopRowActions({ shop }: { shop: Shop }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const client = createShopClient()

  const suspend = useMutation({
    mutationFn: async () => {
      await client.POST('/api/shops/{shopId}/suspend' as never, {
        params: { path: { shopId: shop.id } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['shops'] }),
  })

  const activate = useMutation({
    mutationFn: async () => {
      await client.POST('/api/shops/{shopId}/activate' as never, {
        params: { path: { shopId: shop.id } } as never,
      })
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['shops'] }),
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/shops/${shop.id}`)}>
          <Settings2 className="mr-2 h-4 w-4" />
          Manage
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {shop.status === 'ACTIVE' ? (
          <DropdownMenuItem
            className="text-amber-600 focus:text-amber-600"
            onClick={() => void suspend.mutate()}
          >
            Suspend
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => void activate.mutate()}>Activate</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ShopsTable() {
  const [createOpen, setCreateOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const queryClient = useQueryClient()
  const client = createShopClient()

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await client.GET('/api/shops' as never, {
        params: { query: { size: 100 } } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: Shop[] } | undefined
      return d?.content ?? []
    },
  })

  const table = useReactTable({
    data: shops,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            className="pl-8"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Shop
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No shops found. Create your first shop to get started.
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

      <p className="text-xs text-muted-foreground">{shops.length} shops total</p>

      <CreateShopModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ['shops'] })}
      />
    </>
  )
}
