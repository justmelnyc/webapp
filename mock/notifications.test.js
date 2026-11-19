/**
 * @jest-environment node
 */
/* eslint-disable */
// Notification logic of the mock API, against a small in-memory db (the real one persists to disk).
jest.mock('./db', () => {
  const db = {
    seq: 5000,
    users: ['ada', 'grace', 'mara'].map((username, i) => ({ id: String(i + 1), username, name: username, email: `${username}@example.com` })),
    posts: [], comments: [], loves: [], watches: [], follows: [],
  }
  const byId = (list, id) => list.find(x => x.id === String(id))
  return {
    db,
    save: jest.fn(),
    nextId: () => String(++db.seq),
    userById: id => byId(db.users, id),
    postById: id => byId(db.posts, id),
    postByRef: id => byId(db.posts, id),
    userByName: name => db.users.find(u => u.username === name),
  }
})
jest.mock('./content', () => ({ categories: [{ id: '1', name: 'Art', slug: 'art' }, { id: '2', name: 'Design', slug: 'design' }] }))
jest.mock('./serialize', () => ({
  gqlPost: p => ({ id: p.id }), gqlComment: c => ({ id: c.id }), gqlAuthor: u => ({ id: u.id, username: u.username }),
  flatPost: p => ({ id: p.id, contentWarning: 'NSFW', isAdultContent: true, links: { author: { id: p.authorId, type: 'users' } } }), flatUser: u => ({ id: u.id }), flatComment: c => ({ id: c.id }),
}))

const { db } = require('./db')
const n = require('./notifications')

const post = (id, authorId) => ({ id, token: `t${id}`, authorId, createdAt: '2026-01-01T00:00:00.000Z', regions: [] })

// Read state compares timestamps, so let the clock move between "read" and "new activity".
let clock = Date.parse('2026-02-01T00:00:00.000Z')
const tick = () => { clock += 1000; jest.setSystemTime(clock) }

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
  jest.setSystemTime(clock)
  delete db.notifications
  delete db.notificationReads
  delete db.notificationsSeeded
  db.posts = [post('p1', '1'), post('p2', '1'), post('p3', '2'), post('p4', '3')]
  db.comments = [{ id: 'c1', postId: 'p1', authorId: '2', createdAt: '2026-01-01T01:00:00.000Z', text: 'Nice work' }]
  db.loves = [{ userId: '2', postId: 'p1' }, { userId: '1', postId: 'p3' }]
  db.follows = [{ followerId: '2', followeeId: '1' }]
})

afterEach(() => jest.useRealTimers())

const kinds = (userId, category) => n.forUser(userId, category).map(x => x.kind)

describe('derived notifications', () => {
  it('creates one per love, comment and follow, for the recipient only', () => {
    const ada = kinds('1')
    expect(ada).toEqual(expect.arrayContaining(['love_notification', 'comment_notification', 'new_follower_post']))
    // grace got ada's love on her post, and nothing about ada's own post
    expect(kinds('2')).toEqual(expect.arrayContaining(['love_notification']))
    expect(n.forUser('2').every(x => x.userId === '2')).toBe(true)
  })

  it('never notifies about your own activity', () => {
    db.loves.push({ userId: '1', postId: 'p2' })
    n.sync()
    expect(db.notifications.some(x => x.kind === 'love_notification' && x.userId === '1' && x.actorId === '1')).toBe(false)
  })

  it('is idempotent and drops a notification when its source goes away', () => {
    const count = n.forUser('1', 'loves').length
    expect(n.forUser('1', 'loves')).toHaveLength(count)
    db.loves = db.loves.filter(l => !(l.userId === '2' && l.postId === 'p1'))
    expect(n.forUser('1', 'loves')).toHaveLength(count - 1)
  })

  it('seeds mentions, reposts and watches for every user with posts', () => {
    n.sync()
    expect(db.notifications.some(x => x.kind === 'comment_mention_notification' && x.userId === '1')).toBe(true)
    expect(db.notifications.some(x => x.kind === 'watch_notification')).toBe(true)
  })
})

