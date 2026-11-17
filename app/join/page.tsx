import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sign up' }

const JoinPage = () => (
  <div className="mx-auto max-w-md py-16">
    <h1 className="text-4xl font-light">Sign up</h1>
    <p className="text-slate mt-4">
      Signup isn’t part of the mock API. Use one of the seeded accounts instead.
    </p>
    <Link href="/enter" className="mt-6 inline-block underline">
      Go to log in
    </Link>
  </div>
)

export default JoinPage
