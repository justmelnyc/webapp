/** @jest-environment node */
jest.mock('./content', () => ({ categories: [{ id: '1' }, { id: '2' }, { id: '3' }] }))
const { followCategories, featuredAuthors, onboardingVersion } = require('./onboarding')

const makeDb = () => ({
  users: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
  posts: [
    { id: 'p1', authorId: '2', categoryIds: ['1'] },
    { id: 'p2', authorId: '2', categoryIds: ['1'] },
    { id: 'p3', authorId: '3', categoryIds: ['1', '2'] },
    { id: 'p4', authorId: '4', categoryIds: ['3'] },
    { id: 'p5', authorId: '1', categoryIds: ['1'] },
  ],
  follows: [],
})

describe('followCategories', () => {
  it('stores valid category ids and follows the most active authors, never the viewer', () => {
    const db = makeDb()
    const me = db.users[0]
    const out = followCategories(db, me, { followed_category_ids: [1, '2', '99', 1] })
    expect(out.followedCategoryIds).toEqual(['1', '2'])
    expect(me.followedCategoryIds).toEqual(['1', '2'])
    expect(out.followed).toEqual(['2', '3'])
    expect(db.follows).toEqual([{ followerId: '1', followeeId: '2' }, { followerId: '1', followeeId: '3' }])
  })

  it('does not follow anyone with disable_follows or twice', () => {
    const db = makeDb()
    const me = db.users[0]
    followCategories(db, me, { followed_category_ids: ['1'], disable_follows: true })
    expect(db.follows).toEqual([])
    followCategories(db, me, { followed_category_ids: ['1'] })
    followCategories(db, me, { followed_category_ids: ['1'] })
    expect(db.follows).toHaveLength(2)
  })

  it('copes with a missing body', () => {
    const db = makeDb()
    expect(followCategories(db, db.users[0], undefined).followedCategoryIds).toEqual([])
  })

  it('limits featured authors', () => {
    expect(featuredAuthors(makeDb(), ['1'], '1', 1)).toEqual(['2'])
  })
})

describe('onboardingVersion', () => {
  it('counts users without the field as onboarded and reports what was saved', () => {
    expect(onboardingVersion({})).toBe(3)
    expect(onboardingVersion({ webOnboardingVersion: '3' })).toBe('3')
    expect(onboardingVersion({ webOnboardingVersion: null })).toBeNull()
  })
})
