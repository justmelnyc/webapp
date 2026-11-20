/** @jest-environment node */
/* eslint-disable */
// The activity generator with an injected clock, random source and id counter.
jest.mock('./db', () => ({ db: {}, save: jest.fn(), nextId: jest.fn(), userById: jest.fn() }))

const { build, rng } = require('./seed')
const live = require('./live')

const NOW = Date.parse('2027-03-01T12:00:00.000Z')
const LATER = NOW + 3600000

const world = () => {
  const db = build(NOW)
  return { db, nextId: () => String(++db.seq) }
}
// `count` steps, one a second, from a seeded random source
const run = (db, nextId, count, { seed = 7, viewerIds = ['1'], start = LATER } = {}) => {
  const rand = rng(seed)
  return Array.from({ length: count }, (_, i) => live.step(db, { now: start + i * 1000, rand, nextId, viewerIds }))
}
const sizes = db => ({ posts: db.posts.length, comments: db.comments.length, loves: db.loves.length, follows: db.follows.length })

describe('live activity', () => {
  it('is deterministic for a clock and a random source', () => {
    const [a, b] = [world(), world()]
    expect(run(a.db, a.nextId, 60)).toEqual(run(b.db, b.nextId, 60))
    expect(a.db).toEqual(b.db)
    const c = world()
    expect(run(c.db, c.nextId, 60, { seed: 8 })).not.toEqual(run(world().db, a.nextId, 60))
  })

  it('does a bit of everything, mostly loves and comments', () => {
    const { db, nextId } = world()
    const before = sizes(db)
    const actions = run(db, nextId, 300)
    const count = kind => actions.filter(a => a && a.kind === kind).length
    expect(actions.every(Boolean)).toBe(true)
    live.KINDS.forEach(([kind]) => expect(count(kind)).toBeGreaterThan(0))
    expect(count('love')).toBeGreaterThan(count('comment'))
    expect(count('comment')).toBeGreaterThan(count('post'))
    expect(count('post')).toBeGreaterThan(count('repost'))
    const after = sizes(db)
    expect(after.loves - before.loves).toBe(count('love'))
    expect(after.comments - before.comments).toBe(count('comment'))
    expect(after.follows - before.follows).toBe(count('follow'))
    expect(after.posts - before.posts).toBe(count('post') + count('repost'))
  })

  it('never acts as whoever is logged in, as someone who signed up, or on their own post', () => {
    const { db, nextId } = world()
    db.users.push({ id: '5000', username: 'newcomer', name: 'New', email: 'n@example.com', links: [] })
    const actions = run(db, nextId, 300, { viewerIds: ['1', '2'] })
    expect(actions.filter(a => ['ada', 'grace', 'newcomer'].includes(a.by))).toEqual([])
    // the only thing people do to their own post is answer in its thread
    expect(actions.filter(a => a.by === a.of && !a.reply)).toEqual([])
    expect(actions.filter(a => a.reply).every(a => a.kind === 'comment' && a.by === a.of)).toBe(true)
    expect(live.actorsOf(db, ['1', '2']).map(u => u.id)).not.toContain('5000')
    expect(db.loves.filter(l => db.posts.find(p => p.id === l.postId).authorId === l.userId)).toEqual([])
    const pairs = db.follows.map(f => `${f.followerId}>${f.followeeId}`)
    expect(new Set(pairs).size).toBe(pairs.length)
    const loves = db.loves.map(l => `${l.userId}>${l.postId}`)
    expect(new Set(loves).size).toBe(loves.length)
  })

  it('aims a good share at the viewer, so their notifications light up', () => {
    const { db, nextId } = world()
    const actions = run(db, nextId, 200)
    const atAda = actions.filter(a => a.of === 'ada')
    expect(atAda.length).toBeGreaterThan(30)
    expect(atAda.length).toBeLessThan(120)
    ;['love', 'comment', 'follow'].forEach(kind => expect(atAda.some(a => a.kind === kind)).toBe(true))
  })

  it('dates what it makes at the injected time, on top of the feed, marked as its own', () => {
    const { db, nextId } = world()
    const actions = run(db, nextId, 120)
    const posted = actions.filter(a => a.kind === 'post')
    const records = posted.map(a => db.posts.find(p => p.token === a.post))
    records.forEach((p) => {
      expect(p.live).toBe(true)
      expect(Date.parse(p.createdAt)).toBeGreaterThanOrEqual(LATER)
      expect(p.regions.length).toBeGreaterThan(0)
      expect(db.posts.indexOf(p)).toBeLessThan(actions.length)
    })
    expect(new Set(db.posts.map(p => p.token)).size).toBe(db.posts.length)
    const added = db.comments.filter(c => c.live)
    expect(added.length).toBe(actions.filter(a => a.kind === 'comment').length)
    added.forEach(c => expect(Date.parse(c.createdAt)).toBeGreaterThanOrEqual(LATER))
  })

  it('writes varied things: no caption twice on top of the feed, no line twice in a thread', () => {
    const { db, nextId } = world()
    run(db, nextId, 400)
    const captions = db.posts.filter(p => p.live && !p.repostOfId).map(p => (p.regions.find(r => r.kind === 'text') || {}).data).filter(Boolean)
    expect(captions.length).toBeGreaterThan(20)
    expect(new Set(captions).size).toBeGreaterThan(captions.length * 0.9)
    const threads = new Map()
    db.comments.filter(c => c.live).forEach(c => threads.set(c.postId, [...(threads.get(c.postId) || []), c.text]))
    threads.forEach(texts => expect(new Set(texts).size).toBe(texts.length))
  })

  it('respects blocks and has nothing to do without actors', () => {
    const { db, nextId } = world()
    db.blocks = db.users.filter(u => u.id !== '1').map(u => ({ userId: '1', targetId: u.id, kind: 'block' }))
    const actions = run(db, nextId, 80)
    expect(actions.filter(a => a.of === 'ada')).toEqual([])
    const empty = { users: [{ id: '1', username: 'ada' }], posts: [], comments: [], loves: [], follows: [] }
    expect(live.step(empty, { now: NOW, rand: rng(1), nextId, viewerIds: ['1'] })).toBeNull()
  })
})

