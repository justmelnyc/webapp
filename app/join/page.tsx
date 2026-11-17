import type { Metadata } from 'next'
import { AuthView } from '@/components/auth/auth-view'
import { JoinForm } from '@/components/auth/join-form'
import { getPageHeader } from '@/services/content'

export const metadata: Metadata = { title: 'Sign up' }

const JoinPage = async () => {
  const header = await getPageHeader('AUTHENTICATION').catch(() => null)
  return (
    <AuthView header={header}>
      <JoinForm />
    </AuthView>
  )
}

export default JoinPage
