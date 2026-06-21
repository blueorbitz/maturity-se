'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function PostHogIdentify({ userId, email }: { userId: string; email?: string | null }) {
  useEffect(() => {
    if (userId && posthog.__loaded) {
      posthog.identify(userId, { email })
    }
  }, [userId, email])

  return null
}
