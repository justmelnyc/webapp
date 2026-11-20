/**
 * @jest-environment node
 */
/* eslint-disable */
const cu = require('./category-users')

const makeDb = () => ({
  users: [{ id: '1', username: 'ada' }, { id: '2', username: 'grace' }, { id: '8', username: 'kofi' }],
  categoryRoles: [
    { categoryId: '1', userId: '1', role: 'curator' },
    { categoryId: '3', userId: '1', role: 'curator' },
    { categoryId: '2', userId: '2', role: 'moderator' },
  ],
})

describe('category users', () => {
  it('lists the roles of a category, filtered by kind', () => {
    const db = makeDb()
    expect(cu.rolesIn(db, '1').map(cu.idOf)).toEqual(['1-1-curator'])
    expect(cu.rolesIn(db, '1', ['MODERATOR'])).toEqual([])
    expect(cu.rolesIn(db, '2', ['CURATOR', 'MODERATOR']).map(cu.idOf)).toEqual(['2-2-moderator'])
    expect(cu.rolesIn({ users: [] }, '1')).toEqual([])
  })

  it('lets curators and moderators administer their own categories only', () => {
    const db = makeDb()
    expect(cu.administeredCategoryIds(db, '1')).toEqual(['1', '3'])
    expect(cu.administeredCategoryIds(db, '2')).toEqual(['2'])
    expect(cu.administeredCategoryIds(db, '8')).toEqual([])
    expect(cu.administeredCategoryIds(db, null)).toEqual([])
    expect(cu.canManage(db, '1', '3')).toBe(true)
    expect(cu.canManage(db, '1', '2')).toBe(false)
    expect(cu.canManage(db, null, '1')).toBe(false)
  })

  it('reports them on the profile, with the subscribed categories', () => {
    const db = makeDb()
    expect(cu.profileFields(db, db.users[0])).toEqual({ links: { categories: ['1', '3'] }, followedCategoryIds: [] })
    expect(cu.profileFields(db, { id: '8', followedCategoryIds: ['2'] })).toEqual({ links: { categories: [] }, followedCategoryIds: ['2'] })
  })

  it('adds a role once', () => {
    const db = makeDb()
    const first = cu.addRole(db, '1', { userId: 8, categoryId: 1, role: 'curator' })
    expect(first).toEqual({ status: 'ok', record: { categoryId: '1', userId: '8', role: 'curator' } })
    expect(cu.addRole(db, '1', { userId: '8', categoryId: '1', role: 'CURATOR' }).record).toBe(first.record)
    expect(cu.rolesIn(db, '1').map(cu.idOf)).toEqual(['1-1-curator', '1-8-curator'])
    // the same person can also moderate
    expect(cu.addRole(db, '1', { userId: '8', categoryId: '1', role: 'moderator' }).status).toBe('ok')
    expect(cu.rolesIn(db, '1')).toHaveLength(3)
  })

  it('refuses outsiders, unknown users and unknown roles', () => {
    const db = makeDb()
    expect(cu.addRole(db, '8', { userId: '8', categoryId: '1', role: 'curator' }).status).toBe('forbidden')
    expect(cu.addRole(db, '1', { userId: '8', categoryId: '2', role: 'curator' }).status).toBe('forbidden')
    expect(cu.addRole(db, null, { userId: '8', categoryId: '1', role: 'curator' }).status).toBe('forbidden')
    expect(cu.addRole(db, '1', { userId: '99', categoryId: '1', role: 'curator' }).status).toBe('invalid')
    expect(cu.addRole(db, '1', { userId: '8', categoryId: '1', role: 'featured' }).status).toBe('invalid')
    expect(cu.addRole(db, '1').status).toBe('invalid')
    expect(db.categoryRoles).toHaveLength(3)
  })

  it('removes a role by id', () => {
    const db = makeDb()
    cu.addRole(db, '1', { userId: '8', categoryId: '1', role: 'curator' })
    expect(cu.removeRole(db, '2', '1-8-curator')).toBe('forbidden')
    expect(cu.removeRole(db, '1', '1-8-moderator')).toBe('missing')
    expect(cu.removeRole(db, '1', 'nonsense')).toBe('missing')
    expect(cu.removeRole(db, '1', '1-8-curator')).toBe('ok')
    expect(db.categoryRoles).toEqual(makeDb().categoryRoles)
  })

  it('serializes for GraphQL and for REST', () => {
    const record = { categoryId: '1', userId: '8', role: 'curator' }
    expect(cu.parseId(cu.idOf(record))).toEqual(record)
    expect(cu.gqlCategoryUser(record, { id: '8' })).toEqual({ id: '1-8-curator', role: 'CURATOR', user: { id: '8' } })
    expect(cu.restCategoryUser(record)).toEqual({
      id: '1-8-curator',
      role: 'curator',
      links: { category: { id: '1', type: 'categories' }, user: { id: '8', type: 'users' } },
    })
  })
})
