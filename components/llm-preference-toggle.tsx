'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateDefaultLlmMode } from '@/app/actions/llm-keys'
import { Zap, Key, Check } from 'lucide-react'

interface LlmPreferenceToggleProps {
  currentMode: 'own_key' | 'platform_credits'
  hasLlmKey: boolean
  creditsRemaining: number
  onModeChanged?: (mode: 'own_key' | 'platform_credits') => void
}

export function LlmPreferenceToggle({
  currentMode,
  hasLlmKey,
  creditsRemaining,
  onModeChanged,
}: LlmPreferenceToggleProps) {
  const [mode, setMode] = useState<'own_key' | 'platform_credits'>(currentMode)
  const [saving, setSaving] = useState(false)

  const canUseOwnKey = hasLlmKey
  const canUsePlatformCredits = creditsRemaining > 0

  async function handleModeChange(newMode: 'own_key' | 'platform_credits') {
    setSaving(true)
    const result = await updateDefaultLlmMode(newMode)
    setSaving(false)
    if (result.success) {
      setMode(newMode)
      onModeChanged?.(newMode)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          LLM Preference
        </CardTitle>
        <CardDescription>
          Choose how to power AI template generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant={mode === 'own_key' ? 'default' : 'outline'}
            className="w-full justify-start gap-3 h-auto py-3"
            disabled={!canUseOwnKey || saving}
            onClick={() => handleModeChange('own_key')}
          >
            {mode === 'own_key' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <Key className="h-4 w-4 shrink-0" />
            )}
            <div className="text-left flex-1">
              <div className="font-medium">Use my own API key</div>
              {!canUseOwnKey && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  No key configured. Add one in LLM Provider section.
                </div>
              )}
            </div>
          </Button>

          <Button
            variant={mode === 'platform_credits' ? 'default' : 'outline'}
            className="w-full justify-start gap-3 h-auto py-3"
            disabled={!canUsePlatformCredits || saving}
            onClick={() => handleModeChange('platform_credits')}
          >
            {mode === 'platform_credits' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <Zap className="h-4 w-4 shrink-0" />
            )}
            <div className="text-left flex-1">
              <div className="font-medium">
                Use platform credits
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  ({creditsRemaining} remaining)
                </span>
              </div>
              {!canUsePlatformCredits && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  No credits remaining. Redeem a promo code below.
                </div>
              )}
            </div>
          </Button>
        </div>

        {!canUseOwnKey && !canUsePlatformCredits && (
          <p className="mt-3 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
            You have no LLM key and no platform credits. Add a key or redeem a code to generate templates.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
