'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter } from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@epager/ui'
import { createAdminClient } from '@epager/api-client/admin'

interface AuditEntry {
  id: string
  tenantId?: string
  actorId: string
  actorEmail?: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: string
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  SUSPEND: 'bg-amber-100 text-amber-800',
  ACTIVATE: 'bg-purple-100 text-purple-800',
  LOGIN: 'bg-gray-100 text-gray-800',
}

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.includes(k))
  return key ? (ACTION_COLORS[key] ?? '') : 'bg-gray-100 text-gray-800'
}

export function AuditLogTable() {
  const [actionFilter, setActionFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const client = createAdminClient()

  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit-log', actionFilter],
    queryFn: async () => {
      const res = await client.GET('/admin/audit/actions' as never, {
        params: {
          query: {
            size: 100,
            action: actionFilter !== 'ALL' ? actionFilter : undefined,
          },
        } as never,
      })
      if ((res as { error?: unknown }).error) throw (res as { error: unknown }).error
      const d = res.data as { content?: AuditEntry[] } | undefined
      return d?.content ?? (Array.isArray(res.data) ? (res.data as AuditEntry[]) : [])
    },
  })

  const filtered = entries.filter(
    (e) =>
      e.actorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.resourceType?.toLowerCase().includes(search.toLowerCase()),
  )

  function downloadCsv() {
    const headers = ['Date', 'Actor', 'Action', 'Resource Type', 'Resource ID', 'Details']
    const rows = filtered.map((e) => [
      new Date(e.createdAt).toISOString(),
      e.actorEmail ?? e.actorId,
      e.action,
      e.resourceType ?? '',
      e.resourceId ?? '',
      e.details ?? '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by actor or action..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="SUSPEND">Suspend</SelectItem>
              <SelectItem value="ACTIVATE">Activate</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="ml-auto gap-1" onClick={downloadCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No audit entries found.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{entry.actorEmail ?? entry.actorId}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.resourceType && (
                      <span className="text-xs text-muted-foreground">
                        {entry.resourceType}
                        {entry.resourceId && <> · {entry.resourceId.slice(0, 8)}…</>}
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                    {entry.details ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} entries</p>
    </div>
  )
}
