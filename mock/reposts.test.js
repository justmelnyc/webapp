/**
 * @jest-environment node
 */
/* eslint-disable */
jest.mock('./db', () => {
  const db = {
    seq: 100,
    users: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }],
    posts: [
      { id: '10', authorId: '2', createdAt: '2026-11-01T00:00:00Z', regions: [{ kind: 'text', data: '<p>a</p>' }] },
      { id: '11', authorId: '1', createdAt: '2026-11-01T01:00:00Z', regions: [{ kind: 'text', data: '<p>b</p>' }] },
    ],
  }
  return { db, save: jest.fn(), nextId: () => String(++db.seq), postById: id => db.posts.find(p => p.id === String(id)) }
})

jest.mock('./notifications', () => ({ sync: jest.fn() }))

const { db } = require('./db')
const notifications = require('./notifications')
const reposts = require('./reposts')

describe('reposts', () => {
  it('creates a repost that counts against the original and flags the viewer', () => {
    const source = db.posts.find(p => p.id === '10')
    const post = reposts.createRepost(source, '1', [{ kind: 'text', data: '<p>so good</p>' }])
    expect(post).toMatchObject({ authorId: '1', repostOfId: '10' })
    expect(reposts.repostCount('10')).toBe(1)
    expect(reposts.viewerRepost('10', '1')).toBe(post)
    expect(reposts.viewerRepost('10', '3')).toBeNull()
    expect(notifications.sync).toHaveBeenCalled() // the original's author gets a notification
  })

  it('refuses a second repost, a repost of your own post and an unknown post', () => {
    const source = db.posts.find(p => p.id === '10')
    expect(reposts.createRepost(source, '1')).toBeNull()
    expect(reposts.createRepost(db.posts.find(p => p.id === '11'), '1')).toBeNull()
    expect(reposts.createRepost(undefined, '1')).toBeNull()
  })

  it('reposting a repost points at the original', () => {
    const repost = reposts.repostsOf('10')[0]
    const again = reposts.createRepost(repost, '3')
    expect(again.repostOfId).toBe('10')
    expect(reposts.repostCount('10')).toBe(2)
  })

  it('removes only the viewer\'s repost', () => {
    expect(reposts.removeRepost('10', '1')).toBe(true)
    expect(reposts.removeRepost('10', '1')).toBe(false)
    expect(reposts.repostCount('10')).toBe(1)
  })

  it('drops reposts whose original was deleted', () => {
    db.posts = db.posts.filter(p => p.id !== '10')
    reposts.dropOrphans()
    expect(db.posts.some(p => p.repostOfId)).toBe(false)
  })

  it('seeds reposts once', () => {
    db.posts.unshift({ id: '20', authorId: '2', createdAt: '2026-11-02T00:00:00Z', regions: [] })
    expect(reposts.seedReposts()).toBe(true)
    expect(reposts.seedReposts()).toBe(false)
  })
})
