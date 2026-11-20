import { canAssignRoles, isRoleAdministrator, roleName, roleOf } from './category-roles'

describe('category roles', () => {
  const curator = { isStaff: false, links: { categories: ['1', '3'] } }

  it('knows who administers roles at all', () => {
    expect(isRoleAdministrator(null)).toBe(false)
    expect(isRoleAdministrator({ isStaff: false, links: { categories: [] } })).toBe(false)
    expect(isRoleAdministrator({ isStaff: null, links: null })).toBe(false)
    expect(isRoleAdministrator(curator)).toBe(true)
    expect(isRoleAdministrator({ isStaff: true, links: null })).toBe(true)
  })

  it('gives access to the listed categories only, and to staff everywhere', () => {
    expect(canAssignRoles(curator, '1')).toBe(true)
    expect(canAssignRoles(curator, '2')).toBe(false)
    expect(canAssignRoles(undefined, '1')).toBe(false)
    expect(canAssignRoles({ isStaff: true, links: null }, '2')).toBe(true)
  })

  it('names the roles', () => {
    expect(roleOf('curators')).toBe('curator')
    expect(roleOf('moderators')).toBe('moderator')
    expect(roleName('curators')).toBe('Curator')
    expect(roleName('moderators')).toBe('Moderator')
  })
})
