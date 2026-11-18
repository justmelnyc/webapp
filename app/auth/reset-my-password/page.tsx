import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthView } from '@/components/auth/auth-view'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { getSession } from '@/lib/session'
import { getPageHeader } from '@/services/content'

export const metadata: Metadata = { title: 'Set new password' }

interface Props {
  searchParams: Promise<{ reset_password_token?: string }>
}

const ResetPasswordPage = async ({ searchParams }: Props) => {
  const [{ reset_password_token: token }, session, header] = await Promise.all([
    searchParams,
    getSession(),
    getPageHeader('AUTHENTICATION').catch(() => null),
  ])
  if (session) redirect('/')
  return (
    <AuthView header={header} className="isForgotPassword">
      <h1>Set new password</h1>
      <ResetPasswordForm token={token ?? ''} />
    </AuthView>
  )
}

export default ResetPasswordPage
