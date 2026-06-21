'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function PostHogIdentify({ userId, email }: { userId: string; email?: string | null }) {
  useEffect(() => {
    if (!userId || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    posthog.identify(userId, { email })
  }, [userId, email])

  return null
}
