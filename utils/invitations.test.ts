import { hasEmails, splitEmails, toInvitees } from './invitations'

describe('invitation helpers', () => {
  it('splits on commas and whitespace', () => {
    expect(splitEmails('a@b.co, c@d.io\ne@f.com')).toEqual(['a@b.co', 'c@d.io', 'e@f.com'])
  })

  it('needs more than separators to count as input', () => {
    expect(hasEmails('')).toBe(false)
    expect(hasEmails(' , ,\n')).toBe(false)
    expect(hasEmails('a@b.co')).toBe(true)
  })

  it('attaches the accepting user to accepted invitations only', () => {
    const user = { id: '2', username: 'grace' }
    const result = toInvitees(
      [
        { id: '10', email: 'grace@example.com', acceptedAt: '2026-11-01T00:00:00Z', links: { acceptedBy: { id: '2' } } },
        { id: '11', email: 'sam@example.com' },
        { id: '12', email: 'ghost@example.com', acceptedAt: '2026-11-02T00:00:00Z', links: { acceptedBy: { id: '99' } } },
      ],
      [user],
    )
    expect(result.map((i) => i.user)).toEqual([user, null, null])
  })
})
