/**
 * @jest-environment node
 */
/* eslint-disable */
const staff = require('./staff')
const cu = require('./category-users')
const pr = require('./profile-roles')
const { build } = require('./seed')

const CATEGORIES = [{ id: '1', name: 'Art', slug: 'art' }, { id: '2', name: 'Photography', slug: 'photography' }]

const makeDb = () => ({
  users: [{ id: '1', username: 'ada' }, { id: '8', username: 'kofi' }, { id: '9', username: 'saoirse' }],
  categoryRoles: [{ categoryId: '1', userId: '1', role: 'curator' }],
})

describe('staff', () => {
  it('flags one seeded user, once', () => {
    const db = makeDb()
    expect(staff.seedStaff(db)).toBe(true)
    expect(db.users.filter(u => u.isStaff).map(u => u.username)).toEqual([staff.STAFF_USERNAME])
    expect(staff.seedStaff(db)).toBe(false)
  })

  it('does not put the flag back after it was taken away by hand', () => {
    const db = makeDb()
    staff.seedStaff(db)
    delete db.users[2].isStaff
    expect(staff.seedStaff(db)).toBe(false)
    expect(staff.isStaff(db, '9')).toBe(false)
  })

  it('works on a fresh seed and changes nothing else about that user', () => {
    const db = build()
    const before = JSON.stringify(db.users.find(u => u.username === staff.STAFF_USERNAME))
    expect(staff.seedStaff(db)).toBe(true)
    const user = db.users.find(u => u.username === staff.STAFF_USERNAME)
    expect(db.users.filter(u => u.isStaff)).toEqual([user])
    expect(user.hasCover).toBe(true)
    const { isStaff, ...rest } = user
    expect(JSON.stringify(rest)).toBe(before)
  })

  it('survives a database without that user', () => {
    const db = { users: [{ id: '1', username: 'ada' }] }
    expect(staff.seedStaff(db)).toBe(true)
    expect(staff.isStaff(db, '1')).toBe(false)
  })

  it('tells who is staff and reports it on the profile', () => {
    const db = makeDb()
    staff.seedStaff(db)
    expect(staff.isStaff(db, '9')).toBe(true)
    expect(staff.isStaff(db, 9)).toBe(true)
    expect(staff.isStaff(db, '1')).toBe(false)
    expect(staff.isStaff(db, null)).toBe(false)
    expect(staff.profileFields(db.users[2])).toEqual({ isStaff: true })
    expect(staff.profileFields(db.users[0])).toEqual({ isStaff: false })
  })

  it('lets staff change the roles of every category', () => {
    const db = makeDb()
    staff.seedStaff(db)
    expect(cu.canManage(db, '9', '2')).toBe(true)
    expect(cu.canManage(db, '8', '2')).toBe(false)
    expect(cu.addRole(db, '9', { userId: '8', categoryId: '2', role: 'moderator' }).status).toBe('ok')
    expect(cu.removeRole(db, '9', '2-8-moderator')).toBe('ok')
    expect(pr.addFeatured(db, '9', { userId: '8', categoryId: '2' }).status).toBe('ok')
    expect(pr.removeFeatured(db, '9', '2-8-featured')).toBe('ok')
    // staff hold no role themselves, so the profile still lists no administered category for them
    expect(cu.profileFields(db, db.users[2]).links.categories).toEqual([])
  })

  it('offers staff every category in the Community Roles form, with their own role where they have one', () => {
    const db = makeDb()
    staff.seedStaff(db)
    expect(pr.administeredCategories(db, '9', CATEGORIES).map(c => [c.slug, c.currentUserState.role])).toEqual([['art', null], ['photography', null]])
    expect(pr.administeredCategories(db, '9', CATEGORIES, 'photo').map(c => c.slug)).toEqual(['photography'])
    expect(pr.administeredCategories(db, '1', CATEGORIES).map(c => c.slug)).toEqual(['art'])
  })
})
