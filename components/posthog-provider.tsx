'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY || initialized) return
  initialized = true
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
  })
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastUrl = useRef<string>('')

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (!pathname || !initialized) return
    let url = pathname
    const qs = searchParams?.toString()
    if (qs) url += `?${qs}`
    if (url === lastUrl.current) return
    lastUrl.current = url
    posthog.capture('$pageview', { $current_url: url, $pathname: pathname })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
