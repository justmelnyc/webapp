'use client'

import { ErrorState5xx, ErrorView } from '@/components/post-detail/error-state'

/** The original's error view has no retry button, so the route's `error` / `reset` props go unused. */
const ErrorPage = () => (
  <ErrorView>
    <ErrorState5xx />
  </ErrorView>
)

export default ErrorPage
