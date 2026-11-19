/**
 * @jest-environment node
 */
/* eslint-disable */
jest.mock('./db', () => {
  const { build } = require('./seed')
  const db = build()
  const byId = (list, id) => list.find(x => x.id === String(id))
  return {
    db, save: jest.fn(), nextId: () => String(++db.seq),
    userById: id => byId(db.users, id), postById: id => byId(db.posts, id),
  }
})

const { db } = require('./db')
const { gqlPost } = require('./serialize')

describe('gqlPost categoryPosts', () => {
  it('lists the post in its categories like the real API (the original shows the first as a CategoryHeader)', () => {
    const post = db.posts.find(p => !p.repostOfId && p.categoryIds && p.categoryIds.length)
    const [first] = gqlPost(post, db.users[0].id).categoryPosts
    expect(first).toMatchObject({ id: `${post.categoryIds[0]}-${post.id}`, status: 'featured' })
    expect(first.category).toEqual({ id: post.categoryIds[0], slug: expect.any(String), name: expect.any(String) })
  })

  it('is empty for a post without categories', () => {
    const post = { ...db.posts[0], categoryIds: [] }
    expect(gqlPost(post, db.users[0].id).categoryPosts).toEqual([])
  })
})
