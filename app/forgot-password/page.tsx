import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthView } from '@/components/auth/auth-view'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { API_ORIGIN } from '@/lib/env'
import { getSession } from '@/lib/session'
import { getPageHeader } from '@/services/content'

export const metadata: Metadata = { title: 'Forgot password' }

const ForgotPasswordPage = async () => {
  const [session, header] = await Promise.all([getSession(), getPageHeader('AUTHENTICATION').catch(() => null)])
  if (session) redirect('/')
  return (
    <AuthView header={header} className="isForgotPassword">
      <h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- the original's 20px emoji image */}
        <img className="inline-block" src={`${API_ORIGIN}/images/emoji/hot_shit.png`} alt="ello" title="It really does" width={20} height={20} />
        Shit happens.
      </h1>
      <ForgotPasswordForm />
    </AuthView>
  )
}

export default ForgotPasswordPage
