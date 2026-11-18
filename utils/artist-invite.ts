import type { ArtistInvite, ArtistInviteStatus, SubmissionKey } from '@/types/artist-invite'

export const statusText = (status: ArtistInviteStatus): string => {
  switch (status) {
    case 'closed':
      return 'Invite Closed'
    case 'open':
      return 'Open For Submissions'
    case 'preview':
      return 'Preview'
    case 'selecting':
      return 'Selections In Progress'
    case 'upcoming':
      return 'Upcoming'
  }
}

export const secondsRemaining = (closedAt: string, now: number = Date.now()): number =>
  Math.max(0, Math.floor(Date.parse(closedAt) / 1000) - Math.floor(now / 1000))

const pad = (n: number): string => String(n).padStart(2, '0')

/** "12 Days Remaining" beyond two days, then "HH:MM:SS Remaining" (the original's ArtistInviteCountDown). */
export const countDown = (seconds: number): string => {
  const days = seconds / 86400
  if (days > 2) return `${Math.floor(days)} Days Remaining`
  const hours = Math.floor(seconds / 3600)
  return `${pad(hours)}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)} Remaining`
}

export const dateRangeText = (status: ArtistInviteStatus, openedAt: string, closedAt: string, now?: number): string => {
  switch (status) {
    case 'open':
      return countDown(secondsRemaining(closedAt, now))
    case 'selecting':
      return 'Hold Tight'
    case 'closed':
      return new Date(openedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    default:
      return ''
  }
}

/** Where a card links: the invite page, or the partner's site for invites with a redirect. */
export const inviteHref = (invite: Pick<ArtistInvite, 'slug' | 'redirectUrl'>): string =>
  invite.redirectUrl || `/invites/${invite.slug}`

/** The stream links the API offers for this viewer, in the original's fixed order. */
export const streamKeys = (links: ArtistInvite['links']): SubmissionKey[] => {
  const keys: SubmissionKey[] = ['unapprovedSubmissions', 'approvedSubmissions', 'selectedSubmissions', 'declinedSubmissions']
  return keys.filter((key) => links?.[key])
}

/** Curators see all four streams (tabs); everyone else sees one or two. */
export const isCuratorView = (links: ArtistInvite['links']): boolean => Object.keys(links ?? {}).length >= 3

export const submissionTabLabel = (label: string): string => label.replace('Approved', 'Accepted')
export const actionLabel = (label: string): string => label.replace('Approved', 'Accepted').replace('Approve', 'Accept')

/** `/api/v2/...?x=1` or a full URL -> path and query only, so the API origin stays configurable. */
export const streamPath = (href: string): string => {
  try {
    const url = new URL(href, 'http://placeholder.invalid')
    return `${url.pathname}${url.search}`
  } catch {
    return href
  }
}
