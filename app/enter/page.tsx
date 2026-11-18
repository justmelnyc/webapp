import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthView } from '@/components/auth/auth-view'
import { LoginForm } from '@/components/auth/login-form'
import { getSession } from '@/lib/session'
import { getPageHeader } from '@/services/content'

export const metadata: Metadata = { title: 'Log in' }

interface Props {
  searchParams: Promise<{ next?: string }>
}

const EnterPage = async ({ searchParams }: Props) => {
  const [{ next }, session, header] = await Promise.all([
    searchParams,
    getSession(),
    getPageHeader('AUTHENTICATION').catch(() => null),
  ])
  if (session) redirect('/')
  return (
    <AuthView header={header}>
      <h1>Welcome back.</h1>
      <LoginForm next={next} />
    </AuthView>
  )
}

export default EnterPage
