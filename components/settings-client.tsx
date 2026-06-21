"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LlmPreferenceToggle } from "@/components/llm-preference-toggle"
import { LlmKeyForm } from "@/components/llm-key-form"
import { PromoCodeForm } from "@/components/promo-code-form"

interface SettingsClientProps {
  defaultLlmMode: "own_key" | "platform_credits"
  hasLlmKey: boolean
  creditsRemaining: number
  llmKeyExisting: {
    provider: string
    keyHint: string | null
    model: string | null
    apiFormat: string
    awsRegion: string | null
    awsAccessKeyId: string | null
  } | null
}

export function SettingsClient({
  defaultLlmMode,
  hasLlmKey,
  creditsRemaining: initialCredits,
  llmKeyExisting,
}: SettingsClientProps) {
  const router = useRouter()
  const [creditsRemaining, setCreditsRemaining] = useState(initialCredits)

  function handleCreditsUpdated(newRemaining: number) {
    setCreditsRemaining(newRemaining)
    router.refresh()
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full space-y-6">
      <LlmPreferenceToggle
        currentMode={defaultLlmMode}
        hasLlmKey={hasLlmKey}
        creditsRemaining={creditsRemaining}
      />
      <div id="llm-provider">
        <LlmKeyForm
          existing={
            llmKeyExisting
              ? {
                  provider: llmKeyExisting.provider,
                  keyHint: llmKeyExisting.keyHint,
                  model: llmKeyExisting.model,
                  apiFormat: llmKeyExisting.apiFormat,
                  awsRegion: llmKeyExisting.awsRegion,
                  awsAccessKeyId: llmKeyExisting.awsAccessKeyId,
                }
              : null
          }
        />
      </div>
      <PromoCodeForm
        creditsRemaining={creditsRemaining}
        onRedeemed={handleCreditsUpdated}
      />
    </div>
  )
}
