import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { AuthDialog, AuthView } from '@/components/auth/auth-view'
import { JoinForm } from '@/components/auth/join-form'
import { getSession } from '@/lib/session'
import { getPageHeader } from '@/services/content'
import { getInvitationEmail } from '@/services/invitations'

export const metadata: Metadata = { title: 'Sign up' }

interface Props {
  params: Promise<{ invitationCode?: string[] }>
}

/** `/join` and `/join/:invitationCode` (the code prefills the email, like the original's `getInviteEmail`). */
const JoinPage = async ({ params }: Props) => {
  const { invitationCode: segments = [] } = await params
  if (segments.length > 1) notFound()
  const code = segments[0] ? decodeURIComponent(segments[0]) : null
  // The original only loads the hero photo for exactly `/join` (selectPageHeaderKind), not `/join/:code`.
  const [session, header, invitationEmail] = await Promise.all([
    getSession(),
    code ? Promise.resolve(null) : getPageHeader('AUTHENTICATION').catch(() => null),
    code ? getInvitationEmail(code) : Promise.resolve(null),
  ])
  if (session) redirect('/')
  const form = <JoinForm invitationCode={code} invitationEmail={invitationEmail} />
  return code ? <AuthDialog>{form}</AuthDialog> : <AuthView header={header}>{form}</AuthView>
}

export default JoinPage
