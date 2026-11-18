/**
 * @jest-environment node
 */
/* eslint-disable */
jest.mock('./db', () => {
  const db = {
    seq: 500,
    users: ['ada', 'grace', 'mara'].map((username, i) => ({ id: String(i + 1), username })),
    posts: [{ id: 'p1', token: 'old', authorId: '2', createdAt: '2026-01-01T00:00:00.000Z', regions: [] }],
    follows: [{ followerId: '1', followeeId: '2' }],
  }
  return { db, save: jest.fn(), nextId: () => String(++db.seq), userById: id => db.users.find(u => u.id === String(id)) }
})

const { db } = require('./db')
const { simulate, MAX } = require('./new-posts')

const NOW = Date.parse('2026-03-01T12:00:00.000Z')

describe('simulate', () => {
  it('posts as people the viewer follows, newest on top and dated just now', () => {
    const created = simulate('1', 2, NOW)
    expect(created).toHaveLength(2)
    expect(created.every(c => c.by === 'grace')).toBe(true)
    expect(db.posts).toHaveLength(3)
    expect(db.posts[0].createdAt > db.posts[1].createdAt || db.posts[0].createdAt === db.posts[1].createdAt).toBe(true)
    expect(db.posts.slice(0, 2).every(p => Date.parse(p.createdAt) <= NOW && Date.parse(p.createdAt) > NOW - 5000)).toBe(true)
    expect(db.posts[0].regions[0]).toMatchObject({ kind: 'text' })
  })

  it('falls back to anyone else when the viewer follows nobody', () => {
    const created = simulate('3', 1, NOW)
    expect(['ada', 'grace']).toContain(created[0].by)
  })

  it('clamps the count and defaults to something', () => {
    expect(simulate('1', 9999, NOW)).toHaveLength(MAX)
    expect(simulate('1', 'abc', NOW)).toHaveLength(1)
    expect(simulate('1', undefined, NOW)).toHaveLength(2)
  })

  it('gives every post its own token', () => {
    simulate('1', 5, NOW)
    expect(new Set(db.posts.map(p => p.token)).size).toBe(db.posts.length)
  })
})
