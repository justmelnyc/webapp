/** @jest-environment node */
/* eslint-disable */
const { build } = require('./seed')
const inv = require('./invitations')

const fresh = () => {
  const db = build()
  let n = 5000
  const nextId = () => String(++n)
  inv.seedInvitations(db, nextId)
  return { db, nextId }
}

describe('invitations', () => {
  it('seeds once, with accepted and pending invites for ada', () => {
    const { db, nextId } = fresh()
    expect(inv.seedInvitations(db, nextId)).toBe(0)
    const list = inv.invitationsOf(db, '1')
    expect(list.filter(i => i.acceptedAt)).toHaveLength(2)
    expect(list.filter(i => !i.acceptedAt).length).toBeGreaterThanOrEqual(3)
    expect(inv.byCode(db, 'welcome1ad').email).toBe('sam.rivera@example.com')
  })

  it('parses comma and space separated emails, dropping junk and duplicates', () => {
    expect(inv.parseEmails('a@b.co, a@b.co  c@d.io nope')).toEqual(['a@b.co', 'c@d.io'])
    expect(inv.parseEmails(['x@y.com', 'bad'])).toEqual(['x@y.com'])
  })

  it('creates new invitations and re-sends pending ones with the same code', () => {
    const { db, nextId } = fresh()
    const [created] = inv.invite(db, nextId, '1', 'new@person.com')
    expect(created.code).toHaveLength(10)
    const before = inv.byCode(db, 'welcome1ad')
    const [again] = inv.invite(db, nextId, '1', ['sam.rivera@example.com'], new Date('2026-12-01T00:00:00Z'))
    expect(again).toBe(before)
    expect(again.createdAt).toBe('2026-12-01T00:00:00.000Z')
    expect(db.invitations.filter(i => i.email === 'sam.rivera@example.com')).toHaveLength(1)
  })

  it('skips accepted invitations and people who already have an account', () => {
    const { db, nextId } = fresh()
    expect(inv.invite(db, nextId, '1', 'grace@example.com')).toEqual([])
    expect(inv.invite(db, nextId, '1', 'theo@example.com')).toEqual([])
  })

  it('revokes only your own pending invitation', () => {
    const { db } = fresh()
    const pending = inv.byCode(db, 'welcome1ad')
    expect(inv.revoke(db, '2', pending.id)).toBe(false)
    expect(inv.revoke(db, '1', inv.byCode(db, 'k3Mq9ZtW2x').id)).toBe(false)
    expect(inv.revoke(db, '1', pending.id)).toBe(true)
    expect(inv.byCode(db, 'welcome1ad')).toBeUndefined()
  })

  it('marks an invitation accepted', () => {
    const { db } = fresh()
    const pending = inv.byCode(db, 'h5Tz2LqY6e')
    inv.accept(db, pending, '9', new Date('2026-11-20T00:00:00Z'))
    expect(pending.acceptedById).toBe('9')
    expect(pending.acceptedAt).toBe('2026-11-20T00:00:00.000Z')
  })
})
