const ai = require('./artist-invites')

const users = [{ id: '1', username: 'ada' }, { id: '2', username: 'grace' }]
const posts = Array.from({ length: 60 }, (_, i) => ({ id: `p${i}`, authorId: '1' }))
const counter = () => { let n = 0; return () => String(++n) }
const built = () => ai.buildArtistInvites({ users, posts, now: Date.parse('2026-11-18T12:00:00Z'), nextId: counter() })

describe('artist invites mock', () => {
  it('seeds open, upcoming, selecting and closed invites once', () => {
    const { invites } = built()
    expect(new Set(invites.map(i => i.status))).toEqual(new Set(['open', 'upcoming', 'selecting', 'closed']))
    const db = { users, posts }
    expect(ai.seedArtistInvites(db, counter())).toBe(invites.length)
    expect(ai.seedArtistInvites(db, counter())).toBe(0)
  })

  it('never submits the same post twice to one invite', () => {
    const { submissions } = built()
    const keys = submissions.map(s => `${s.inviteId}:${s.postId}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('shows public viewers only accepted work, and closed invites also the selections', () => {
    const { invites } = built()
    const bySlug = slug => invites.find(i => i.slug === slug)
    expect(ai.visibleKeys(bySlug('neon-nights'), null)).toEqual(['approved'])
    expect(ai.visibleKeys(bySlug('summer-zine'), '2')).toEqual(['approved', 'selected'])
    expect(ai.visibleKeys(bySlug('after-the-rain'), '1')).toEqual([])
    expect(ai.visibleKeys(bySlug('neon-nights'), '1')).toHaveLength(4)
  })

  it('lists selected submissions in the approved stream too', () => {
    const { invites, submissions } = built()
    const db = { artistInviteSubmissions: submissions }
    const invite = invites.find(i => i.slug === 'neon-nights')
    expect(ai.streamOf(db, invite, 'approved')).toHaveLength(34)
    expect(ai.streamOf(db, invite, 'selected')).toHaveLength(4)
  })

  it('applies admin actions only where the status allows them', () => {
    const sub = { id: '1', status: 'unapproved' }
    expect(Object.keys(ai.actionsFor(sub))).toEqual(['approve', 'decline'])
    expect(ai.applyAction(sub, 'select')).toBeNull()
    expect(ai.applyAction(sub, 'approve').status).toBe('approved')
    expect(ai.applyAction(sub, 'select').status).toBe('selected')
    expect(ai.applyAction(sub, 'unselect').status).toBe('approved')
  })

  it('paginates', () => {
    const page = ai.paginate(Array.from({ length: 30 }, (_, i) => i), 2)
    expect(page.items).toHaveLength(5)
    expect(page.totalPages).toBe(2)
  })

  it('creates unapproved submissions for open invites and refuses the rest', () => {
    const { invites, submissions } = built()
    const db = { artistInviteSubmissions: [...submissions] }
    const bySlug = slug => invites.find(i => i.slug === slug)
    const next = counter()
    const open = bySlug('tiny-worlds')
    const { submission } = ai.createSubmission(db, next, open, { id: 'new-post' })
    expect(submission).toMatchObject({ inviteId: open.id, postId: 'new-post', status: 'unapproved' })
    expect(ai.createSubmission(db, next, open, { id: 'new-post' }).error).toMatch(/already/)
    expect(ai.createSubmission(db, next, bySlug('summer-zine'), { id: 'p' }).error).toMatch(/not open/)
    expect(ai.createSubmission(db, next, bySlug('partner-open-call'), { id: 'p' }).error).toMatch(/not open/)
    expect(ai.submitError(null)).toMatch(/not found/)
  })

  it('moves a new submission through the curator streams and counts, and drops it with its post', () => {
    const { invites, submissions } = built()
    const db = { artistInviteSubmissions: [...submissions] }
    const invite = invites.find(i => i.slug === 'neon-nights')
    const before = ai.countsFor(db, invite)
    const { submission } = ai.createSubmission(db, counter(), invite, { id: 'new-post' })
    expect(ai.countsFor(db, invite)).toEqual({ ...before, unapproved: before.unapproved + 1 })
    expect(ai.streamOf(db, invite, 'approved').some(s => s.id === submission.id)).toBe(false)
    ai.applyAction(submission, 'approve')
    ai.applyAction(submission, 'select')
    expect(ai.countsFor(db, invite)).toEqual({ unapproved: before.unapproved, approved: before.approved + 1, selected: before.selected + 1, declined: before.declined })
    ai.dropPostSubmissions(db, 'new-post')
    expect(ai.countsFor(db, invite)).toEqual(before)
  })
})