describe('growth cap', () => {
  it('keeps the newest live posts and comments and drops the rest with what hangs off them', () => {
    const { db, nextId } = world()
    const seeded = sizes(db)
    run(db, nextId, 900)
    const livePosts = db.posts.filter(p => p.live).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    expect(livePosts.length).toBeGreaterThan(40)
    const kept = new Set(livePosts.slice(0, 10).map(p => p.id))
    const removed = live.prune(db, { maxPosts: 10, maxComments: 25 })
    expect(removed).toBeGreaterThan(0)
    const left = db.posts.filter(p => p.live)
    expect(left.length).toBeLessThanOrEqual(10)
    expect(left.every(p => kept.has(p.id))).toBe(true)
    expect(db.comments.filter(c => c.live).length).toBeLessThanOrEqual(25)
    // nothing points at a post that is gone
    const ids = new Set(db.posts.map(p => p.id))
    expect(db.comments.filter(c => !ids.has(c.postId))).toEqual([])
    expect(db.loves.filter(l => !ids.has(l.postId))).toEqual([])
    expect(db.posts.filter(p => p.repostOfId && !ids.has(p.repostOfId))).toEqual([])
    // the seed itself is never pruned
    expect(db.posts.filter(p => !p.live).length).toBe(seeded.posts)
    expect(db.comments.filter(c => !c.live).length).toBe(seeded.comments)
    expect(live.prune(db, { maxPosts: 10, maxComments: 25 })).toBe(0)
  })

  it('stays bounded over a very long session with the default caps', () => {
    const { db, nextId } = world()
    const rand = rng(3)
    for (let i = 0; i < 6000; i += 1) {
      live.step(db, { now: LATER + i * 20000, rand, nextId, viewerIds: ['1'] })
      live.prune(db)
    }
    expect(db.posts.filter(p => p.live).length).toBeLessThanOrEqual(live.CAPS.maxPosts)
    expect(db.comments.filter(c => c.live).length).toBeLessThanOrEqual(live.CAPS.maxComments)
    expect(db.loves.length).toBeLessThanOrEqual(db.users.length * db.posts.length)
    expect(db.follows.length).toBeLessThanOrEqual(db.users.length * (db.users.length - 1))
  })
})
