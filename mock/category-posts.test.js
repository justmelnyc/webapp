/**
 * @jest-environment node
 */
/* eslint-disable */
const { build } = require('./seed')
const cp = require('./category-posts')

const ada = db => db.users.find(u => u.username === 'ada').id
const postIn = (db, categoryId, status) => db.posts.find(p => (db.categoryPostStates[`${categoryId}-${p.id}`] || { status: 'featured' }).status === status
  && (p.categoryIds || []).includes(categoryId) && !p.repostOfId)

describe('category curation', () => {
  it('makes ada a curator of Art and grace a moderator of Photography', () => {
    const db = build()
    expect(cp.canCurate(db, ada(db), '1')).toBe(true)
    expect(cp.canCurate(db, db.users.find(u => u.username === 'grace').id, '2')).toBe(true)
    expect(cp.canCurate(db, db.users.find(u => u.username === 'theo').id, '1')).toBe(false)
    expect(cp.canCurate(db, null, '1')).toBe(false)
  })

  it('is idempotent', () => {
    const db = build()
    const before = JSON.stringify(db)
    expect(cp.seedCategoryPosts(db)).toBe(0)
    expect(JSON.stringify(db)).toBe(before)
  })

  it('offers feature on submitted posts and unfeature on featured ones, only to curators', () => {
    const db = build()
    const submitted = postIn(db, '1', 'submitted')
    const featured = postIn(db, '1', 'featured')
    expect(cp.actionsFor(db, `1-${submitted.id}`, 'submitted', ada(db), '1')).toEqual({
      feature: { method: 'PUT', href: `/api/v2/category_posts/1-${submitted.id}/feature` }, unfeature: null,
    })
    expect(cp.actionsFor(db, `1-${featured.id}`, 'featured', ada(db), '1').unfeature).toBeTruthy()
    expect(cp.actionsFor(db, `1-${featured.id}`, 'featured', '5', '1')).toBeNull()
  })

  it('features and unfeatures, refusing the wrong state or a non-curator', () => {
    const db = build()
    const post = postIn(db, '1', 'submitted')
    expect(cp.applyAction(db, post, '1', 'unfeature', ada(db))).toBeNull()
    expect(cp.applyAction(db, post, '1', 'feature', '5')).toBeNull()
    expect(cp.applyAction(db, post, '1', 'feature', ada(db))).toMatchObject({ status: 'featured', featuredById: ada(db) })
    expect(cp.stateOf(db, '1', post).status).toBe('featured')
    const undone = cp.applyAction(db, post, '1', 'unfeature', ada(db))
    expect(undone.status).toBe('submitted')
    expect(undone.featuredById).toBeUndefined()
  })

  it('parses category post ids', () => {
    expect(cp.parseId('1-1002')).toEqual({ categoryId: '1', postId: '1002' })
    expect(cp.parseId('x')).toBeNull()
  })
})
