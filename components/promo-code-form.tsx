'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { redeemPromoCode } from '@/app/actions/promo-codes'
import { Ticket } from 'lucide-react'

interface PromoCodeFormProps {
  creditsRemaining: number
  onRedeemed?: (newRemaining: number) => void
}

export function PromoCodeForm({ creditsRemaining, onRedeemed }: PromoCodeFormProps) {
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleRedeem() {
    if (!code.trim()) return

    setRedeeming(true)
    setMessage(null)

    const result = await redeemPromoCode(code)

    setRedeeming(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result.success && result.remaining !== undefined) {
      setMessage({
        type: 'success',
        text: `Redeemed! ${result.generationsGranted} generations granted. You have ${result.remaining} remaining.`,
      })
      setCode('')
      onRedeemed?.(result.remaining)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Promo Code
        </CardTitle>
        <CardDescription>
          Redeem a promo code to get free AI template generations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRedeem()
              }}
            />
          </div>
          <Button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
          >
            {redeeming ? 'Redeeming...' : 'Redeem'}
          </Button>
        </div>

        {message && (
          <div
            className={`mt-3 text-sm px-3 py-2 rounded-lg ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Platform generations remaining: <span className="font-medium text-foreground">{creditsRemaining}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
