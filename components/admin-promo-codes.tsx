'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createPromoCode, getPromoCodes, deletePromoCode } from '@/app/actions/admin'
import { Plus, Trash2, Ticket } from 'lucide-react'

interface PromoCodeRow {
  id: string
  code: string
  generations: number
  expiresAt: Date
  createdAt: Date
  redemptionCount: number | string
}

interface AdminPromoCodesProps {
  initialCodes: PromoCodeRow[]
}

export function AdminPromoCodes({ initialCodes }: AdminPromoCodesProps) {
  const [codes, setCodes] = useState<PromoCodeRow[]>(initialCodes)
  const [code, setCode] = useState('')
  const [generations, setGenerations] = useState(10)
  const [expiresAt, setExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleCreate() {
    if (!code.trim() || !expiresAt) return

    setCreating(true)
    setMessage(null)

    const result = await createPromoCode(code, generations, new Date(expiresAt))

    setCreating(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Promo code created.' })
      setCode('')
      setGenerations(10)
      setExpiresAt('')
      // Refresh list
      const updated = await getPromoCodes()
      setCodes(updated)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deletePromoCode(id)
    setDeleting(null)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setCodes(codes.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Promo Code
          </CardTitle>
          <CardDescription>
            Create a new promo code that grants users free AI generations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="promo-code">Code</Label>
              <Input
                id="promo-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER2025"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="generations">Generations</Label>
              <Input
                id="generations"
                type="number"
                min={1}
                value={generations}
                onChange={(e) => setGenerations(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expires-at">Expires At</Label>
              <Input
                id="expires-at"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 text-sm px-3 py-2 rounded-lg ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button onClick={handleCreate} disabled={creating || !code.trim() || !expiresAt} className="mt-4">
            {creating ? 'Creating...' : 'Create Code'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Existing Codes
          </CardTitle>
          <CardDescription>
            All promo codes with redemption counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No promo codes created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 font-medium text-muted-foreground">Code</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Generations</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Expires</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Redeemed</th>
                    <th className="text-right py-2 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-border/30">
                      <td className="py-2 font-mono">{c.code}</td>
                      <td className="py-2">{c.generations}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">{Number(c.redemptionCount)}</td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deleting === c.id ? '...' : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
