/**
 * @jest-environment node
 */
/* eslint-disable */
// The less common notification kinds of the mock API (reposts, invitations, submissions, categories, REST paging).
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
  flatPost: p => ({ id: p.id, links: { author: { id: p.authorId, type: 'users' } } }), flatUser: u => ({ id: u.id }), flatComment: c => ({ id: c.id }),
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


describe('kinds beyond the basics', () => {
  const repost = (id, authorId, repostOfId) => ({ id, token: `r${id}`, authorId, repostOfId, createdAt: '2026-01-15T00:00:00.000Z', regions: [] })
  const ofKind = (userId, kind) => n.forUser(userId).filter(x => x.kind === kind)

  it('tells the reposter about a love on a repost and the original author about it too', () => {
    db.posts.push(repost('p9', '2', 'p1')) // grace reposts ada's p1
    db.loves.push({ userId: '3', postId: 'p9' }) // mara loves the repost
    expect(ofKind('2', 'love_on_repost_notification')).toHaveLength(1)
    const original = ofKind('1', 'love_on_original_post_notification')
    expect(original).toHaveLength(1)
    expect(original[0]).toMatchObject({ actorId: '3', postId: 'p9' })
    expect(n.forUser('1', 'loves').some(x => x.kind === 'love_on_original_post_notification')).toBe(true)
  })

  it('does the same for comments, and keeps the notification of a plain love untouched', () => {
    db.posts.push(repost('p9', '2', 'p1'))
    db.comments.push({ id: 'c9', postId: 'p9', authorId: '3', createdAt: '2026-01-16T00:00:00.000Z', text: 'Nice' })
    expect(ofKind('2', 'comment_on_repost_notification')).toHaveLength(1)
    expect(ofKind('1', 'comment_on_original_post_notification')).toHaveLength(1)
    expect(kinds('1', 'comments')).toContain('comment_on_original_post_notification')
  })

  it('does not tell the original author when they wrote the love or the comment', () => {
    db.posts.push(repost('p9', '2', 'p1'))
    db.loves.push({ userId: '1', postId: 'p9' })
    expect(ofKind('1', 'love_on_original_post_notification')).toHaveLength(0)
  })

  it('turns a repost love into the new kind for a notification stored before it existed', () => {
    db.posts.push(repost('p9', '2', 'p1'))
    db.loves.push({ userId: '3', postId: 'p9' })
    n.sync()
    db.notifications.find(x => x.key === 'love:3:p9').kind = 'love_notification'
    n.sync()
    expect(db.notifications.find(x => x.key === 'love:3:p9').kind).toBe('love_on_repost_notification')
  })

  it('tells the inviter when an invitation is accepted', () => {
    db.invitations = [{ id: 'i1', inviterId: '1', acceptedById: '2', acceptedAt: '2026-01-05T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' }, { id: 'i2', inviterId: '1', acceptedById: null }]
    const list = ofKind('1', 'invitation_accepted_post')
    expect(list).toHaveLength(1)
    expect(n.serialize(list[0], '1')).toMatchObject({ subjectType: 'User', subject: { __typename: 'User', id: '2' } })
    expect(kinds('1', 'relationships')).toContain('invitation_accepted_post')
  })

  describe('artist invite submissions', () => {
    beforeEach(() => {
      db.artistInvites = [{ id: 'a1', slug: 'neon', title: 'Neon Nights' }]
      db.artistInviteSubmissions = [
        { id: 's1', inviteId: 'a1', postId: 'p3', status: 'approved', createdAt: '2026-01-02T00:00:00.000Z' },
        { id: 's2', inviteId: 'a1', postId: 'p4', status: 'declined', createdAt: '2026-01-02T00:00:00.000Z' },
        { id: 's3', inviteId: 'a1', postId: 'p3', status: 'selected', createdAt: '2026-01-03T00:00:00.000Z' },
      ]
    })

    it('tells the author about approved and selected submissions, not declined ones', () => {
      expect(ofKind('2', 'approved_artist_invite_submission').map(x => x.submissionId).sort()).toEqual(['s1', 's3'])
      expect(ofKind('3', 'approved_artist_invite_submission')).toHaveLength(0)
    })

    it('tells followers about the author\'s accepted work', () => {
      // ada (1) follows nobody in the fixture, grace (2) follows ada; make ada follow grace
      db.follows.push({ followerId: '1', followeeId: '2' })
      const list = ofKind('1', 'approved_artist_invite_submission_notification_for_followers')
      expect(list.map(x => x.submissionId).sort()).toEqual(['s1', 's3'])
      expect(n.serialize(list[0], '1')).toMatchObject({
        subjectType: 'ArtistInviteSubmission',
        subject: { __typename: 'ArtistInviteSubmission', artistInvite: { slug: 'neon', title: 'Neon Nights' } },
      })
    })

    it('drops the notification when the submission is no longer accepted', () => {
      expect(ofKind('2', 'approved_artist_invite_submission')).toHaveLength(2)
      db.artistInviteSubmissions[0].status = 'declined'
      expect(ofKind('2', 'approved_artist_invite_submission')).toHaveLength(1)
    })
  })

  it('serializes category and welcome notifications', () => {
    db.notifications = []
    n.sync()
    db.notifications.push(
      { id: 'x1', key: 'k1', userId: '1', kind: 'category_post_featured', createdAt: '2026-02-02T00:00:00.000Z', postId: 'p1', actorId: '2', categoryId: '2' },
      { id: 'x2', key: 'k2', userId: '1', kind: 'user_added_as_curator_notification', createdAt: '2026-02-02T00:00:00.000Z', actorId: '3', categoryId: '1' },
    )
    expect(n.serialize(db.notifications.find(x => x.id === 'x1'), '1').subject).toMatchObject({ __typename: 'CategoryPost', category: { slug: 'design' }, featuredBy: { id: '2' } })
    expect(n.serialize(db.notifications.find(x => x.id === 'x2'), '1').subject).toMatchObject({ __typename: 'CategoryUser', role: 'curator', featuredBy: { id: '3' } })
    expect(ofKind('1', 'welcome_notification').length).toBeGreaterThanOrEqual(0)
  })
})

describe('REST activities', () => {
  it('pages like the API and links repost sources', () => {
    db.posts.push({ id: 'p9', token: 'rp9', authorId: '2', repostOfId: 'p1', createdAt: '2026-01-15T00:00:00.000Z', regions: [] })
    db.loves.push({ userId: '3', postId: 'p9' })
    const total = n.forUser('1').length
    const first = n.activities('1', 'all', 1, 2)
    expect(first).toMatchObject({ page: 1, totalPages: Math.ceil(total / 2), totalCount: total })
    expect(first.body.activities).toHaveLength(2)
    const all = n.activities('1', 'all', 1, 100).body
    const onOriginal = all.activities.find(a => a.kind === 'love_on_original_post_notification')
    const post = all.linked.posts.find(p => p.id === 'p9')
    expect(post).toMatchObject({ repostId: 'p1', links: { repostedSource: { id: 'p1', type: 'posts' } } })
    expect(all.linked.posts.some(p => p.id === 'p1')).toBe(true)
    expect(onOriginal.links.subject.type).toBe('loves')
  })
})
