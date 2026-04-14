'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Activity, ScrollText, Users, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@epager/ui'
import { useState } from 'react'

const navItems = [
  { href: '/tenants', label: 'Tenants', icon: Building2 },
  { href: '/health', label: 'Health', icon: Activity },
  { href: '/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/customers', label: 'Customers', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-primary">Admin Portal</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2 pt-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                : 'text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
        aria-label={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
