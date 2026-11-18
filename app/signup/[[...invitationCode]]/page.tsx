import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

interface Props {
  params: Promise<{ invitationCode?: string[] }>
}

/** The original's `signup(/:invitationCode)` route only forwards to `/join(/:invitationCode)`. */
const SignupPage = async ({ params }: Props) => {
  const { invitationCode: segments = [] } = await params
  if (segments.length > 1) notFound()
  if (await getSession()) redirect('/')
  const [code] = segments
  return redirect(code ? `/join/${code}` : '/join')
}

export default SignupPage
