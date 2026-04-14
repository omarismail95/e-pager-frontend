'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Store, ChevronDown } from 'lucide-react'
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@epager/ui'
import { createShopClient } from '@epager/api-client/shop'
import { useShopStore } from '@/store/shop-store'

interface Shop {
  id: string
  name: string
  tenantId: string
  status?: string
}

export function ShopSelector() {
  const { selectedShopId, setSelectedShop } = useShopStore()
  const client = createShopClient()

  const { data: shops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await client.GET('/api/shops' as never, {
        params: { query: { size: 100 } } as never,
      })
      if (res.error) throw res.error
      const d = res.data as { content?: Shop[] } | undefined
      return d?.content ?? []
    },
    staleTime: 60_000,
  })

  // Auto-select first shop if none selected
  useEffect(() => {
    if (!selectedShopId && shops && shops.length > 0) {
      const first = shops[0]
      if (first) setSelectedShop(first.id, first.tenantId)
    }
  }, [shops, selectedShopId, setSelectedShop])

  const selectedShop = shops?.find((s) => s.id === selectedShopId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
          <Store className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">
            {selectedShop?.name ?? 'Select shop'}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your Shops</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shops?.length === 0 && (
          <DropdownMenuItem disabled>No shops found</DropdownMenuItem>
        )}
        {shops?.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => setSelectedShop(shop.id, shop.tenantId)}
            className={shop.id === selectedShopId ? 'bg-accent' : ''}
          >
            <Store className="mr-2 h-4 w-4" />
            <span className="truncate">{shop.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
