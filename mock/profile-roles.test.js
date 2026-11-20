/**
 * @jest-environment node
 */
/* eslint-disable */
const pr = require('./profile-roles')
const { categoryUsers } = require('./moderation')

const CATEGORIES = [{ id: '1', name: 'Art', slug: 'art' }, { id: '2', name: 'Photography', slug: 'photography' }, { id: '3', name: 'Design', slug: 'design' }]

const makeDb = () => ({
  users: [{ id: '1', username: 'ada' }, { id: '2', username: 'grace' }, { id: '8', username: 'kofi' }],
  categoryRoles: [
    { categoryId: '1', userId: '1', role: 'curator' },
    { categoryId: '3', userId: '1', role: 'curator' },
    { categoryId: '3', userId: '1', role: 'moderator' },
    { categoryId: '2', userId: '2', role: 'moderator' },
  ],
})

describe('profile roles', () => {
  it('lists the categories the viewer administers with their highest role', () => {
    const db = makeDb()
    expect(pr.administeredCategories(db, '1', CATEGORIES).map(c => [c.slug, c.currentUserState.role])).toEqual([['art', 'CURATOR'], ['design', 'MODERATOR']])
    expect(pr.administeredCategories(db, '2', CATEGORIES).map(c => [c.id, c.currentUserState.role])).toEqual([['2', 'MODERATOR']])
    expect(pr.administeredCategories(db, '8', CATEGORIES)).toEqual([])
    expect(pr.administeredCategories(db, null, CATEGORIES)).toEqual([])
  })

  it('filters them by name', () => {
    const db = makeDb()
    expect(pr.administeredCategories(db, '1', CATEGORIES, 'DES').map(c => c.slug)).toEqual(['design'])
    expect(pr.administeredCategories(db, '1', CATEGORIES, 'photo')).toEqual([])
  })

  it('features a user once, under the id the profile lists', () => {
    const db = makeDb()
    const first = pr.addFeatured(db, '1', { userId: 8, categoryId: 1 })
    expect(first).toEqual({ status: 'ok', record: { categoryId: '1', userId: '8', role: 'featured' } })
    expect(pr.addFeatured(db, '1', { userId: '8', categoryId: '1' }).status).toBe('ok')
    expect(db.users[2].roles).toEqual([{ categoryId: '1', role: 'FEATURED' }])
    expect(categoryUsers(db.users[2], db.categoryRoles).map(c => [c.id, c.role])).toEqual([[pr.featuredId('1', '8'), 'FEATURED']])
    // being featured gives no rights
    expect(pr.administeredCategories(db, '8', CATEGORIES)).toEqual([])
  })

  it('refuses outsiders and unknown users', () => {
    const db = makeDb()
    expect(pr.addFeatured(db, '1', { userId: '8', categoryId: '2' }).status).toBe('forbidden')
    expect(pr.addFeatured(db, null, { userId: '8', categoryId: '1' }).status).toBe('forbidden')
    expect(pr.addFeatured(db, '1', { userId: '99', categoryId: '1' }).status).toBe('invalid')
    expect(pr.addFeatured(db, '1').status).toBe('invalid')
    expect(db.users[2].roles).toBeUndefined()
  })

  it('removes a featured role by id', () => {
    const db = makeDb()
    pr.addFeatured(db, '1', { userId: '8', categoryId: '1' })
    pr.addFeatured(db, '1', { userId: '8', categoryId: '3' })
    expect(pr.removeFeatured(db, '2', '1-8-featured')).toBe('forbidden')
    expect(pr.removeFeatured(db, '1', '1-8-featured')).toBe('ok')
    expect(pr.removeFeatured(db, '1', '1-8-featured')).toBe('missing')
    expect(pr.removeFeatured(db, '1', '1-8-curator')).toBe('missing')
    expect(db.users[2].roles).toEqual([{ categoryId: '3', role: 'FEATURED' }])
  })

  it('tells featured ids and roles from the others', () => {
    expect(pr.parseFeaturedId('4-12-featured')).toEqual({ categoryId: '4', userId: '12' })
    expect(pr.parseFeaturedId('4-12-curator')).toBeNull()
    expect(pr.isFeaturedRole('FEATURED')).toBe(true)
    expect(pr.isFeaturedRole('curator')).toBe(false)
  })
})
