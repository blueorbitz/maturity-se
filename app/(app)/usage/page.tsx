import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMyUsageLogs } from '@/app/actions/usage'
import { UsageLog } from '@/components/usage-log'

export default async function UsagePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const logs = await getMyUsageLogs({ offset: 0, limit: 20, dateRange: 'all' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <UsageLog initialLogs={logs} />
    </div>
  )
}
