/**
 * @jest-environment node
 */
/* eslint-disable */
// The watch kinds and "you started following", seeded once from the db.
jest.mock('./db', () => {
  const db = { seq: 100, users: [], posts: [], comments: [], loves: [], watches: [], follows: [], notificationReads: {} }
  return { db, nextId: () => String(++db.seq), postById: id => db.posts.find(p => p.id === String(id)) }
})

const { db } = require('./db')
const watches = require('./notification-watches')

const NOW = Date.parse('2026-02-01T00:00:00.000Z')

beforeEach(() => {
  db.users = ['ada', 'grace', 'mara', 'theo'].map((username, i) => ({ id: String(i + 1), username }))
  db.posts = [
    { id: 'p1', authorId: '2', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'p2', authorId: '3', createdAt: '2026-01-02T00:00:00.000Z' },
    { id: 'r1', authorId: '1', createdAt: '2026-01-03T00:00:00.000Z', repostOfId: 'p1' },
  ]
  db.comments = []
  db.watches = []
  db.follows = [{ followerId: '1', followeeId: '2' }, { followerId: '1', followeeId: '3' }, { followerId: '1', followeeId: '4' }]
  db.notificationReads = { 1: new Date(NOW - 3600000).toISOString() }
})

const seeded = () => {
  const added = []
  watches.seed(r => added.push(r), NOW, () => 0.4)
  return added
}

describe('notification-watches seed', () => {
  it('tells a user about their two newest follows', () => {
    const followed = seeded().filter(n => n.userId === '1' && n.kind === 'new_followed_user_post')
    expect(followed.map(n => n.subjectUserId)).toEqual(['3', '4'])
  })

  it('adds a comment on a watched post and a watch_comment notification for it', () => {
    const n = seeded().find(r => r.userId === '1' && r.kind === 'watch_comment_notification')
    const comment = db.comments.find(c => c.id === n.commentId)
    expect(comment.postId).toBe(n.postId)
    expect(comment.authorId).not.toBe('1')
    expect(db.watches).toContainEqual({ userId: '1', postId: n.postId })
  })

  it('tells the reposter and the original author when someone watches the repost', () => {
    const added = seeded()
    const onRepost = added.find(r => r.kind === 'watch_on_repost_notification')
    const onOriginal = added.find(r => r.kind === 'watch_on_original_post_notification')
    expect(onRepost).toMatchObject({ userId: '1', postId: 'r1' })
    expect(onOriginal).toMatchObject({ userId: '2', postId: 'r1' })
    expect(['1', '2']).not.toContain(onRepost.actorId)
  })

  it('never dates a notification after the user last read them', () => {
    seeded().filter(n => n.userId === '1').forEach((n) => {
      expect(Date.parse(n.createdAt)).toBeLessThanOrEqual(Date.parse(db.notificationReads[1]))
    })
  })
})
