/** @jest-environment node */
/* eslint-disable */
// The original app keeps `featuredBy { username }` as a user record without an id and then finds that empty
// record when it opens that person's profile (no hero, "doesn't have any followers yet"). So after every
// seeding step, nobody is named as `featuredBy` on a post their own profile shows.
jest.mock('./db', () => {
  const db = require('./seed').build(Date.parse('2027-03-01T12:00:00.000Z'))
  const byId = (list, id) => list.find(x => x.id === String(id))
  return {
    db, save: jest.fn(), nextId: () => String(++db.seq),
    userById: id => byId(db.users, id), postById: id => byId(db.posts, id), postByRef: id => byId(db.posts, id),
    userByName: name => db.users.find(u => u.username === name),
  }
})

const { db } = require('./db')
const cp = require('./category-posts')
const { gqlPost } = require('./serialize')

// what a profile lists: the user's posts, and for a repost the original it shows
const profilePosts = (data, userId) => data.posts.filter(p => p.authorId === userId)
  .flatMap(p => [p, data.posts.find(x => x.id === p.repostOfId)].filter(Boolean))

const offenders = data => Object.entries(data.categoryPostStates).filter(([key, state]) => (
  state.featuredById && profilePosts(data, state.featuredById).some(p => key.endsWith(`-${p.id}`))
))

describe('featuredBy on profiles', () => {
  it('holds for the seed, also after the reposts the notification seed adds for ada and grace', () => {
    expect(offenders(db)).toEqual([])
    require('./reposts').seedReposts()
    require('./moderation').ensureModerationData(db)
    require('./notifications').sync()
    expect(db.posts.some(p => p.repostOfId && p.authorId === '1')).toBe(true) // ada has reposted by now
    expect(offenders(db)).toEqual([])
  })

  it('still seeds a submitted and a curator-featured post for each role', () => {
    db.categoryRoles.forEach(({ categoryId, userId }) => {
      const states = Object.entries(db.categoryPostStates).filter(([key]) => key.startsWith(`${categoryId}-`)).map(([, s]) => s)
      expect(states.some(s => s.status === 'submitted')).toBe(true)
      expect(states.some(s => s.status === 'featured' && s.featuredById === userId)).toBe(true)
    })
  })

  it('is what the API answers: no profile post of ada or grace names them as featuredBy', () => {
    ;['ada', 'grace'].forEach((username) => {
      const user = db.users.find(u => u.username === username)
      const served = db.posts.filter(p => p.authorId === user.id).map(p => gqlPost(p, user.id))
        .flatMap(p => [p, p.repostedSource].filter(Boolean)).flatMap(p => p.categoryPosts)
      expect(served.length).toBeGreaterThan(0)
      expect(served.filter(c => c.featuredBy && c.featuredBy.username === username)).toEqual([])
      // the shape the original asks for is untouched
      served.forEach(c => expect(Object.keys(c).sort()).toEqual(['actions', 'category', 'featuredBy', 'id', 'status', 'submittedBy']))
    })
  })

  it('repairs a database seeded by version 1 without resetting what people changed', () => {
    const old = JSON.parse(JSON.stringify(db))
    const grace = old.users.find(u => u.username === 'grace')
    const own = old.posts.find(p => p.authorId === grace.id && !p.repostOfId && p.categoryIds.includes('2'))
    const reposted = old.posts.find(p => p.repostOfId && p.authorId === '1')
    const source = old.posts.find(p => p.id === reposted.repostOfId)
    source.categoryIds = ['1']
    old.categoryPostsSeed = 1
    old.categoryRoles.push({ categoryId: '4', userId: '3', role: 'curator' })
    old.categoryPostStates = {
      [`2-${own.id}`]: { status: 'featured', submittedById: grace.id, featuredById: grace.id },
      [`1-${source.id}`]: { status: 'featured', submittedById: source.authorId, featuredById: '1' },
      '4-999999': { status: 'submitted', submittedById: '3' },
    }
    expect(offenders(old)).toHaveLength(2)
    expect(cp.seedCategoryPosts(old)).toBeGreaterThan(0)
    expect(offenders(old)).toEqual([])
    expect(old.categoryPostStates['4-999999']).toEqual({ status: 'submitted', submittedById: '3' })
    expect(old.categoryRoles).toContainEqual({ categoryId: '4', userId: '3', role: 'curator' })
    expect(Object.values(old.categoryPostStates).some(s => s.featuredById === grace.id)).toBe(true)
    expect(cp.seedCategoryPosts(old)).toBe(0)
  })

  it('refuses the author, a reposter and the newest post of an author', () => {
    const posts = [
      { id: 'a', authorId: '5' }, { id: 'b', authorId: '5' }, { id: 'c', authorId: '9' }, { id: 'd', authorId: '9' },
      { id: 'r', authorId: '9', repostOfId: 'b' },
    ]
    expect(cp.mayBeFeaturedBy({ posts }, posts[0], '1')).toBe(false) // the newest of its author
    expect(cp.mayBeFeaturedBy({ posts }, posts[1], '1')).toBe(true)
    expect(cp.mayBeFeaturedBy({ posts }, posts[1], '5')).toBe(false) // their own
    expect(cp.mayBeFeaturedBy({ posts }, posts[1], '9')).toBe(false) // they reposted it
    expect(cp.mayBeFeaturedBy({ posts }, posts[3], '5')).toBe(true)
  })
})
