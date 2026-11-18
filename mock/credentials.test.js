/** @jest-environment node */
const { availability, credentialErrors, usernameAvailable } = require('./credentials')
const { hashPassword } = require('./passwords')
const { exportFor, removeUser } = require('./export')

const make = () => ({
  users: [
    { id: '1', username: 'ada', email: 'ada@example.com', passwordHash: hashPassword('secret-pass') },
    { id: '2', username: 'Grace', email: 'grace@example.com' },
  ],
  posts: [{ id: 'p1', authorId: '2', regions: [] }, { id: 'p2', authorId: '1', regions: [] }],
  comments: [{ id: 'c1', postId: 'p1', authorId: '1' }, { id: 'c2', postId: 'p2', authorId: '2' }],
  loves: [{ userId: '1', postId: 'p1' }, { userId: '2', postId: 'p2' }],
  watches: [{ userId: '1', postId: 'p1' }],
  follows: [{ followerId: '1', followeeId: '2' }, { followerId: '2', followeeId: '1' }],
})

describe('availability', () => {
  it('reports taken usernames case-insensitively with suggestions', () => {
    const { availability: a } = availability(make(), { username: 'grace' }, '1')
    expect(a.username).toBe(false)
    expect(a.suggestions.username).toEqual(['grace1', 'grace2', 'grace3'])
  })

  it('treats your own username and a free one as available', () => {
    const db = make()
    expect(availability(db, { username: 'ada' }, '1').availability.username).toBe(true)
    expect(availability(db, { username: 'newbie' }).availability.username).toBe(true)
  })

  it('rejects reserved and malformed usernames', () => {
    expect(usernameAvailable(make(), 'admin')).toBe(false)
    expect(usernameAvailable(make(), 'has space')).toBe(false)
  })

  it('checks emails', () => {
    const db = make()
    expect(availability(db, { email: 'grace@example.com' }, '1').availability.email).toBe(false)
    expect(availability(db, { email: 'ada@example.com' }, '1').availability.email).toBe(true)
    expect(availability(db, { email: 'nope' }).availability.email).toBe(false)
  })
})

describe('credentialErrors', () => {
  const db = make()
  const me = db.users[0]

  it('ignores updates that touch no credentials', () => {
    expect(credentialErrors(db, me, { username: 'ada', email: 'ada@example.com' })).toBeNull()
  })

  it('needs the current password to change a credential', () => {
    expect(credentialErrors(db, me, { password: 'brand-new-1', current_password: 'nope' })).toEqual({
      current_password: 'is incorrect',
    })
    expect(credentialErrors(db, me, { password: 'brand-new-1', current_password: 'secret-pass' })).toBeNull()
  })

  it('enforces uniqueness and password length', () => {
    const attrs = credentialErrors(db, me, {
      username: 'GRACE', email: 'grace@example.com', password: 'short', current_password: 'secret-pass',
    })
    expect(attrs).toEqual({
      username: 'has already been taken',
      email: 'has already been taken',
      password: 'must be between 8 and 128 characters',
    })
  })
})

describe('export and deletion', () => {
  it('exports a user without their password hash', () => {
    const out = exportFor(make(), make().users[0], new Date('2026-01-01'))
    expect(out.profile.passwordHash).toBeUndefined()
    expect(out.posts.map((p) => p.id)).toEqual(['p2'])
    expect(out.following).toEqual(['2'])
    expect(out.exportedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('removes a user and everything attached', () => {
    const db = make()
    removeUser(db, db.users[1])
    expect(db.users.map((u) => u.id)).toEqual(['1'])
    expect(db.posts).toEqual([{ id: 'p2', authorId: '1', regions: [] }])
    expect(db.comments).toEqual([])
    expect(db.loves).toEqual([])
    expect(db.watches).toEqual([])
    expect(db.follows).toEqual([])
  })
})
