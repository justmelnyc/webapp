import 'server-only'
import { redirect } from 'next/navigation'
import { getSession, type SessionClaims } from '@/lib/session'

/** Use at the top of pages that need a signed-in user; sends everyone else to log in. */
export const requireSession = async (returnTo: string): Promise<SessionClaims> => {
  const session = await getSession()
  if (!session) redirect(`/enter?next=${encodeURIComponent(returnTo)}`)
  return session
}
