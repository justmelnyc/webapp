import { actionLabel, countDown, dateRangeText, inviteHref, isCuratorView, secondsRemaining, statusText, streamPath } from './artist-invite'

const NOW = Date.parse('2026-11-18T12:00:00Z')

describe('artist invite helpers', () => {
  it('names every status', () => {
    expect(statusText('open')).toBe('Open For Submissions')
    expect(statusText('selecting')).toBe('Selections In Progress')
    expect(statusText('closed')).toBe('Invite Closed')
    expect(statusText('upcoming')).toBe('Upcoming')
  })

  it('counts days, then hours', () => {
    expect(countDown(3 * 86400 + 5)).toBe('3 Days Remaining')
    expect(countDown(2 * 86400 + 1)).toBe('2 Days Remaining')
    expect(countDown(2 * 86400)).toBe('48:00:00 Remaining')
    expect(countDown(3725)).toBe('01:02:05 Remaining')
    expect(countDown(0)).toBe('00:00:00 Remaining')
  })

  it('never counts below zero', () => {
    expect(secondsRemaining('2026-11-18T11:00:00Z', NOW)).toBe(0)
    expect(secondsRemaining('2026-11-18T13:00:00Z', NOW)).toBe(3600)
  })

  it('describes the date range per status', () => {
    expect(dateRangeText('open', '2026-11-01T00:00:00Z', '2026-12-18T12:00:00Z', NOW)).toBe('30 Days Remaining')
    expect(dateRangeText('selecting', '', '')).toBe('Hold Tight')
    expect(dateRangeText('upcoming', '', '')).toBe('')
    expect(dateRangeText('closed', '2026-07-21T12:00:00Z', '')).toBe('July 2026')
  })

  it('links to the partner site when there is a redirect', () => {
    expect(inviteHref({ slug: 'a', redirectUrl: null })).toBe('/invites/a')
    expect(inviteHref({ slug: 'a', redirectUrl: 'https://x.test/y' })).toBe('https://x.test/y')
  })

  it('tells curators from visitors by the number of streams', () => {
    const link = { type: 't', href: '/h', label: 'L' }
    expect(isCuratorView({ approvedSubmissions: link, selectedSubmissions: link })).toBe(false)
    expect(isCuratorView({ a: link, b: link, c: link, d: link })).toBe(true)
    expect(isCuratorView(null)).toBe(false)
  })

  it('relabels approve as accept', () => {
    expect(actionLabel('Approve')).toBe('Accept')
    expect(actionLabel('Approved')).toBe('Accepted')
    // the original's replace is case sensitive, so "Unapprove" keeps its label
    expect(actionLabel('Unapprove')).toBe('Unapprove')
  })

  it('keeps only path and query of a stream href', () => {
    expect(streamPath('http://localhost:6660/api/v2/artist_invites/1/approved_submissions?status=approved')).toBe(
      '/api/v2/artist_invites/1/approved_submissions?status=approved',
    )
    expect(streamPath('/api/v2/x?a=1')).toBe('/api/v2/x?a=1')
  })
})
