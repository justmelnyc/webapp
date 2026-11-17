'use client'

import { Button } from '@/components/ui/button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

const ErrorPage = ({ error, reset }: Props) => (
  <div className="py-24 text-center">
    <h1 className="text-4xl font-light">Something went wrong</h1>
    <p className="text-slate mx-auto mt-3 max-w-lg">{error.message}</p>
    <Button onClick={reset} className="mt-6">
      Try again
    </Button>
  </div>
)

export default ErrorPage
