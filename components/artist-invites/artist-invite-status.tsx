'use client'

import { useEffect, useState } from 'react'
import type { ArtistInviteStatus } from '@/types/artist-invite'
import { cn } from '@/utils/cn'
import { dateRangeText, statusText } from '@/utils/artist-invite'
import status from './artist-invite-status.module.css'
import styles from './artist-invite.module.css'

/** The coloured status line: plain text on the detail page, with a coloured bullet on cards. */
export const InviteStatus = ({ status: value, bullet = false }: { status: ArtistInviteStatus; bullet?: boolean }) => (
  <p className={cn(bullet ? status.bullet : status.text, status[value])}>{statusText(value)}</p>
)

interface DateRangeProps {
  status: ArtistInviteStatus
  openedAt: string
  closedAt: string
}

/** "11 Days Remaining" (a live HH:MM:SS clock inside the last two days), "Hold Tight" or the month it opened. */
export const InviteDateRange = ({ status: value, openedAt, closedAt }: DateRangeProps) => {
  const [now, setNow] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (value !== 'open') return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [value])
  return (
    <p className={styles.dateRange} suppressHydrationWarning>
      {dateRangeText(value, openedAt, closedAt, now)}
    </p>
  )
}
