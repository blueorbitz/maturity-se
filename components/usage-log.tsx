'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMyUsageLogs, type UsageLog } from '@/app/actions/usage'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

interface UsageLogProps {
  initialLogs: UsageLog[]
}

export function UsageLog({ initialLogs }: UsageLogProps) {
  const [logs, setLogs] = useState<UsageLog[]>(initialLogs)
  const [offset, setOffset] = useState(initialLogs.length)
  const [hasMore, setHasMore] = useState(initialLogs.length >= 20)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('all')

  const fetchLogs = useCallback(
    async (newOffset: number, range: '7d' | '30d' | 'all', append: boolean) => {
      setLoading(true)
      try {
        const result = await getMyUsageLogs({
          offset: newOffset,
          limit: 20,
          dateRange: range,
        })
        setLogs((prev) => (append ? [...prev, ...result] : result))
        setOffset(newOffset + result.length)
        setHasMore(result.length >= 20)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  async function handleLoadMore() {
    await fetchLogs(offset, dateRange, true)
  }

  async function handleFilterChange(value: string | null) {
    if (!value) return
    const newRange = value as '7d' | '30d' | 'all'
    setDateRange(newRange)
    setLogs([])
    setOffset(0)
    setHasMore(true)
    await fetchLogs(0, newRange, false)
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Usage History</CardTitle>
            <Select value={dateRange} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">No usage logs yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 font-medium text-muted-foreground">Feature</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Model</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/30">
                      <td className="py-2">{log.feature}</td>
                      <td className="py-2">{log.provider}</td>
                      <td className="py-2">
                        {log.provider === 'platform' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          log.model ?? '—'
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
