import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Log in' }

interface Props {
  searchParams: Promise<{ next?: string }>
}

const EnterPage = async ({ searchParams }: Props) => {
  const [{ next }, session] = await Promise.all([searchParams, getSession()])
  if (session) redirect('/')
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-16">
      <div>
        <h1 className="text-4xl font-light">Welcome back.</h1>
        <p className="text-slate mt-2 text-sm">
          Mock accounts: <code>ada@example.com</code>, <code>grace</code>, <code>mara</code>… with any password of 8+
          characters.
        </p>
      </div>
      <LoginForm next={next} />
    </div>
  )
}

export default EnterPage
