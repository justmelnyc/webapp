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
    expect(first).toMatchObject({ id: `${post.categoryIds[0]}-${post.id}`, status: expect.stringMatching(/^(featured|submitted)$/) })
    expect(first.category).toEqual({ id: post.categoryIds[0], slug: expect.any(String), name: expect.any(String) })
  })

  it('names the curators and hands actions only to a curator of the category', () => {
    const post = db.posts.find(p => !p.repostOfId && db.categoryPostStates[`1-${p.id}`] && db.categoryPostStates[`1-${p.id}`].status === 'submitted')
    const ada = db.users.find(u => u.username === 'ada').id
    expect(gqlPost(post, ada).categoryPosts[0].actions.feature).toBeTruthy()
    expect(gqlPost(post, db.users.find(u => u.username === 'theo').id).categoryPosts[0].actions).toBeNull()
    expect(gqlPost(post, null).categoryPosts[0].submittedBy.username).toBeTruthy()
  })

  it('is empty for a post without categories', () => {
    const post = { ...db.posts[0], categoryIds: [] }
    expect(gqlPost(post, db.users[0].id).categoryPosts).toEqual([])
  })
})

describe('comments with pictures', () => {
  const { gqlComment, flatComment } = require('./serialize')
  const author = () => db.users[0].id
  const base = { id: 'c9', postId: 'p1', authorId: undefined, createdAt: '2026-01-01T00:00:00.000Z' }

  it('keeps text-only comments exactly as before (one text region, no assets)', () => {
    const comment = { ...base, authorId: author(), text: 'Wow.' }
    const gql = gqlComment(comment, author())
    expect(gql.content).toEqual([{ kind: 'text', data: '<p>Wow.</p>', linkUrl: null, links: null }])
    expect(gql.assets).toEqual([])
    expect(flatComment(comment)).toEqual({
      id: 'c9', postId: 'p1', authorId: author(), createdAt: base.createdAt,
      body: [{ kind: 'text', data: 'Wow.' }],
      content: [{ kind: 'text', data: '<p>Wow.</p>' }],
      summary: [{ kind: 'text', data: '<p>Wow.</p>' }],
    })
  })

  it('serializes stored regions in order, with an asset for each image', () => {
    const regions = [
      { kind: 'text', text: 'Look' },
      { kind: 'image', url: 'http://localhost:7770/mock-s3/uploads/a.png', alt: '', width: 300, height: 200 },
    ]
    const gql = gqlComment({ ...base, authorId: author(), text: 'Look', regions }, author())
    expect(gql.content.map(r => r.kind)).toEqual(['text', 'image'])
    expect(gql.content[1]).toMatchObject({ data: { url: regions[1].url }, links: { assets: 'c9-a1' } })
    expect(gql.assets).toEqual([{ id: 'c9-a1', attachment: expect.objectContaining({ hdpi: expect.any(Object) }) }])
    expect(flatComment({ ...base, authorId: author(), text: 'Look', regions }).content[1].asset.id).toBe('c9-a1')
  })
})
