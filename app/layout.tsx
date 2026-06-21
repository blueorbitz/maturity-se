import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { PostHogProvider } from '@/components/posthog-provider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'MaturitySE — Software Engineering Maturity Assessments',
  description:
    'Create, distribute, and review maturity assessment questionnaires for software engineering domains including DevSecOps, SRE, Platform Engineering, and more.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
