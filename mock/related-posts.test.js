/**
 * @jest-environment node
 */
/* eslint-disable */
const { relatedPosts, perPageOf, DEFAULT_PER_PAGE, MAX_PER_PAGE } = require('./related-posts')
const { build } = require('./seed')

const post = (id, authorId, day, categoryIds = [], extra = {}) => ({
  id, authorId, createdAt: `2026-01-${String(day).padStart(2, '0')}T00:00:00Z`, categoryIds, regions: [], ...extra,
})
const makeDb = () => ({
  posts: [
    post('a', '1', 10, ['1']),
    post('b', '1', 12, ['2']),
    post('c', '1', 11, []),
    post('d', '2', 20, ['1', '3']),
    post('e', '3', 21, ['1']),
    post('f', '2', 22, ['4']),
    post('g', '3', 23, [], { repostOfId: 'a' }),
    post('h', '1', 24, [], { repostOfId: 'f' }),
  ],
})
const ids = (db, id) => relatedPosts(db, db.posts.find(p => p.id === id)).map(p => p.id)

describe('relatedPosts', () => {
  it('lists the author\'s other posts first, then posts sharing a category, each newest first', () => {
    expect(ids(makeDb(), 'a')).toEqual(['b', 'c', 'e', 'd'])
  })

  it('never returns the post itself or a repost', () => {
    const db = makeDb()
    db.posts.forEach((p) => {
      const related = relatedPosts(db, p)
      expect(related.some(r => r.id === p.id)).toBe(false)
      expect(related.some(r => r.repostOfId)).toBe(false)
    })
  })

  it('relates a repost through the post it reposts, without listing that post', () => {
    // g is 3's repost of a (category 1): 3's own post e, then category 1 posts by others, but not a itself
    expect(ids(makeDb(), 'g')).toEqual(['e', 'd'])
  })

  it('returns nothing when no one else shares the author or a category', () => {
    const db = { posts: [post('x', '9', 1, ['7']), post('y', '8', 2, ['6'])] }
    expect(ids(db, 'x')).toEqual([])
  })

  it('is deterministic and has no duplicates on the seeded world', () => {
    const db = build()
    const target = db.posts.find(p => !p.repostOfId && (p.categoryIds || []).length)
    const first = relatedPosts(db, target).map(p => p.id)
    expect(first.length).toBeGreaterThan(0)
    expect(new Set(first).size).toBe(first.length)
    expect(relatedPosts(db, target).map(p => p.id)).toEqual(first)
    expect(db.posts.find(p => p.id === first[0]).authorId).toBe(target.authorId)
  })
})

describe('perPageOf', () => {
  it('reads per_page, capped, with a default', () => {
    expect(perPageOf('2')).toBe(2)
    expect(perPageOf(undefined)).toBe(DEFAULT_PER_PAGE)
    expect(perPageOf('0')).toBe(DEFAULT_PER_PAGE)
    expect(perPageOf('abc')).toBe(DEFAULT_PER_PAGE)
    expect(perPageOf('999')).toBe(MAX_PER_PAGE)
  })
})
