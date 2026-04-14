'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShopStore {
  selectedShopId: string | null
  selectedTenantId: string | null
  setSelectedShop: (shopId: string, tenantId: string) => void
  clearSelectedShop: () => void
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      selectedShopId: null,
      selectedTenantId: null,
      setSelectedShop: (shopId, tenantId) => set({ selectedShopId: shopId, selectedTenantId: tenantId }),
      clearSelectedShop: () => set({ selectedShopId: null, selectedTenantId: null }),
    }),
    { name: 'epager-shop-selection' },
  ),
)