describe('repost notifications', () => {
  const repost = (id, authorId, repostOfId, createdAt = '2026-01-15T00:00:00.000Z') => ({ id, token: `r${id}`, authorId, repostOfId, createdAt, regions: [] })

  it('tells the original author about a repost, with the repost as the subject', () => {
    db.posts.push(repost('p9', '2', 'p1'))
    const list = n.forUser('1', 'reposts').filter(x => x.key === 'repost:p9')
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ userId: '1', kind: 'repost_notification', actorId: '2', postId: 'p9' })
    expect(n.serialize(list[0], '1')).toMatchObject({ kind: 'repost_notification', subjectType: 'Post', subject: { __typename: 'Post', id: 'p9' } })
    expect(n.forUser('2').some(x => x.key === 'repost:p9')).toBe(false)
  })

  it('is created once and goes away with the repost', () => {
    db.posts.push(repost('p9', '2', 'p1'))
    n.sync()
    n.sync()
    expect(db.notifications.filter(x => x.key === 'repost:p9')).toHaveLength(1)
    db.posts = db.posts.filter(p => p.id !== 'p9')
    expect(n.forUser('1').some(x => x.key === 'repost:p9')).toBe(false)
  })

  it('ignores a repost whose original is gone and a repost of your own post', () => {
    db.posts.push(repost('p8', '2', 'nope'), repost('p7', '1', 'p2'))
    n.sync()
    expect(db.notifications.some(x => x.key === 'repost:p8' || x.key === 'repost:p7')).toBe(false)
  })

  it('lights the unread dot for a repost made after the stream was read', () => {
    n.sync()
    tick()
    n.markRead('1')
    expect(n.newContent('1')).toBe(false)
    tick()
    db.posts.push(repost('p9', '2', 'p1', new Date(clock).toISOString()))
    expect(n.newContent('1')).toBe(true)
  })

  it('does not flag an old repost as new', () => {
    n.sync()
    db.posts.push(repost('p9', '2', 'p1', '2026-01-20T00:00:00.000Z'))
    expect(n.newContent('1')).toBe(false)
    expect(n.forUser('1', 'reposts').some(x => x.key === 'repost:p9')).toBe(true)
  })
})

describe('categories', () => {
  it('filters by tab and sorts newest first', () => {
    expect(new Set(kinds('1', 'loves'))).toEqual(new Set(['love_notification']))
    expect(kinds('1', 'relationships')).toEqual(['new_follower_post'])
    expect(kinds('1', 'mentions').every(k => /mention/.test(k))).toBe(true)
    const dates = n.forUser('1').map(x => x.createdAt)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('treats an unknown category as all', () => {
    const out = n.resolvers.notificationStream({ category: 'bogus' }, '1').notificationStream
    expect(out.notifications.length).toBe(n.forUser('1').length)
  })
})

describe('read state', () => {
  it('starts read, goes unread on new activity and is cleared by loading the stream', () => {
    n.sync()
    expect(n.newContent('1')).toBe(false)
    tick()
    db.loves.push({ userId: '3', postId: 'p2' })
    expect(n.newContent('1')).toBe(true)
    expect(n.resolvers.newNotificationStreamContent({}, '1').newNotificationStreamContent.newContent).toBe(true)
    n.resolvers.notificationStream({}, '1')
    expect(n.newContent('1')).toBe(false)
  })

  it('does not mark read when loading a later page', () => {
    n.sync()
    tick()
    db.loves.push({ userId: '3', postId: 'p2' })
    n.resolvers.notificationStream({ before: '1' }, '1')
    expect(n.newContent('1')).toBe(true)
  })

  it('marks only the given user read', () => {
    n.sync()
    tick()
    db.loves.push({ userId: '3', postId: 'p2' }, { userId: '1', postId: 'p4' })
    n.sync()
    tick()
    n.markRead('1')
    expect(n.newContent('1')).toBe(false)
    expect(n.newContent('3')).toBe(true)
  })

  it('has nothing for logged out viewers', () => {
    expect(n.newContent(null)).toBe(false)
    expect(n.resolvers.notificationStream({}, null).notificationStream.notifications).toEqual([])
  })
})

describe('paging', () => {
  it('pages with a cursor and reports the last page', () => {
    n.sync()
    const total = n.forUser('1').length
    const first = n.resolvers.notificationStream({ perPage: 2 }, '1').notificationStream
    expect(first.notifications).toHaveLength(2)
    expect(first.isLastPage).toBe(total <= 2)
    const rest = n.resolvers.notificationStream({ perPage: 2, before: first.next }, '1').notificationStream
    expect(rest.notifications[0].id).not.toBe(first.notifications[0].id)
  })
})

describe('simulate', () => {
  it('lights the unread flag by adding a love on the newest post', () => {
    n.sync()
    expect(n.newContent('1')).toBe(false)
    tick()
    expect(n.simulate('1')).toMatchObject({ post: expect.any(String) })
    expect(n.newContent('1')).toBe(true)
  })
})

describe('v2 activities (the original app)', () => {
  it('leaves the NSFW label off linked posts (the original would show its View button on feeds)', () => {
    const { linked } = n.activities('1').body
    expect(linked.posts.length).toBeGreaterThan(0)
    linked.posts.forEach(p => expect(p).not.toHaveProperty('contentWarning'))
    linked.posts.forEach(p => expect(p).not.toHaveProperty('isAdultContent'))
  })

  it('links each activity to a linked subject', () => {
    const { activities, linked } = n.activities('1').body
    expect(activities.length).toBeGreaterThan(0)
    activities.forEach((a) => {
      expect(linked[a.links.subject.type].some(x => x.id === a.links.subject.id)).toBe(true)
    })
  })
})
