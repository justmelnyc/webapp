'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * The original's `ArtistInviteContainer.componentWillMount` for an invite hosted elsewhere: the partner's
 * site opens in a new tab and this tab goes back to /invites.
 */
export const InviteRedirect = ({ url }: { url: string }) => {
  const router = useRouter()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return // dev strict mode runs effects twice
    done.current = true
    window.open(url, '_blank', 'noopener')
    router.replace('/invites')
  }, [url, router])
  return null
}
